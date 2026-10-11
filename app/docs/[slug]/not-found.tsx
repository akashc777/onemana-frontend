import { ButtonLink } from "@/components/ui/Button";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { SpotError } from "@/components/ui/graphics/spots";

/**
 * A docs address with no guide behind it: a guide renamed, or a link typed
 * from memory. Said plainly, with the docs' own search and the way to every
 * guide, instead of the site's general 404, which knew nothing about docs.
 */
export default function DocNotFound() {
  return (
    <section className="container-x min-h-[calc(100dvh-3.5rem)] pb-24 pt-10 sm:pt-16">
      <div className="max-w-xl">
        <SpotError size={88} />
        <h1 className="mt-6 text-balance text-title-read text-foreground">
          There is no guide at this address
        </h1>
        <p className="mt-3 text-body-lg text-muted-foreground">
          It may have been renamed. Search the guides for what you were after, or see them all.
        </p>
        <DocsSearch className="mt-8 max-w-md" />
        <ButtonLink href="/docs" variant="ghost" className="mt-4">
          All guides
        </ButtonLink>
      </div>
    </section>
  );
}
