import type { CatalogRepository } from "../repositories/types";

export function createCatalogService({ catalog }: { catalog: CatalogRepository }) {
  return {
    async getCatalog() {
      const [barbers, services] = await Promise.all([catalog.listBarbers(), catalog.listServices()]);
      return {
        barbers: barbers.map(({ id, name, role, imageUrl }) => ({ id, name, role, imageUrl })),
        services,
      };
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
export type Catalog = Awaited<ReturnType<CatalogService["getCatalog"]>>;
