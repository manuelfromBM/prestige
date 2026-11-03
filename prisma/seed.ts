// Carga datos de ejemplo: catálogo, contenido del inicio, horarios y citas simuladas
// (los últimos 200 días como historial y los próximos 14 como agenda).
// Ejecutar con: npm run db:seed  (borra y vuelve a crear los datos)

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, dateRange, shopNow, weekdayOf } from "../src/server/domain/clock";
import { BOOKING_WINDOW_DAYS, SLOT_MINUTES } from "../src/server/domain/schedule";
import { barbers, products, promotions, services } from "./content";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" }),
});

const firstNames = ["Tomás", "Joaquín", "Vicente", "Martín", "Agustín", "Lucas", "Felipe", "Sebastián", "Nicolás", "Benjamín", "Maximiliano", "Gabriel", "Francisco", "Javier", "Pablo", "Andrés", "Rodrigo", "Camilo", "Bastián", "Alonso"];
const lastNames = ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva", "Martínez", "Sepúlveda", "Morales", "Rodríguez", "López", "Fuentes", "Hernández"];

// Pseudoaleatorio con semilla fija: el seed genera siempre los mismos datos
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261103);
const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

function pickWeighted<T>(list: T[], weight: (item: T) => number) {
  const total = list.reduce((sum, item) => sum + weight(item), 0);
  let r = rand() * total;
  for (const item of list) {
    r -= weight(item);
    if (r < 0) return item;
  }
  return list[list.length - 1];
}

const plain = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const clients = Array.from({ length: 140 }, () => {
  const first = pick(firstNames);
  const last = pick(lastNames);
  return {
    name: `${first} ${last}`,
    email: `${plain(first)}.${plain(last)}${Math.floor(rand() * 90 + 10)}@ejemplo.com`,
    phone: `+56 9 ${Math.floor(rand() * 9000 + 1000)} ${Math.floor(rand() * 9000 + 1000)}`,
  };
});

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.service.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();

  await prisma.promotion.createMany({ data: promotions.map((p, i) => ({ ...p, sortOrder: i })) });
  await prisma.product.createMany({ data: products.map((p, i) => ({ ...p, sortOrder: i })) });

  const createdServices = await Promise.all(
    services.map((s, i) =>
      prisma.service.create({
        data: {
          id: i + 1,
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
          tag: s.tag,
          durationMin: s.durationMin,
          price: s.price,
          sortOrder: i,
        },
      }),
    ),
  );
  const weightOf = new Map(services.map((s) => [s.name, s.weight]));

  const today = shopNow();
  const days = dateRange(addDays(today.date, -200), 200 + BOOKING_WINDOW_DAYS);
  const appointments = [];

  for (const [i, b] of barbers.entries()) {
    const [start, end, breakStart, breakEnd] = b.hours;
    const barber = await prisma.barber.create({
      data: {
        id: i + 1,
        name: b.name,
        role: b.role,
        imageUrl: b.imageUrl,
        experienceYears: b.experienceYears,
        sortOrder: i,
        schedule: {
          create: b.days.map((weekday) => ({ weekday, startMinute: start, endMinute: end, breakStart, breakEnd })),
        },
      },
    });

    for (const date of days) {
      if (!b.days.includes(weekdayOf(date))) continue;
      // Los sábados hay más movimiento
      const occupancy = weekdayOf(date) === 6 ? b.occupancy + 0.15 : b.occupancy;

      for (let t = start; t < end; ) {
        if (t >= breakStart && t < breakEnd) {
          t = breakEnd;
          continue;
        }
        const limit = (t < breakStart ? breakStart : end) - t;
        // Los servicios de su especialidad pesan el triple en la agenda de cada barbero
        const fitting = createdServices.filter((s) => s.durationMin <= limit);
        if (fitting.length === 0 || rand() >= occupancy) {
          t += SLOT_MINUTES;
          continue;
        }
        const service = pickWeighted(
          fitting,
          (s) => (weightOf.get(s.name) ?? 1) * (b.specialties.includes(s.name) ? 3 : 1),
        );
        const blocks = Math.ceil(service.durationMin / SLOT_MINUTES);
        const client = pick(clients);
        appointments.push({
          barberId: barber.id,
          serviceId: service.id,
          date,
          startMinute: t,
          durationMin: service.durationMin,
          price: service.price,
          status: rand() < 0.07 ? "CANCELLED" : "CONFIRMED",
          clientName: client.name,
          clientPhone: client.phone,
          clientEmail: client.email,
          source: "SEED",
        });
        t += blocks * SLOT_MINUTES;
      }
    }
  }

  await prisma.appointment.createMany({ data: appointments });
  console.log(
    `Seed listo: ${createdServices.length} servicios, ${barbers.length} barberos, ${promotions.length} promociones, ${products.length} productos, ${appointments.length} citas.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
