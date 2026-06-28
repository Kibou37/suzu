import Image from 'next/image';

type SuzukiLogoProps = {
  className?: string;
  priority?: boolean;
};

export function SuzukiLogo({ className = 'h-[30px] w-[160px]', priority = false }: SuzukiLogoProps) {
  return (
    <Image
      src="/brand/suzuki-logo-motor.svg"
      alt="Suzuki"
      width={160}
      height={30}
      priority={priority}
      className={className}
    />
  );
}
