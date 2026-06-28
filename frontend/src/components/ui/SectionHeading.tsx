import type { ReactNode } from 'react';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  action,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="section-heading">{title}</h2>
        {subtitle && <p className="section-subheading mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
