import { AppError } from "@/lib/api/errors";
import { decryptToken } from "@/lib/crypto/token-encryption";
import { logGoogleApiCall } from "@/lib/google/call-logger";
import { withGoogleRetries } from "@/lib/google/rate-limiter";
import type { GoogleAccount, GoogleListResponse, GoogleLocation, GoogleReview } from "@/lib/google/types";
import { GoogleApiError } from "@/lib/google/types";

type ClientOptions = {
  organizationId?: string;
  accessTokenEnc: string;
  baseUrl?: string;
};

type GoogleCollection<T> = {
  accounts?: T[];
  locations?: T[];
  reviews?: T[];
  nextPageToken?: string;
};

export class GoogleBusinessProfileClient {
  private readonly accessToken: string;
  private readonly organizationId?: string;
  private readonly baseUrl: string;

  constructor(options: ClientOptions) {
    this.accessToken = decryptToken(options.accessTokenEnc);
    this.organizationId = options.organizationId;
    this.baseUrl = options.baseUrl ?? "https://mybusiness.googleapis.com/v4";
  }

  listAccounts() {
    return this.getCollection<GoogleAccount>("/accounts", "accounts");
  }

  listLocations(accountName: string) {
    return this.getCollection<GoogleLocation>(`/${encodeGoogleResourceName(accountName, /^accounts\/[^/]+$/)}/locations`, "locations");
  }

  listReviews(locationName: string, pageToken?: string) {
    const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : "";
    return this.getCollection<GoogleReview>(
      `/${encodeGoogleResourceName(locationName, /^accounts\/[^/]+\/locations\/[^/]+$/)}/reviews${query}`,
      "reviews",
    );
  }

  getReview(reviewName: string) {
    return this.request<GoogleReview>(`/${encodeReviewName(reviewName)}`, { method: "GET" });
  }

  updateReviewReply(reviewName: string, comment: string) {
    return this.request<{ name: string; comment: string; updateTime?: string }>(`/${encodeReviewName(reviewName)}/reply`, {
      method: "PUT",
      body: JSON.stringify({ comment }),
    });
  }

  deleteReviewReply(reviewName: string) {
    return this.request<Record<string, never>>(`/${encodeReviewName(reviewName)}/reply`, { method: "DELETE" });
  }

  private async getCollection<T>(path: string, key: keyof GoogleCollection<T>): Promise<GoogleListResponse<T>> {
    const response = await this.request<GoogleCollection<T>>(path, { method: "GET" });
    return {
      items: (response[key] as T[] | undefined) ?? [],
      nextPageToken: response.nextPageToken,
    };
  }

  private request<T>(path: string, init: RequestInit) {
    return withGoogleRetries<T>(async (retryCount) => {
      const endpoint = `${this.baseUrl}${path}`;
      const response = await fetch(endpoint, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

      await logGoogleApiCall({
        organizationId: this.organizationId,
        endpoint: path,
        method: init.method ?? "GET",
        statusCode: response.status,
        errorCode: response.ok ? undefined : String(response.status),
        retryCount,
      });

      if (response.ok) {
        if (response.status === 204) {
          return {} as T;
        }
        return (await response.json()) as T;
      }

      if (response.status === 401) {
        throw new GoogleApiError(401, "UNAUTHORIZED", "Google連携の再認証が必要です");
      }
      if (response.status === 403) {
        throw new GoogleApiError(403, "FORBIDDEN", "Google Business Profileの権限が不足しています");
      }
      if (response.status === 429) {
        throw new GoogleApiError(429, "RATE_LIMITED", "Google APIのレート制限に達しました");
      }

      throw new GoogleApiError(response.status, "GOOGLE_API_ERROR", `Google API error: ${response.status}`);
    }).catch((error) => {
      if (error instanceof GoogleApiError) {
        throw new AppError(error.status, error.code, error.message);
      }
      throw error;
    });
  }
}

function encodeReviewName(reviewName: string) {
  return encodeGoogleResourceName(reviewName, /^accounts\/[^/]+\/locations\/[^/]+\/reviews\/[^/]+$/);
}

function encodeGoogleResourceName(resourceName: string, pattern: RegExp) {
  if (!pattern.test(resourceName)) {
    throw new AppError(400, "BAD_REQUEST", "Invalid Google Business Profile resource name");
  }

  return resourceName.split("/").map(encodeURIComponent).join("/");
}
