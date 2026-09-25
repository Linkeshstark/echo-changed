import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand, TextField } from "./primitives";
import { Button } from "@/components/ui/button";
import { DEFAULT_OPERATOR_NAME, storeOperatorName } from "@/lib/echo-session";
import blue from "@/assets/echo-glass-blue.jpg";
import titanium from "@/assets/echo-titanium.jpg";
import orbit from "@/assets/echo-orbit.jpg";

const images = [blue, titanium, orbit];

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [image, setImage] = useState(0);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const id = window.setInterval(() => setImage((i) => (i + 1) % images.length), 6000);
    return () => window.clearInterval(id);
  }, []);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(form.get("name") ?? "").trim() || DEFAULT_OPERATOR_NAME;
    window.sessionStorage.setItem("echo-session", "demo");
    storeOperatorName(name);
    navigate({ to: "/dashboard" });
  };
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-16">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          width={1600}
          height={1000}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[2000ms] ${image === index ? "opacity-[0.14]" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-background/40" />

      <div className="relative z-10 w-full max-w-lg">
        <header className="mb-14 flex items-center justify-between">
          <Brand />
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Executive Access
          </span>
        </header>

        <div className="mb-8 flex gap-8 border-b border-border">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`nav-link pb-4 text-xs uppercase tracking-[0.18em] transition-opacity duration-500 hover:opacity-60 ${mode === "signin" ? "is-active text-foreground" : "text-muted-foreground"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`nav-link pb-4 text-xs uppercase tracking-[0.18em] transition-opacity duration-500 hover:opacity-60 ${mode === "signup" ? "is-active text-foreground" : "text-muted-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <h1 className="glyph-serif animate-enter text-5xl leading-[1.02] tracking-tight text-foreground md:text-6xl">
          {mode === "signin" ? "Welcome back." : "Stand up your workspace."}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Enter your credentials to open ECHO. Any name, email and password work in this demo."
            : "Create the administrator account for your organisation."}
        </p>

        <form onSubmit={submit} className="mt-12 space-y-9">
          <TextField label="Name" name="name" autoComplete="name" required maxLength={100} />
          {mode === "signup" && (
            <TextField
              label="Mobile number"
              type="tel"
              autoComplete="tel"
              required
              maxLength={15}
            />
          )}
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
          />
          <div className="relative">
            <TextField
              label="Password"
              type={show ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={4}
              maxLength={100}
            />
            <button
              type="button"
              aria-label="Show password"
              onClick={() => setShow(!show)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-opacity duration-500 hover:opacity-60"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {mode === "signin" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Remember me</span>
              <button
                type="button"
                className="text-foreground transition-opacity duration-500 hover:opacity-60"
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-6 border-t border-border pt-8">
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              {mode === "signin" ? "Returning operator" : "New workspace"}
            </span>
            <Button type="submit" size="lg">
              {mode === "signin" ? "Enter ECHO" : "Create Account"}{" "}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>

        <footer className="mt-16 mb-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">
            ECHO — Operational Headquarters
          </p>
        </footer>
      </div>
    </main>
  );
}
