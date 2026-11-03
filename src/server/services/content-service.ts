import type { ContentInput, ContentKind } from "../domain/content";
import { DomainError } from "../domain/errors";
import type { WorkingHours } from "../domain/types";
import type { ContentRepository } from "../repositories/types";

type Body = Record<string, unknown>;

export const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MAX_PRICE = 1_000_000;

const KIND_LABEL: Record<ContentKind, string> = {
  services: "El servicio",
  barbers: "El barbero",
  promotions: "La promoción",
  products: "El producto",
};

function invalid(message: string): never {
  throw new DomainError("VALIDATION", message);
}

// "La duración" → "Completa la duración." / "Jueves: la hora de inicio" → "Jueves: completa la hora de inicio."
function missing(label: string): never {
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  const [prefix, rest] = label.includes(": ") ? label.split(": ") : [null, label];
  return invalid(prefix ? `${prefix}: completa ${lower(rest)}.` : `Completa ${lower(rest)}.`);
}

// ── Lectores de campos ─────────────────────────────────────────────

function text(body: Body, key: string, label: string, { max = 120, optional = false } = {}) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  if (!value && !optional) missing(label);
  if (value.length > max) invalid(`${label} admite hasta ${max} caracteres.`);
  return value;
}

function integer(body: Body, key: string, label: string, min: number, max: number): number;
function integer(body: Body, key: string, label: string, min: number, max: number, optional: true): number | null;
function integer(body: Body, key: string, label: string, min: number, max: number, optional = false) {
  const raw = body[key];
  if (raw === null || raw === undefined || raw === "") {
    if (optional) return null;
    missing(label);
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    invalid(`${label} debe ser un número entero entre ${min.toLocaleString("es-CL")} y ${max.toLocaleString("es-CL")}.`);
  }
  return value;
}

// URL https o ruta de la carpeta /public
function link(body: Body, key: string, label: string, optional = false) {
  const value = text(body, key, label, { max: 500, optional });
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    if (new URL(value).protocol === "https:") return value;
  } catch {}
  return invalid(`${label} debe ser un enlace que empiece con https:// (o una ruta de /public).`);
}

const visible = (body: Body) => body.active !== false;

function schedule(raw: unknown): WorkingHours[] {
  if (!Array.isArray(raw)) invalid("El horario no es válido.");
  const seen = new Set<number>();
  return raw
    .map((row: Body) => {
      const weekday = integer(row, "weekday", "El día", 0, 6);
      const day = WEEKDAY_NAMES[weekday];
      if (seen.has(weekday)) invalid(`${day} aparece dos veces en el horario.`);
      seen.add(weekday);
      const startMinute = integer(row, "startMinute", `${day}: la hora de inicio`, 0, 1440);
      const endMinute = integer(row, "endMinute", `${day}: la hora de término`, 0, 1440);
      const breakStart = integer(row, "breakStart", `${day}: el inicio de la colación`, 0, 1440, true);
      const breakEnd = integer(row, "breakEnd", `${day}: el fin de la colación`, 0, 1440, true);
      if (startMinute >= endMinute) invalid(`${day}: la hora de término debe ser posterior a la de inicio.`);
      if ((breakStart === null) !== (breakEnd === null)) {
        invalid(`${day}: completa el inicio y el fin de la colación, o deja ambos vacíos.`);
      }
      if (breakStart !== null && breakEnd !== null && !(startMinute < breakStart && breakStart < breakEnd && breakEnd < endMinute)) {
        invalid(`${day}: la colación debe quedar dentro del horario de trabajo.`);
      }
      return { weekday, startMinute, endMinute, breakStart, breakEnd };
    })
    .sort((a, b) => a.weekday - b.weekday);
}

// ── Validación por tipo de contenido ──────────────────────────────

