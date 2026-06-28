import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="container-suzuki flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="font-headline text-6xl text-suzuki-blue">404</p>
        <h1 className="page-shell__title mt-4">Page Not Found</h1>
        <p className="mt-2 text-suzuki-muted">
          The page you are looking for does not exist or has been removed.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
