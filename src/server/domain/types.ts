// Modelos de dominio. No dependen de Prisma ni de Next: los repositorios
// traducen desde/hacia la base de datos y las rutas API los exponen como JSON.

export interface WorkingHours {
  weekday: number; // 0 = domingo … 6 = sábado
  startMinute: number;
  endMinute: number;
  breakStart: number | null;
  breakEnd: number | null;
}

export interface Barber {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  schedule: WorkingHours[];
}

export interface Service {
  id: number;
  name: string;
  durationMin: number;
  price: number;
}

export type AppointmentStatus = "CONFIRMED" | "CANCELLED";

export interface Appointment {
  id: string;
  barberId: number;
  serviceId: number;
  date: string; // YYYY-MM-DD, hora local de la barbería
  startMinute: number;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  source: "WEB" | "SEED";
  createdAt: string; // ISO
}

export type NewAppointment = Omit<Appointment, "id" | "status" | "createdAt">;

export type EmailStatus = "sent" | "simulated" | "failed";
