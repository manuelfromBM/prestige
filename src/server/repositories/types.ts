import type { AllContent, ContentInput, ContentItems, ContentKind } from "../domain/content";
import type { Appointment, AppointmentStatus, Barber, NewAppointment, Service } from "../domain/types";

// Contratos de persistencia. Los servicios solo conocen estas interfaces,
// así se puede cambiar Prisma/PostgreSQL por otra fuente sin tocar la lógica.

export interface CatalogRepository {
  // includeHidden: también los ocultos desde /admin (para nombres en el historial)
  listBarbers(opts?: { includeHidden?: boolean }): Promise<Barber[]>;
  listServices(opts?: { includeHidden?: boolean }): Promise<Service[]>;
  findBarber(id: number): Promise<Barber | null>;
  findService(id: number): Promise<Service | null>;
}

// Contenido administrable (/admin). Las listas incluyen los elementos ocultos.
export interface ContentRepository {
  listAll(): Promise<AllContent>;
  find<K extends ContentKind>(kind: K, id: number): Promise<ContentItems[K] | null>;
  create<K extends ContentKind>(kind: K, data: ContentInput<K>): Promise<ContentItems[K]>;
  update<K extends ContentKind>(kind: K, id: number, data: ContentInput<K>): Promise<ContentItems[K]>;
  remove(kind: ContentKind, id: number): Promise<void>;
  // Reasigna sortOrder según la posición de cada id
  reorder(kind: ContentKind, ids: number[]): Promise<void>;
}

export interface AppointmentFilter {
  from: string; // YYYY-MM-DD, inclusive
  to: string; // YYYY-MM-DD, inclusive
  barberId?: number;
  status?: AppointmentStatus;
}

export interface AppointmentRepository {
  list(filter: AppointmentFilter): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  create(data: NewAppointment): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  // Ejecuta `fn` de forma atómica (verificar disponibilidad + insertar)
  transaction<T>(fn: (repo: AppointmentRepository) => Promise<T>): Promise<T>;
}
