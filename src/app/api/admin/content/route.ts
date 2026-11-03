import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, requireAdmin } from "@/src/server/admin-auth";
import { contentService } from "@/src/server/container";
import { handle } from "@/src/server/http";

// GET /api/admin/content → servicios, barberos, promociones y productos (incluye ocultos)
export async function GET(request: NextRequest) {
  return handle(async () => {
    requireAdmin(request.cookies.get(ADMIN_COOKIE)?.value);
    return contentService.listAll();
  });
}
