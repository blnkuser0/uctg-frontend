import { cn } from "@/lib/utils";

type PageHeaderTone = "blue" | "violet" | "amber" | "green" | "coral";

interface PageHeaderProps {
  title: React.ReactNode;
  section: string;
  tone?: PageHeaderTone;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, section, tone = "blue", actions, className }: PageHeaderProps) {
  return (
    <header className={cn("page-header", `page-header--${tone}`, className)}>
      <div className="min-w-0">
        <p className="page-header__section">{section}</p>
        <h1 className="page-header__title">{title}</h1>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
