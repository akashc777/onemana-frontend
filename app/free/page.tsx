import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { FREE_SEATS, freeIncludes } from "@/lib/freePlan";
import { selfHostNeeds } from "@/lib/content";
import { cloudBuyHref } from "@/lib/paymentTerms";
import { PlanBenefit } from "@/components/site/PlanCard";
import { AreaRow } from "@/components/site/Areas";
import { Section } from "@/components/ui/Section";
import { FreeCommand, FreeEmailKey } from "./FreeInstall";
import { SpotPlug } from "@/components/ui/graphics/spots";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon, type IconName } from "@/components/ui/icons";

/** Each need's tile (site.md F2): the server, the address, the install. */
const NEED_MARK: { icon: IconName }[] = [{ icon: "server" }, { icon: "globe" }, { icon: "terminal" }];

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
        subtitle="Chat, docs, projects, calls and AI teammates on your own server. Paste one command into it. No email, no card."
        art={<SpotPlug size={160} hue="ink" />}
      >
        {/* THE COMMAND, ON THE FACE OF THE PAGE. */}
        <FreeCommand />
      </PageHeader>

      {/* What it takes and what you get (F2): two raised cards on the page's
          one muted ground; a plan is no area, so it wears no hue (v3.1). */}
      <Section tone="muted" className="mt-10 sm:mt-[4.5rem]">
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-x-6">
          <div className="reveal rounded-2xl bg-card p-6 shadow-e1 lg:col-span-6">
            <h2 className="text-h3 text-foreground">What you need</h2>
            <ul className="m-0 mt-5 list-none space-y-4 border-t border-border p-0 pt-5">
              {selfHostNeeds.map((need, i) => (
                <li key={need} className="flex items-start gap-3 text-small text-foreground">
                  <Tile hue="ink" size="sm">
                    <Icon name={NEED_MARK[i % NEED_MARK.length]!.icon} />
                  </Tile>
                  <span className="pt-1">{need}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-small text-muted-foreground">
              No server? <a href={cloudBuyHref("monthly")} className="link">OneCamp Cloud</a> runs it for you.{" "}
              <a href="/docs/installation" className="link">Read the install guide</a>
            </p>

            <FreeEmailKey />
          </div>

          <div className="reveal rounded-2xl bg-card p-6 shadow-e1 lg:col-span-6">
            <h2 className="text-h3 text-foreground">What the free plan includes</h2>
            {/* The plan's checks, as on its card on /pricing, then all of OneCamp in its areas' colours. */}
            <AreaRow className="mt-5" />
            <ul className="m-0 mt-5 list-none space-y-3 border-t border-border p-0 pt-5 text-small text-foreground">
              {freeIncludes.map((item) => (
                <PlanBenefit key={item}>{item}</PlanBenefit>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 max-w-xl text-body text-foreground">
            Past {FREE_SEATS} people? A licence removes the limit, and the workspace you already run keeps working:
            re-run the install with the key from your purchase email.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href={site.demoStartUrl} external variant="ghost" size="lg">
              Try the live demo first
            </ButtonLink>
            <a href="/pricing" className="link tap-target text-small font-[510]">
              See paid plans
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
