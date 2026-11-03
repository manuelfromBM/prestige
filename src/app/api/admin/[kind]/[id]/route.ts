import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, requireAdmin } from "@/src/server/admin-auth";
import { contentService } from "@/src/server/container";
import { isContentKind } from "@/src/server/domain/content";
import { DomainError } from "@/src/server/domain/errors";
import { handle, readJson } from "@/src/server/http";

type Ctx = RouteContext<"/api/admin/[kind]/[id]">;

async function resolve(request: NextRequest, ctx: Ctx) {
  requireAdmin(request.cookies.get(ADMIN_COOKIE)?.value);
  const { kind, id } = await ctx.params;
  if (!isContentKind(kind)) throw new DomainError("NOT_FOUND", "Tipo de contenido desconocido.");
  return { kind, id: Number(id) };
}

// PUT /api/admin/:kind/:id → reemplaza los datos del elemento
export async function PUT(request: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const { kind, id } = await resolve(request, ctx);
    return { item: await contentService.update(kind, id, await readJson(request)) };
  });
}

// DELETE /api/admin/:kind/:id
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const { kind, id } = await resolve(request, ctx);
    await contentService.remove(kind, id);
    return { ok: true };
  });
}
