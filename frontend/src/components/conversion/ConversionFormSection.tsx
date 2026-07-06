import type { ReactNode } from 'react';

type ConversionFormSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ConversionFormSection({ title, subtitle, children }: ConversionFormSectionProps) {
  return (
    <section className="conversion-form__section">
      <h2 className="conversion-form__section-title heading-nav">{title}</h2>
      {subtitle ? <p className="conversion-form__section-subtitle">{subtitle}</p> : null}
      <div className="conversion-form__grid">{children}</div>
    </section>
  );
}
