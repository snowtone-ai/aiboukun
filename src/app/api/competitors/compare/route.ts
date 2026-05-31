import { CompetitorAgent } from "@/lib/agents/competitor-agent";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { competitorCompareSchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      competitorCompareSchema,
      (_request, context) => new CompetitorAgent().compare({ organizationId: context.organizationId!, storeId: context.input.storeId }),
      "query",
    ),
  ),
);
