import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, requireAdmin } from "@/src/server/admin-auth";
import { contentService } from "@/src/server/container";
import { isContentKind } from "@/src/server/domain/content";
import { DomainError } from "@/src/server/domain/errors";
import { handle, readJson } from "@/src/server/http";

type Ctx = RouteContext<"/api/admin/[kind]">;

async function resolveKind(request: NextRequest, ctx: Ctx) {
  requireAdmin(request.cookies.get(ADMIN_COOKIE)?.value);
  const { kind } = await ctx.params;
  if (!isContentKind(kind)) throw new DomainError("NOT_FOUND", "Tipo de contenido desconocido.");
  return kind;
}

// POST /api/admin/:kind → crea un elemento
export async function POST(request: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const kind = await resolveKind(request, ctx);
    return { item: await contentService.create(kind, await readJson(request)) };
  }, { status: 201 });
}

// PATCH /api/admin/:kind { ids } → cambia el orden en que aparecen
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const kind = await resolveKind(request, ctx);
    const { ids } = await readJson<{ ids?: unknown }>(request);
    await contentService.reorder(kind, ids);
    return { ok: true };
  });
}
