import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { DomainError } from "./domain/errors";

// Acceso a /admin:
//   - ADMIN_KEY definida → hay que iniciar sesión con esa clave (cookie httpOnly).
//   - Sin ADMIN_KEY en desarrollo → abierto, para trabajar en local.
//   - Sin ADMIN_KEY en producción → deshabilitado (404), para no dejar el panel público por olvido.
export const ADMIN_COOKIE = "prestige_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;

export type AdminMode = "open" | "key" | "disabled";

export function adminMode(): AdminMode {
  if (process.env.ADMIN_KEY) return "key";
  return process.env.NODE_ENV === "production" ? "disabled" : "open";
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function checkAdminKey(candidate: string) {
  const key = process.env.ADMIN_KEY;
  return Boolean(key) && timingSafeEqual(digest(candidate), digest(key!));
}

// Valor de la cookie. Deriva de la clave: al cambiar ADMIN_KEY se cierran todas las sesiones.
export function adminSessionToken() {
  return createHash("sha256").update(`prestige-admin:${process.env.ADMIN_KEY}`).digest("hex");
}

export function isAdminSession(cookieValue: string | undefined) {
  const mode = adminMode();
  if (mode !== "key") return mode === "open";
  return Boolean(cookieValue) && timingSafeEqual(digest(cookieValue!), digest(adminSessionToken()));
}

export function requireAdmin(cookieValue: string | undefined) {
  if (adminMode() === "disabled") throw new DomainError("NOT_FOUND", "No encontrado.");
  if (!isAdminSession(cookieValue)) {
    throw new DomainError("UNAUTHORIZED", "Inicia sesión en el panel de administración.");
  }
}
