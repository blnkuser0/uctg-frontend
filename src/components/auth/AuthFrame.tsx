import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <main className="auth-shell min-h-dvh bg-background text-foreground">
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5 sm:px-8"><BrandLogo variant="landscape" className="h-9 w-auto" priority /><div className="flex items-center gap-4"><span className="hidden text-xs font-medium text-muted-foreground sm:block">Secure workspace access</span><ThemeToggle /></div></header>
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_21rem]">
      <section className="flex items-center px-5 py-10 sm:px-10 lg:px-[clamp(3rem,8vw,8rem)]"><div className="auth-enter w-full max-w-md"><div className="mb-7 flex items-center gap-3"><span className="h-0.5 w-8 bg-primary" /><p className="text-xs font-semibold text-primary">{eyebrow}</p></div><h1 className="text-[2rem] font-semibold leading-tight tracking-[-.025em] sm:text-[2.35rem]">{title}</h1><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p><div className="mt-8">{children}</div></div></section>
      <aside className="auth-side relative hidden overflow-hidden border-l border-border bg-card lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 catalyst-grid opacity-35" /><div className="relative p-7"><p className="font-mono text-[9px] tracking-[.18em] text-muted-foreground uppercase">Access architecture</p><div className="mt-7 grid gap-px bg-border"><AccessRow code="01" title="Super Admin" detail="Provisions accounts and client organizations" /><AccessRow code="02" title="Client Admin" detail="Runs work inside one client space" /><AccessRow code="03" title="Developer" detail="Joins clients through assigned projects" /></div></div><div className="relative border-t border-border p-7"><div className="flex items-center gap-2 text-xs font-medium"><span className="size-1.5 bg-emerald-500" /> Catalyst access service</div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">No public registration. Access is issued by an authorized Super Admin.</p></div></aside>
    </div>
  </main>;
}

function AccessRow({ code, title, detail }: { code: string; title: string; detail: string }) {
  return <div className="bg-card p-4 transition-colors duration-200 hover:bg-accent/45"><div className="flex items-baseline justify-between gap-4"><p className="text-xs font-semibold">{title}</p><span className="font-mono text-[9px] text-primary">{code}</span></div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">{detail}</p></div>;
}
