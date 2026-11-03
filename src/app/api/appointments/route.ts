import { bookingService } from "@/src/server/container";
import { handle, readJson } from "@/src/server/http";
import type { CreateAppointmentInput } from "@/src/server/services/booking-service";

// POST /api/appointments
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson<Partial<CreateAppointmentInput>>(request);
    return bookingService.createAppointment({
      serviceId: Number(body.serviceId),
      barberId: body.barberId == null ? null : Number(body.barberId),
      date: String(body.date ?? ""),
      startMinute: Number(body.startMinute),
      clientName: String(body.clientName ?? ""),
      clientPhone: String(body.clientPhone ?? ""),
      clientEmail: String(body.clientEmail ?? ""),
    });
  }, { status: 201 });
}
