'use client';

const COUNTRY_CODES = [
  { value: '+44', label: '+44' },
  { value: '+7', label: '+7' },
  { value: '+375', label: '+375' },
] as const;

type AccountPhoneFieldProps = {
  name?: string;
  defaultCountry?: string;
  defaultPhone?: string;
  required?: boolean;
  hint?: string;
};

export function AccountPhoneField({
  name = 'phone',
  defaultCountry = '+44',
  defaultPhone = '',
  required = false,
  hint,
}: AccountPhoneFieldProps) {
  return (
    <div className="account-lk__field account-lk__field--full">
      <label className="account-lk__label" htmlFor={`${name}-local`}>
        Mobile phone number
      </label>
      <div className="account-lk__phone-row">
        <select
          name="phoneCountry"
          className="account-lk__select account-lk__phone-code"
          defaultValue={defaultCountry}
          aria-label="Country code"
        >
          {COUNTRY_CODES.map((code) => (
            <option key={code.value} value={code.value}>
              {code.label}
            </option>
          ))}
        </select>
        <input
          id={`${name}-local`}
          type="tel"
          name={name}
          className="account-lk__input"
          defaultValue={defaultPhone}
          placeholder="555 444 33 22"
          autoComplete="tel-national"
          required={required}
        />
      </div>
      {hint && <p className="account-lk__hint">{hint}</p>}
    </div>
  );
}

export function buildFullPhone(country: string, local: string): string {
  const digits = local.replace(/\D/g, '');
  return digits ? `${country}${digits}` : '';
}
