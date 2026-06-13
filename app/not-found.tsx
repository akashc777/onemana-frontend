import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/" variant="brandPremium">Back to home</ButtonLink>
          <ButtonLink href="/blog" variant="ghost">Read the blog</ButtonLink>
        </div>
      </div>
    </section>
  );
}