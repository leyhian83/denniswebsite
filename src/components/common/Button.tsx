import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
  ariaLabel?: string;
}

type Props = BaseProps &
  (
    | { to: string; href?: never; onClick?: never; type?: never }
    | { to?: never; href: string; onClick?: never; type?: never }
    | { to?: never; href?: never; onClick?: () => void; type?: "button" | "submit" }
  );

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  ariaLabel,
  ...rest
}: Props) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  const content = (
    <>
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if ("to" in rest && rest.to) {
    return (
      <Link to={rest.to} className={cls} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }
  if ("href" in rest && rest.href) {
    return (
      <a
        href={rest.href}
        className={cls}
        aria-label={ariaLabel}
        target={rest.href.startsWith("http") ? "_blank" : undefined}
        rel={rest.href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type={rest.type ?? "button"}
      className={cls}
      onClick={rest.onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