const parsers: { [K in ContentKind]: (body: Body) => ContentInput<K> } = {
  services: (b) => {
    const durationMin = integer(b, "durationMin", "La duración", 5, 480);
    if (durationMin % 5 !== 0) invalid("La duración debe ser múltiplo de 5 minutos.");
    return {
      name: text(b, "name", "El nombre", { max: 60 }),
      description: text(b, "description", "La descripción", { max: 200 }),
      imageUrl: link(b, "imageUrl", "La imagen")!,
      tag: text(b, "tag", "La etiqueta", { max: 24, optional: true }) || null,
      durationMin,
      price: integer(b, "price", "El precio", 0, MAX_PRICE),
      active: visible(b),
    };
  },
  barbers: (b) => ({
    name: text(b, "name", "El nombre", { max: 60 }),
    role: text(b, "role", "La especialidad", { max: 60 }),
    imageUrl: link(b, "imageUrl", "La foto")!,
    experienceYears: integer(b, "experienceYears", "Los años de experiencia", 0, 70, true),
    instagram: link(b, "instagram", "El Instagram", true),
    schedule: schedule(b.schedule),
    active: visible(b),
  }),
  promotions: (b) => ({
    tag: text(b, "tag", "La etiqueta", { max: 30 }),
    title: text(b, "title", "El título", { max: 60 }),
    description: text(b, "description", "La descripción", { max: 200 }),
    price: integer(b, "price", "El precio", 0, MAX_PRICE, true),
    featured: b.featured === true,
    message: text(b, "message", "El mensaje de WhatsApp", { max: 200 }),
    active: visible(b),
  }),
  products: (b) => ({
    name: text(b, "name", "El nombre", { max: 60 }),
    category: text(b, "category", "La categoría", { max: 40 }),
    price: integer(b, "price", "El precio", 0, MAX_PRICE),
    imageUrl: link(b, "imageUrl", "La imagen")!,
    active: visible(b),
  }),
};

function asBody(input: unknown): Body {
  if (!input || typeof input !== "object" || Array.isArray(input)) invalid("Datos inválidos.");
  return input as Body;
}

export function createContentService({ content }: { content: ContentRepository }) {
  async function mustFind<K extends ContentKind>(kind: K, id: number) {
    const item = Number.isInteger(id) ? await content.find(kind, id) : null;
    if (!item) throw new DomainError("NOT_FOUND", `${KIND_LABEL[kind]} no existe.`);
    return item;
  }

  return {
    listAll: () => content.listAll(),

    create<K extends ContentKind>(kind: K, input: unknown) {
      return content.create(kind, parsers[kind](asBody(input)));
    },

    async update<K extends ContentKind>(kind: K, id: number, input: unknown) {
      await mustFind(kind, id);
      return content.update(kind, id, parsers[kind](asBody(input)));
    },

    async remove(kind: ContentKind, id: number) {
      const item = await mustFind(kind, id);
      // Servicios y barberos con citas se ocultan en vez de borrarse, para no perder el historial
      if ("appointmentCount" in item && item.appointmentCount > 0) {
        throw new DomainError(
          "CONFLICT",
          `${KIND_LABEL[kind]} tiene ${item.appointmentCount} citas en el historial y no se puede eliminar. Ocúltalo para que deje de aparecer.`,
        );
      }
      await content.remove(kind, id);
    },

    async reorder(kind: ContentKind, ids: unknown) {
      const current = (await content.listAll())[kind].map((i) => i.id);
      const valid =
        Array.isArray(ids) &&
        ids.length === current.length &&
        new Set(ids).size === ids.length &&
        ids.every((id) => current.includes(id));
      if (!valid) invalid("El nuevo orden no coincide con los elementos actuales. Recarga la página.");
      await content.reorder(kind, ids as number[]);
    },

    // Lo que muestra el sitio público: solo lo visible y sin datos internos
    async getSiteContent() {
      const all = await content.listAll();
      return {
        services: all.services
          .filter((s) => s.active)
          .map(({ id, name, description, imageUrl, tag, durationMin, price }) => ({
            id, name, description, imageUrl, tag, durationMin, price,
          })),
        barbers: all.barbers
          .filter((b) => b.active)
          .map(({ id, name, role, imageUrl, experienceYears, instagram }) => ({
            id, name, role, imageUrl, experienceYears, instagram,
          })),
        promotions: all.promotions
          .filter((p) => p.active)
          .map(({ id, tag, title, description, price, featured, message }) => ({
            id, tag, title, description, price, featured, message,
          })),
        products: all.products
          .filter((p) => p.active)
          .map(({ id, name, category, price, imageUrl }) => ({ id, name, category, price, imageUrl })),
      };
    },
  };
}

export type ContentService = ReturnType<typeof createContentService>;
export type SiteContent = Awaited<ReturnType<ContentService["getSiteContent"]>>;
