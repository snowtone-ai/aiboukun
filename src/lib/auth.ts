import NextAuth, { type Account as AuthAccount, type DefaultSession } from "next-auth";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma/client";
import { setAuthSessionResolver } from "@/lib/api/middleware";
import { encryptToken } from "@/lib/crypto/token-encryption";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    organizationId?: string | null;
    role?: string | null;
  }
}

const googleScopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/business.manage",
].join(" ");

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET;

const baseAdapter = PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]) as Adapter;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  adapter: {
    ...baseAdapter,
    linkAccount(account) {
      return baseAdapter.linkAccount?.(stripSensitiveAccountTokens(account));
    },
  },
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          scope: googleScopes,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        const membership = await ensureMembership(user.id, user.email);
        await persistGoogleConnection(user.id, membership.organizationId, account);
        await clearAuthAccountTokens(account);
      }

      return true;
    },
    async session({ session, user }) {
      const membership = await ensureMembership(user.id, user.email ?? session.user.email);

      session.user.id = user.id;
      session.organizationId = membership.organizationId;
      session.role = membership.role;

      return session;
    },
  },
});

setAuthSessionResolver(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    organizationId: session.organizationId,
    role: session.role,
  };
});

async function ensureMembership(userId: string, email?: string | null) {
  const existing = await prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { id: "asc" },
  });

  if (existing) {
    return existing;
  }

  try {
    const organization = await prisma.organization.create({
      data: {
        name: `${email ?? "My"} organization`,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    });

    return organization.members[0];
  } catch (error) {
    if (isPrismaKnownRequestError(error, "P2002")) {
      const createdByConcurrentSession = await prisma.organizationMember.findFirst({
        where: { userId },
        orderBy: { id: "asc" },
      });

      if (createdByConcurrentSession) {
        return createdByConcurrentSession;
      }
    }

    throw error;
  }
}

function stripSensitiveAccountTokens(account: AdapterAccount): AdapterAccount {
  return {
    ...account,
    access_token: undefined,
    refresh_token: undefined,
    id_token: undefined,
  };
}

async function persistGoogleConnection(userId: string, organizationId: string, account: AuthAccount) {
  if (!account.access_token) {
    return;
  }

  const refreshTokenEnc = account.refresh_token ? encryptToken(account.refresh_token) : undefined;
  const scopes = account.scope?.split(" ").filter(Boolean) ?? googleScopes.split(" ");

  await prisma.googleConnection.upsert({
    where: {
      organizationId_userId_provider: {
        organizationId,
        userId,
        provider: "google",
      },
    },
    update: {
      accessTokenEnc: encryptToken(account.access_token),
      refreshTokenEnc,
      expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
      scopes,
    },
    create: {
      organizationId,
      userId,
      provider: "google",
      accessTokenEnc: encryptToken(account.access_token),
      refreshTokenEnc,
      expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
      scopes,
    },
  });
}

async function clearAuthAccountTokens(account: AuthAccount) {
  if (!account.providerAccountId) {
    return;
  }

  await prisma.account.updateMany({
    where: {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    },
    data: {
      access_token: null,
      refresh_token: null,
      id_token: null,
    },
  });
}

function isPrismaKnownRequestError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === code;
}
