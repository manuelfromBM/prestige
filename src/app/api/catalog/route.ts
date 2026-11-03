import { catalogService } from "@/src/server/container";
import { handle } from "@/src/server/http";

export async function GET() {
  return handle(() => catalogService.getCatalog());
}
