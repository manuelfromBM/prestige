import "server-only";
import { prisma } from "./db";
import { PrismaAppointmentRepository, PrismaCatalogRepository, PrismaContentRepository } from "./repositories/prisma";
import { createBookingService } from "./services/booking-service";
import { createCatalogService } from "./services/catalog-service";
import { createContentService } from "./services/content-service";
import { ConsoleMailer, ResendMailer } from "./services/mailer";
import { createMetricsService } from "./services/metrics-service";

// Único lugar donde se eligen las implementaciones concretas.
// Para otra base de datos o un backend externo, cambia solo este archivo.
const catalog = new PrismaCatalogRepository(prisma);
const appointments = new PrismaAppointmentRepository(prisma, prisma);

const mailer = process.env.RESEND_API_KEY
  ? new ResendMailer(
      process.env.RESEND_API_KEY,
      process.env.BOOKING_EMAIL_FROM ?? "Prestige Barber <onboarding@resend.dev>",
    )
  : new ConsoleMailer();

export const catalogService = createCatalogService({ catalog });
export const bookingService = createBookingService({ catalog, appointments, mailer });
export const metricsService = createMetricsService({ catalog, appointments });
export const contentService = createContentService({ content: new PrismaContentRepository(prisma) });

// Si DASHBOARD_KEY está definida, el panel y /api/metrics exigen ?key=<valor>
export function canViewDashboard(key: string | null | undefined) {
  const expected = process.env.DASHBOARD_KEY;
  return !expected || key === expected;
}
