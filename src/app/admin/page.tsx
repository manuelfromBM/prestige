import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AdminLogin from "@/src/components/admin/AdminLogin";
import AdminPanel from "@/src/components/admin/AdminPanel";
import { ADMIN_COOKIE, adminMode, isAdminSession } from "@/src/server/admin-auth";
import { contentService } from "@/src/server/container";

export const metadata: Metadata = {
  title: "Administración · Prestige Barber",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Leer la cookie primero hace que la página se evalúe en cada visita: si no,
  // Next la prerenderiza en el build con el ADMIN_KEY de ese momento.
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  const mode = adminMode();
  // En producción sin ADMIN_KEY el panel no existe (404)
  if (mode === "disabled") notFound();
  if (!isAdminSession(session)) return <AdminLogin />;

  const content = await contentService.listAll();
  return <AdminPanel initialContent={content} requiresLogin={mode === "key"} />;
}
