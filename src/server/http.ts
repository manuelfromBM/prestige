import { DomainError, type DomainErrorCode } from "./domain/errors";

const STATUS: Record<DomainErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

// Ejecuta un handler y traduce los errores de dominio a respuestas HTTP
export async function handle<T>(fn: () => Promise<T>, init?: ResponseInit) {
  try {
    return Response.json(await fn(), init);
  } catch (err) {
    if (err instanceof DomainError) {
      return Response.json({ error: { code: err.code, message: err.message } }, { status: STATUS[err.code] });
    }
    console.error("[api]", err);
    return Response.json(
      { error: { code: "INTERNAL", message: "Ocurrió un error inesperado." } },
      { status: 500 },
    );
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new DomainError("VALIDATION", "El cuerpo de la solicitud no es JSON válido.");
  }
}
