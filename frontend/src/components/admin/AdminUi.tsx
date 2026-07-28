import type { FormEvent, ReactNode } from 'react';

export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="admin-page__header">
      <h1 className="admin-page__title">{title}</h1>
      {description && <p className="admin-page__desc">{description}</p>}
    </header>
  );
}

export function AdminAlert({ message }: { message: string }) {
  return (
    <p className="admin-alert" role="alert">
      {message}
    </p>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`admin-panel${className ? ` ${className}` : ''}`}>
      {(title || description) && (
        <div className="admin-panel__head">
          {title && <h2 className="admin-panel__title">{title}</h2>}
          {description && <p className="admin-panel__desc">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
  columns = 3,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset className="admin-form-section">
      <legend className="admin-form-section__legend">
        <span className="admin-form-section__title">{title}</span>
        {description && <span className="admin-form-section__desc">{description}</span>}
      </legend>
      <div className={`admin-form-section__grid admin-form-section__grid--${columns}`}>{children}</div>
    </fieldset>
  );
}

export function AdminPageActions({ children }: { children: ReactNode }) {
  return <div className="admin-page__actions">{children}</div>;
}

export function AdminForm({
  children,
  onSubmit,
  className,
}: {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  return (
    <form className={`admin-form${className ? ` ${className}` : ''}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function AdminField({
  label,
  children,
  fullWidth,
}: {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={`admin-field${fullWidth ? ' admin-field--full' : ''}`}>
      <span className="admin-field__label">{label}</span>
      {children}
    </label>
  );
}

export function AdminCheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-field admin-field__checkbox-row">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function AdminFormActions({ children }: { children: ReactNode }) {
  return <div className="admin-form__actions">{children}</div>;
}

export function AdminFormNote({ children }: { children: ReactNode }) {
  return <p className="admin-form__note">{children}</p>;
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="admin-empty">{children}</p>;
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="admin-toolbar">{children}</div>;
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">{children}</table>
    </div>
  );
}

export function AdminBadge({
  variant = 'muted',
  children,
}: {
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'muted';
  children: ReactNode;
}) {
  return <span className={`admin-badge admin-badge--${variant}`}>{children}</span>;
}

export function AdminLinkButton({
  variant = 'default',
  onClick,
  children,
  type = 'button',
}: {
  variant?: 'default' | 'danger';
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`admin-link-btn${variant === 'danger' ? ' admin-link-btn--danger' : ''}`}
    >
      {children}
    </button>
  );
}

export function formatAdminDate(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function adminStatusSelectClass(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'admin-status-select admin-status-select--pending';
    case 'CONFIRMED':
    case 'CONTACTED':
      return 'admin-status-select admin-status-select--confirmed';
    case 'COMPLETED':
    case 'CLOSED':
      return 'admin-status-select admin-status-select--completed';
    case 'CANCELLED':
      return 'admin-status-select admin-status-select--cancelled';
    default:
      return 'admin-status-select admin-status-select--warning';
  }
}
