// next/image solo optimiza los dominios declarados en next.config.ts.
// Las imágenes cargadas desde /admin pueden venir de cualquier sitio: esas se muestran tal cual.
const OPTIMIZED_HOSTS = ["images.unsplash.com"];

export function isUnoptimized(src: string) {
  if (src.startsWith("/")) return false;
  try {
    return !OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return true;
  }
}
