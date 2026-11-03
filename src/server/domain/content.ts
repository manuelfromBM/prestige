import type { WorkingHours } from "./types";

// Contenido administrable desde /admin. `active` = visible en el sitio y en la agenda.

export const CONTENT_KINDS = ["services", "barbers", "promotions", "products"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export const isContentKind = (value: string): value is ContentKind =>
  (CONTENT_KINDS as readonly string[]).includes(value);

interface Sortable {
  id: number;
  active: boolean;
  sortOrder: number;
}

export interface ServiceItem extends Sortable {
  name: string;
  description: string;
  imageUrl: string;
  tag: string | null;
  durationMin: number;
  price: number; // CLP
  appointmentCount: number;
}

export interface BarberItem extends Sortable {
  name: string;
  role: string;
  imageUrl: string;
  experienceYears: number | null;
  instagram: string | null;
  schedule: WorkingHours[];
  appointmentCount: number;
}

export interface PromotionItem extends Sortable {
  tag: string;
  title: string;
  description: string;
  price: number | null; // CLP
  featured: boolean;
  message: string;
}

export interface ProductItem extends Sortable {
  name: string;
  category: string;
  price: number; // CLP
  imageUrl: string;
}

export interface ContentItems {
  services: ServiceItem;
  barbers: BarberItem;
  promotions: PromotionItem;
  products: ProductItem;
}

// Lo que se puede editar de cada tipo (sin id, orden ni campos calculados)
export type ContentInput<K extends ContentKind> = Omit<ContentItems[K], "id" | "sortOrder" | "appointmentCount">;

export type AllContent = { [K in ContentKind]: ContentItems[K][] };
