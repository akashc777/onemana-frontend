import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </section>
  );
}
