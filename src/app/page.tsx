import Navbar from "@/src/components/navbar/Navbar";
import Hero from "@/src/components/sections/hero/Hero";
import Benefits from "@/src/components/sections/benefits/Benefits";
import Services from "@/src/components/sections/services/Services";
import ImageAdvisory from "@/src/components/sections/imageadvisory/ImageAdvisory";
import Gallery from "@/src/components/sections/gallery/Gallery";
import Process from "@/src/components/sections/process/Process";
import Team from "@/src/components/sections/team/Team";
import Testimonials from "@/src/components/sections/testimonials/Testimonials";
import Trends from "@/src/components/sections/trends/Trends";
import Promotions from "@/src/components/sections/promotions/Promotions";
import Products from "@/src/components/sections/products/Products";
import About from "@/src/components/sections/about/About";
import Location from "@/src/components/sections/location/Location";
import Faq from "@/src/components/sections/faq/Faq";
import FinalCta from "@/src/components/sections/finalcta/FinalCta";
import Footer from "@/src/components/sections/footer/Footer";
import WhatsAppButton from "@/src/components/whatsapbtn/BtnWasap";
import { connection } from "next/server";
import { contentService } from "@/src/server/container";

export default async function HomePage() {
  // Se renderiza en cada visita para mostrar al tiro los cambios hechos en /admin
  // (better-sqlite3 es síncrono: sin connection() la consulta quedaría congelada en el build)
  await connection();
  const content = await contentService.getSiteContent();

  return (
    <main>
      <Navbar />
      <Hero />
      <Benefits />
      <Services services={content.services} />
      <ImageAdvisory />
      <Gallery />
      <Process />
      <Team barbers={content.barbers} />
      <Testimonials />
      <Trends />
      <Promotions promos={content.promotions} />
      <Products products={content.products} />
      <About />
      <Location />
      <Faq />
      <FinalCta />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
