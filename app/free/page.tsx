import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { FREE_SEATS, freeIncludes } from "@/lib/freePlan";
import { selfHostNeeds } from "@/lib/content";
import { cloudBuyHref } from "@/lib/paymentTerms";
import { PlanBenefit } from "@/components/site/PlanCard";
import { PLAN_HUE } from "@/components/site/planHues";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Section } from "@/components/ui/Section";
import { FreeCommand, FreeEmailKey } from "./FreeInstall";

/**
 * The free plan, with the install command on the face of the page.
 *
 * Drawn on the server; the command's key button and the email form are the
 * two client parts (FreeInstall.tsx). The whole page used to be one client
 * component, so its lists and headings were JavaScript too.
 */
export default function FreePage() {
  return (
    <>
      <PageHeader
        title={`Install OneCamp free, for up to ${FREE_SEATS} people`}
        subtitle="Chat, docs, tasks, calls and AI teammates on your own server. Paste one command into it. No email, no card."
        className="!pb-0"
      >
        {/* THE COMMAND, ON THE FACE OF THE PAGE. */}
        <FreeCommand />
      </PageHeader>

      {/* What it takes and what you get, on the free plan's moss band. */}
      <Section band={PLAN_HUE.free} spacing="compact" className="mt-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h3 text-foreground">What you need</h2>
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {selfHostNeeds.map((need) => (
                <li key={need} className="text-small text-foreground">
                  {need}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-muted-foreground">
              No server? <a href={cloudBuyHref("monthly")} className="link">OneCamp Cloud</a> runs it for you.{" "}
              <a href="/docs/installation" className="link">Read the install guide</a>
            </p>

            <FreeEmailKey />
          </div>

          <div>
            <h2 className="text-h3 text-foreground">What the free plan includes</h2>
            {/* Ticks in the free plan's moss, as on its card on /pricing. */}
            <ul className={`${HUE_CLASS[PLAN_HUE.free]} mt-4 space-y-3 border-t border-border pt-4 text-small text-foreground`}>
              {freeIncludes.map((item) => (
                <PlanBenefit key={item}>{item}</PlanBenefit>
              ))}
            </ul>
            <p className="mt-4 text-small text-muted-foreground">
              Past {FREE_SEATS} people? A licence removes the limit, and the workspace you already run keeps working:
              re-run the install with the key from your purchase email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={site.demoStartUrl} external variant="ghost">
                Try the live demo first
              </ButtonLink>
              <ButtonLink href="/pricing" variant="subtle">
                See paid plans
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
