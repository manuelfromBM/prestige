import type { Metadata } from "next";
import Booking from "@/src/components/booking/Booking";
import { catalogService } from "@/src/server/container";

export const metadata: Metadata = {
  title: "Agenda tu hora · Prestige Barber",
  description: "Elige servicio, barbero y una de las horas disponibles. Reserva en menos de un minuto.",
};

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const [{ servicio }, catalog] = await Promise.all([searchParams, catalogService.getCatalog()]);
  const serviceId = Number(servicio);
  return <Booking catalog={catalog} initialServiceId={Number.isInteger(serviceId) ? serviceId : undefined} />;
}
