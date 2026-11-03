import type { NextRequest } from "next/server";
import { bookingService } from "@/src/server/container";
import { handle } from "@/src/server/http";

// DELETE /api/appointments/:id → cancela la reserva (se conserva en el historial)
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  return handle(async () => {
    const { id } = await ctx.params;
    return { appointment: await bookingService.cancelAppointment(id) };
  });
}
