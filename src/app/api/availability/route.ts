import type { NextRequest } from "next/server";
import { bookingService } from "@/src/server/container";
import { DomainError } from "@/src/server/domain/errors";
import { handle } from "@/src/server/http";

// GET /api/availability?serviceId=1
export async function GET(request: NextRequest) {
  return handle(async () => {
    const serviceId = Number(request.nextUrl.searchParams.get("serviceId"));
    if (!Number.isInteger(serviceId)) throw new DomainError("VALIDATION", "serviceId es obligatorio.");
    return bookingService.getAvailability(serviceId);
  });
}
