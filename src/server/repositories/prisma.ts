import type {
  Appointment as AppointmentRow,
  Barber as BarberRow,
  Prisma,
  PrismaClient,
  Service as ServiceRow,
  WorkingHours as WorkingHoursRow,
} from "@/src/generated/prisma/client";
import type {
  AllContent,
  BarberItem,
  ContentInput,
  ContentItems,
  ContentKind,
  ServiceItem,
} from "../domain/content";
import { DomainError } from "../domain/errors";
import type { Appointment, AppointmentStatus, Barber, NewAppointment, Service } from "../domain/types";
import type { AppointmentFilter, AppointmentRepository, CatalogRepository, ContentRepository } from "./types";

type Db = PrismaClient | Prisma.TransactionClient;

// Error de serialización de Postgres (40001), venga del cliente (P2034) o del driver adapter
const isWriteConflict = (err: unknown) => {
  const e = err as { code?: string; cause?: { kind?: string; originalCode?: string } };
  return e.code === "P2034" || e.cause?.kind === "TransactionWriteConflict" || e.cause?.originalCode === "40001";
};

const toSchedule = (rows: WorkingHoursRow[]) =>
  rows
    .map((h) => ({
      weekday: h.weekday,
      startMinute: h.startMinute,
      endMinute: h.endMinute,
      breakStart: h.breakStart,
      breakEnd: h.breakEnd,
    }))
    .sort((a, b) => a.weekday - b.weekday);

const toBarber = (row: BarberRow & { schedule: WorkingHoursRow[] }): Barber => ({
  id: row.id,
  name: row.name,
  role: row.role,
  imageUrl: row.imageUrl,
  schedule: toSchedule(row.schedule),
});

type Counted = { _count: { appointments: number } };

const toServiceItem = ({ _count, ...row }: ServiceRow & Counted): ServiceItem => ({
  ...row,
  appointmentCount: _count.appointments,
});

const toBarberItem = (row: BarberRow & Counted & { schedule: WorkingHoursRow[] }): BarberItem => ({
  id: row.id,
  name: row.name,
  role: row.role,
  imageUrl: row.imageUrl,
  experienceYears: row.experienceYears,
  instagram: row.instagram,
  active: row.active,
  sortOrder: row.sortOrder,
  schedule: toSchedule(row.schedule),
  appointmentCount: row._count.appointments,
});

const toAppointment = (row: AppointmentRow): Appointment => ({
  id: row.id,
  barberId: row.barberId,
  serviceId: row.serviceId,
  date: row.date,
  startMinute: row.startMinute,
  durationMin: row.durationMin,
  price: row.price,
  status: row.status as AppointmentStatus,
  clientName: row.clientName,
  clientPhone: row.clientPhone,
  clientEmail: row.clientEmail,
  source: row.source as Appointment["source"],
  createdAt: row.createdAt.toISOString(),
});

