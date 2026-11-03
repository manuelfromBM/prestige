import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminMode, adminSessionToken, checkAdminKey } from "@/src/server/admin-auth";
import { DomainError } from "@/src/server/domain/errors";
import { handle, readJson } from "@/src/server/http";

// POST /api/admin/session { key } → inicia sesión en /admin (cookie httpOnly)
export async function POST(request: Request) {
  return handle(async () => {
    const mode = adminMode();
    if (mode === "disabled") throw new DomainError("NOT_FOUND", "No encontrado.");
    if (mode === "open") return { ok: true };

    const { key } = await readJson<{ key?: unknown }>(request);
    if (typeof key !== "string" || !checkAdminKey(key)) {
      throw new DomainError("UNAUTHORIZED", "Clave incorrecta.");
    }
    (await cookies()).set(ADMIN_COOKIE, adminSessionToken(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return { ok: true };
  });
}

// DELETE /api/admin/session → cierra sesión
export async function DELETE() {
  return handle(async () => {
    (await cookies()).delete(ADMIN_COOKIE);
    return { ok: true };
  });
}
