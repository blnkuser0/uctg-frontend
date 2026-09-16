import type { Metadata } from "next";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How Super Admin provisioning works",
  description: "How Ugnexa Catalyst's Super Admin, shared Developers org, and cross-org project access work.",
};

function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <h2 className="flex items-baseline gap-2.5 text-xl font-semibold sm:text-2xl">
      <span className="font-mono text-xs font-medium text-primary">{num}</span>
      {title}
    </h2>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="catalyst-panel border-l-[3px] border-l-primary p-4 text-sm leading-relaxed [&_p+p]:mt-2">
      {children}
    </div>
  );
}

function DiagramBox({
  label,
  sub,
  tone = "neutral",
}: {
  label: string;
  sub?: string;
  tone?: "primary" | "neutral" | "warn";
}) {
  return (
    <div
      className={cn(
        "flex min-w-[9.5rem] flex-col items-center gap-0.5 rounded-xl border px-4 py-3 text-center shadow-sm",
        tone === "primary" && "border-primary bg-primary text-primary-foreground",
        tone === "warn" && "border-amber-500/40 bg-amber-500/10 text-foreground",
        tone === "neutral" && "border-border bg-card text-foreground"
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      {sub && <span className="font-mono text-[10px] opacity-75">{sub}</span>}
    </div>
  );
}

function Arrow({ label, direction = "down" }: { label?: string; direction?: "down" | "right" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-muted-foreground",
        direction === "down" ? "flex-col py-1" : "min-w-10 flex-row px-1"
      )}
    >
      {label && <span className="font-mono text-[10px] whitespace-nowrap">{label}</span>}
      <svg
        width={direction === "down" ? 14 : 28}
        height={direction === "down" ? 20 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        {direction === "down" ? <path d="M12 4v14m0 0-5-5m5 5 5-5" /> : <path d="M4 12h14m0 0-5-5m5 5-5 5" />}
      </svg>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <main className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_28rem),radial-gradient(circle_at_88%_30%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_30rem)]" />

      <header className="relative mx-auto max-w-3xl px-4 pt-16 pb-10 sm:px-6 sm:pt-20">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-sm bg-white p-1.5 shadow-sm ring-1 ring-black/5 dark:bg-sidebar-accent/35 dark:ring-sidebar-border">
            <BrandLogo variant="square" className="size-full" priority />
          </div>
          <p className="catalyst-eyebrow">Ugnexa Catalyst · engineering note</p>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">How Super Admin provisioning works</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Registration used to be self-service — anyone could spin up their own organization from the login
          screen. That flow was replaced with a closed, Super-Admin-provisioned model. This page is the reference
          for that model: who creates what, how access crosses organization boundaries safely, and where the
          code lives.
        </p>
      </header>

      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-16">
          {/* 01 — mental model */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="01" title="The mental model" />
            <p className="text-sm text-muted-foreground">
              Three kinds of identity exist now, and only one entity is allowed to create the other two.
            </p>

            <div className="catalyst-panel overflow-x-auto p-5 sm:p-6">
              <div className="flex min-w-[560px] flex-col items-center gap-1">
                <DiagramBox label="Super Admin" sub="isSuperAdmin: true" tone="primary" />
                <Arrow label="creates" />
                <div className="flex w-full flex-wrap items-start justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <DiagramBox label="Developers org" sub="type: internal" />
                    <Arrow direction="down" />
                    <div className="flex gap-3">
                      <DiagramBox label="Developer" tone="warn" />
                      <DiagramBox label="Developer" tone="warn" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <DiagramBox label="Client Org A" sub="type: client" />
                    <Arrow direction="down" />
                    <DiagramBox label="Project" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <DiagramBox label="Client Org B" sub="type: client" />
                    <Arrow direction="down" />
                    <DiagramBox label="Project" />
                  </div>
                </div>
                <div className="mt-2 w-full border-t border-dashed border-border pt-2 text-center">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Super Admin assigns a Developer directly onto a specific Project — crossing the org boundary
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              The part that didn&apos;t exist anywhere before: a developer&apos;s <em>home organization</em>{" "}
              (Developers) and a project&apos;s <em>owning organization</em> (a client) are now allowed to differ
              at the same time. Every other model — Task, Stage, Label, Comment, TimeEntry — assumed those two
              were always identical. That assumption is what actually had to change.
            </p>

            <ul className="grid gap-2.5">
              {[
                "Only a Super Admin creates Organizations and user accounts. No public sign-up exists anymore.",
                "All developers live in one shared Developers organization — never one membership per client.",
                "Assigning a developer to a client connects them to a specific project, not to the client's organization as a whole.",
                "A Super Admin can see and open every project in every organization — provisioning power, not just visibility.",
              ].map((rule) => (
                <li key={rule} className="catalyst-panel flex gap-3 p-3.5 text-sm">
                  <span className="mt-0.5 h-fit shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                    rule
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {/* 02 — access check */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="02" title="The access check, made concrete" />
            <p className="text-sm text-muted-foreground">
              Every project-scoped request — opening a project, reading its tasks, posting a comment — runs
              through one function: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">assertProjectAccess</code>.
              It has three independent ways to let someone through.
            </p>

            <div className="catalyst-panel flex flex-col items-center gap-1 p-5 sm:p-6">
              <DiagramBox label="Request: open Project P" />
              <Arrow />
              <DiagramBox label="Is the user in P.memberIds?" />
              <Arrow label="yes" />
              <DiagramBox label="✓ Access granted" tone="primary" />
              <div className="mt-2 w-full border-t border-dashed border-border pt-3 text-center font-mono text-[11px] text-muted-foreground">
                no → check the next rule, then the next
              </div>
              <Arrow />
              <DiagramBox label="projects.manage in THEIR OWN org?" sub="AND same org as the project" />
              <Arrow label="yes" />
              <DiagramBox label="✓ Access granted" tone="primary" />
              <div className="mt-2 w-full border-t border-dashed border-border pt-3 text-center font-mono text-[11px] text-muted-foreground">
                no, or different org → check the last rule
              </div>
              <Arrow />
              <DiagramBox label="Is the user a Super Admin?" />
              <div className="mt-2 flex w-full items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-1">
                  <Arrow label="yes" />
                  <DiagramBox label="✓ Access granted" tone="primary" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Arrow label="no" />
                  <DiagramBox label="✕ 403 Forbidden" tone="warn" />
                </div>
              </div>
            </div>

            <Callout>
              <p>
                <strong>The one rule that must never regress:</strong> the middle branch — the org-wide{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs">projects.manage</code> override — only
                fires when the project&apos;s org matches the caller&apos;s own org. Drop that equality check and
                a manager in Client Org A silently gains access to every project in Client Org B the moment the
                database query stops filtering by organization.
              </p>
              <p>This exact scenario is the first and most important test in <code className="rounded bg-muted px-1 font-mono text-xs">crossOrg.test.ts</code>.</p>
            </Callout>

            <p className="text-sm text-muted-foreground">
              The membership branch is what makes cross-org assignment work at all:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Project.memberIds</code> was
              always just a bare list of user IDs, with no schema-level requirement that members share the
              project&apos;s organization. Only the lookup query used to filter by org before checking
              membership — dropping that filter, carefully, is most of the actual change.
            </p>
          </section>

          {/* 03 — bootstrap */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="03" title="Creating the first Super Admin" />
            <p className="text-sm text-muted-foreground">
              There&apos;s a chicken-and-egg problem: every ordinary API needs an existing Super Admin to create
              another one. The first account is provisioned by a one-time script instead, run once per
              environment.
            </p>

            <pre className="catalyst-panel overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground sm:text-[13px]">
{`# from backend/, with your own values:
BOOTSTRAP_SUPERADMIN_EMAIL="admin@ugnexa.com" \\
BOOTSTRAP_SUPERADMIN_PASSWORD="a-strong-password" \\
BOOTSTRAP_SUPERADMIN_NAME="Your Name" \\
npm run bootstrap:platform`}
            </pre>

            <p className="text-sm text-muted-foreground">
              It&apos;s idempotent — safe to run again. It checks for the Developers org and the Super Admin role
              before creating either, and only creates a new user if that email doesn&apos;t already exist.
            </p>

            <ol className="grid gap-3">
              {[
                {
                  title: "Ensures the Developers org exists",
                  sub: "a normal Organization document, just flagged type: \"internal\"",
                },
                {
                  title: "Ensures a \"Super Admin\" role exists in it",
                  sub: "seeded with every permission, same pattern as the original org-admin seed",
                },
                {
                  title: "Creates the user, flagged isSuperAdmin: true",
                  sub: "this flag — not the role — is what actually grants the cross-org bypass",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-3.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-muted-foreground">{step.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 04 — API surface */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="04" title="What a Super Admin can do" />
            <p className="text-sm text-muted-foreground">
              Once logged in with that account, a &quot;Platform&quot; section appears in the sidebar — invisible
              to everyone else. Three screens, backed by one route prefix.
            </p>

            <div className="catalyst-panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-2.5 font-medium">Action</th>
                    <th className="px-4 py-2.5 font-medium">Route</th>
                    <th className="px-4 py-2.5 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Create a client org + its admin", "POST /platform/organizations", "one call does both"],
                    ["List every organization", "GET /platform/organizations", "client orgs + the Developers org"],
                    [
                      "Create a developer",
                      "POST /platform/users",
                      "isDeveloper: true routes them into the Developers org automatically",
                    ],
                    ["List developers", "GET /platform/developers", "the assignment picker's source list"],
                    ["See every project, every org", "GET /platform/projects", "the oversight view"],
                    [
                      "Assign / unassign a developer",
                      "POST / DELETE /platform/projects/:id/developers",
                      "rejects a target who isn't a Developers-org user",
                    ],
                  ].map((row) => (
                    <tr key={row[1]} className="border-b border-border/70 last:border-0 align-top">
                      <td className="px-4 py-2.5">{row[0]}</td>
                      <td className="px-4 py-2.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">{row[1]}</code>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground">
              What deliberately stayed untouched: a client org&apos;s own admin can still add their own org&apos;s
              users to their own projects, the same way they always could. Super Admin assignment is an
              additional door into project membership, not a replacement for the existing one.
            </p>
          </section>

          {/* 05 — status */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="05" title="Verification status" />
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "Backend — 109/109 tests passing", tone: "good" },
                { label: "Backend — tsc / lint / build clean", tone: "good" },
                { label: "Frontend — tsc / lint / build clean", tone: "good" },
                { label: "Frontend unit tests — blocked (see below)", tone: "warn" },
                { label: "Live browser walkthrough — not yet done", tone: "warn" },
              ].map((chip) => (
                <span key={chip.label} className="catalyst-panel flex items-center gap-2 px-3.5 py-2 text-xs">
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      chip.tone === "good" ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  {chip.label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              The frontend Vitest runner currently fails to launch on the dev machine — a Windows Application
              Control policy is blocking a native binary Vitest&apos;s bundler needs. Confirmed unrelated to this
              change: TypeScript, lint, and the actual Next.js build all still pass, since none of them load that
              particular module the way Vitest does.
            </p>
          </section>

          {/* 06 — FAQ */}
          <section className="flex flex-col gap-4">
            <SectionHeading num="06" title="One sentence per teammate question" />
            <ul className="grid gap-2.5">
              {[
                {
                  q: "Can a client admin still invite their own team?",
                  a: "Yes, unchanged — that's the existing /users page, still org-scoped.",
                },
                {
                  q: "Do developers see every client's projects?",
                  a: "No — only the specific ones a Super Admin assigned them to.",
                },
                {
                  q: "Where does a mention/notification land if I'm cross-org?",
                  a: "Your own org's inbox — notifications are stamped with the recipient's home org, not the project's, specifically so this works.",
                },
                {
                  q: "Can I still hit POST /auth/register?",
                  a: "No, it's gone — returns 404 on purpose.",
                },
              ].map((item) => (
                <li key={item.q} className="catalyst-panel p-3.5 text-sm">
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-1 text-muted-foreground">{item.a}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>Ugnexa Catalyst — Super Admin / multi-org pivot</span>
          <span className="font-mono">M0–M7</span>
        </footer>
      </div>
    </main>
  );
}