export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly db: PrismaClient) {}

  async listBarbers({ includeHidden = false } = {}) {
    const rows = await this.db.barber.findMany({
      where: includeHidden ? undefined : { active: true },
      include: { schedule: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return rows.map(toBarber);
  }

  async listServices({ includeHidden = false } = {}): Promise<Service[]> {
    return this.db.service.findMany({
      where: includeHidden ? undefined : { active: true },
      select: { id: true, name: true, durationMin: true, price: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  }

  async findBarber(id: number) {
    const row = await this.db.barber.findFirst({ where: { id, active: true }, include: { schedule: true } });
    return row ? toBarber(row) : null;
  }

  async findService(id: number): Promise<Service | null> {
    return this.db.service.findFirst({
      where: { id, active: true },
      select: { id: true, name: true, durationMin: true, price: true },
    });
  }
}

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(
    private readonly db: Db,
    private readonly root?: PrismaClient,
  ) {}

  async list({ from, to, barberId, status }: AppointmentFilter) {
    const rows = await this.db.appointment.findMany({
      where: { date: { gte: from, lte: to }, barberId, status },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    });
    return rows.map(toAppointment);
  }

  async findById(id: string) {
    const row = await this.db.appointment.findUnique({ where: { id } });
    return row ? toAppointment(row) : null;
  }

  async create(data: NewAppointment) {
    return toAppointment(await this.db.appointment.create({ data }));
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const row = await this.db.appointment.update({
      where: { id },
      data: { status, cancelledAt: status === "CANCELLED" ? new Date() : null },
    });
    return toAppointment(row);
  }

  async transaction<T>(fn: (repo: AppointmentRepository) => Promise<T>): Promise<T> {
    if (!this.root) return fn(this);
    // Serializable: dos reservas simultáneas no pueden tomar la misma hora.
    // Si Postgres aborta por conflicto se reintenta: la nueva vuelta ve la reserva ganadora
    // y elige otro barbero o responde CONFLICT.
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.root.$transaction((tx) => fn(new PrismaAppointmentRepository(tx)), {
          isolationLevel: "Serializable",
          // Neon está en otra región: margen para la latencia de red
          maxWait: 10_000,
          timeout: 15_000,
        });
      } catch (err) {
        if (!isWriteConflict(err)) throw err;
        if (attempt >= 3) {
          throw new DomainError("CONFLICT", "Esa hora ya no está disponible. Elige otra, por favor.");
        }
      }
    }
  }
}

const ORDER = [{ sortOrder: "asc" as const }, { id: "asc" as const }];
const COUNT = { _count: { select: { appointments: true } } };

export class PrismaContentRepository implements ContentRepository {
  constructor(private readonly db: PrismaClient) {}

  async listAll(): Promise<AllContent> {
    const [services, barbers, promotions, products] = await Promise.all([
      this.db.service.findMany({ orderBy: ORDER, include: COUNT }),
      this.db.barber.findMany({ orderBy: ORDER, include: { ...COUNT, schedule: true } }),
      this.db.promotion.findMany({ orderBy: ORDER }),
      this.db.product.findMany({ orderBy: ORDER }),
    ]);
    return { services: services.map(toServiceItem), barbers: barbers.map(toBarberItem), promotions, products };
  }

  async find<K extends ContentKind>(kind: K, id: number): Promise<ContentItems[K] | null> {
    switch (kind) {
      case "services": {
        const row = await this.db.service.findUnique({ where: { id }, include: COUNT });
        return (row && toServiceItem(row)) as ContentItems[K] | null;
      }
      case "barbers": {
        const row = await this.db.barber.findUnique({ where: { id }, include: { ...COUNT, schedule: true } });
        return (row && toBarberItem(row)) as ContentItems[K] | null;
      }
      case "promotions":
        return (await this.db.promotion.findUnique({ where: { id } })) as ContentItems[K] | null;
      default:
        return (await this.db.product.findUnique({ where: { id } })) as ContentItems[K] | null;
    }
  }

  async create<K extends ContentKind>(kind: K, data: ContentInput<K>): Promise<ContentItems[K]> {
    const sortOrder = (await this.maxSortOrder(kind)) + 1;
    const id = await this.write(kind, null, data, sortOrder);
    return (await this.find(kind, id))!;
  }

  async update<K extends ContentKind>(kind: K, id: number, data: ContentInput<K>): Promise<ContentItems[K]> {
    await this.write(kind, id, data);
    return (await this.find(kind, id))!;
  }

  async remove(kind: ContentKind, id: number) {
    const where = { where: { id } };
    if (kind === "services") await this.db.service.delete(where);
    else if (kind === "barbers") await this.db.barber.delete(where);
    else if (kind === "promotions") await this.db.promotion.delete(where);
    else await this.db.product.delete(where);
  }

  async reorder(kind: ContentKind, ids: number[]) {
    await this.db.$transaction(
      ids.map((id, sortOrder) => {
        const args = { where: { id }, data: { sortOrder } };
        if (kind === "services") return this.db.service.update(args);
        if (kind === "barbers") return this.db.barber.update(args);
        if (kind === "promotions") return this.db.promotion.update(args);
        return this.db.product.update(args);
      }),
    );
  }

  // Crea (id = null) o actualiza un elemento y devuelve su id
  private async write(kind: ContentKind, id: number | null, input: ContentInput<ContentKind>, sortOrder?: number) {
    try {
      switch (kind) {
        case "services": {
          const data = { ...(input as ContentInput<"services">), sortOrder };
          const row = id === null
            ? await this.db.service.create({ data })
            : await this.db.service.update({ where: { id }, data });
          return row.id;
        }
        case "barbers": {
          const { schedule, ...rest } = input as ContentInput<"barbers">;
          const data = { ...rest, sortOrder };
          // El horario se reemplaza completo en la misma escritura (atómico)
          const row = id === null
            ? await this.db.barber.create({ data: { ...data, schedule: { create: schedule } } })
            : await this.db.barber.update({
                where: { id },
                data: { ...data, schedule: { deleteMany: {}, create: schedule } },
              });
          return row.id;
        }
        case "promotions": {
          const data = { ...(input as ContentInput<"promotions">), sortOrder };
          const row = id === null
            ? await this.db.promotion.create({ data })
            : await this.db.promotion.update({ where: { id }, data });
          return row.id;
        }
        default: {
          const data = { ...(input as ContentInput<"products">), sortOrder };
          const row = id === null
            ? await this.db.product.create({ data })
            : await this.db.product.update({ where: { id }, data });
          return row.id;
        }
      }
    } catch (err) {
      // Nombre de servicio repetido (@unique)
      if ((err as { code?: string }).code === "P2002") {
        throw new DomainError("CONFLICT", "Ya existe un servicio con ese nombre.");
      }
      throw err;
    }
  }

  private async maxSortOrder(kind: ContentKind) {
    const args = { _max: { sortOrder: true as const } };
    const result =
      kind === "services"
        ? await this.db.service.aggregate(args)
        : kind === "barbers"
          ? await this.db.barber.aggregate(args)
          : kind === "promotions"
            ? await this.db.promotion.aggregate(args)
            : await this.db.product.aggregate(args);
    return result._max.sortOrder ?? -1;
  }
}
