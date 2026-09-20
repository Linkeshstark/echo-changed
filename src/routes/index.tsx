import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import blue from "@/assets/echo-glass-blue.jpg";
import titanium from "@/assets/echo-titanium.jpg";
import orbit from "@/assets/echo-orbit.jpg";

const images = [blue, titanium, orbit];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ECHO — Enterprise Operations" },
      { name: "description", content: "Enter the ECHO enterprise operations workspace." },
      { property: "og:title", content: "ECHO — Enterprise Operations" },
      { property: "og:description", content: "A premium enterprise operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % images.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background text-foreground">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          width={1600}
          height={1000}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[2000ms] ${active === i ? "opacity-[0.16] animate-slow-zoom" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-background/45" />

      <section className="relative z-10 flex flex-col px-6 text-center">
        <p className="eyebrow mb-8 animate-fade">Operational Headquarters</p>
        <h1 className="glyph-serif animate-enter text-[20vw] leading-[0.9] tracking-[0.04em] text-foreground md:text-[13rem]">
          ECHO
        </h1>
        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-muted-foreground animate-fade md:text-lg">
          One calm place to run your people, clients, work, and finances.
        </p>
        <div className="mt-12 animate-enter">
          <Button asChild size="lg">
            <Link to="/auth">
              Enter Workspace <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="absolute bottom-8 z-10 flex gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Background ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-px transition-all duration-700 ease-luxury ${active === i ? "w-10 bg-foreground" : "w-5 bg-foreground/30"}`}
          />
        ))}
      </div>

      <footer className="absolute bottom-4 z-10 w-full text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">
          Powered by Xelevate
        </p>
      </footer>
    </main>
  );
}
