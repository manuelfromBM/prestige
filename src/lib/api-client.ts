// Cliente HTTP del frontend. La UI solo habla con la API a través de este módulo:
// para usar un backend externo basta con definir NEXT_PUBLIC_API_URL.
import type { AllContent, ContentInput, ContentItems, ContentKind } from "@/src/server/domain/content";
import type { Appointment, EmailStatus } from "@/src/server/domain/types";
import type { Availability, CreateAppointmentInput } from "@/src/server/services/booking-service";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // cookie de sesión de /admin
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? "INTERNAL",
      body?.error?.message ?? "No pudimos conectar con el servidor.",
    );
  }
  return body as T;
}

export const api = {
  getAvailability: (serviceId: number) =>
    request<Availability>(`/api/availability?serviceId=${serviceId}`, { cache: "no-store" }),

  createAppointment: (input: CreateAppointmentInput) =>
    request<{ appointment: Appointment; emailStatus: EmailStatus }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  cancelAppointment: (id: string) =>
    request<{ appointment: Appointment }>(`/api/appointments/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // ── Administración (/admin) ──
  adminLogin: (key: string) =>
    request<{ ok: true }>("/api/admin/session", { method: "POST", body: JSON.stringify({ key }) }),

  adminLogout: () => request<{ ok: true }>("/api/admin/session", { method: "DELETE" }),

  getAdminContent: () => request<AllContent>("/api/admin/content", { cache: "no-store" }),

  saveContent: <K extends ContentKind>(kind: K, id: number | null, data: ContentInput<K>) =>
    request<{ item: ContentItems[K] }>(id === null ? `/api/admin/${kind}` : `/api/admin/${kind}/${id}`, {
      method: id === null ? "POST" : "PUT",
      body: JSON.stringify(data),
    }),

  deleteContent: (kind: ContentKind, id: number) =>
    request<{ ok: true }>(`/api/admin/${kind}/${id}`, { method: "DELETE" }),

  reorderContent: (kind: ContentKind, ids: number[]) =>
    request<{ ok: true }>(`/api/admin/${kind}`, { method: "PATCH", body: JSON.stringify({ ids }) }),
};
