import { Link } from "@tanstack/react-router";

export function PageBanner({
  title,
  crumb,
  subtitle,
}: {
  title: string;
  crumb: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-gradient-to-b from-secondary to-background">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
        <nav className="mb-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{crumb}</span>
        </nav>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
