import type { NextRequest } from "next/server";
import { canViewDashboard, metricsService } from "@/src/server/container";
import { DomainError } from "@/src/server/domain/errors";
import { handle } from "@/src/server/http";
import { METRIC_PERIODS } from "@/src/server/services/metrics-service";

// GET /api/metrics?days=30&barberId=2&key=...
export async function GET(request: NextRequest) {
  return handle(async () => {
    const params = request.nextUrl.searchParams;
    if (!canViewDashboard(params.get("key") ?? request.headers.get("x-dashboard-key"))) {
      throw new DomainError("UNAUTHORIZED", "Clave del panel inválida.");
    }
    const days = Number(params.get("days") ?? 30);
    if (!METRIC_PERIODS.includes(days as (typeof METRIC_PERIODS)[number])) {
      throw new DomainError("VALIDATION", `days debe ser uno de: ${METRIC_PERIODS.join(", ")}.`);
    }
    const barberId = params.get("barberId");
    return metricsService.getDashboard({ days, barberId: barberId ? Number(barberId) : null });
  });
}
