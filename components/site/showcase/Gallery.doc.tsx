import { AppFrame } from "./AppFrame"
import { DocPage, Q4_PLAN, Q4PlanBody } from "./DocPage"
import { Plate } from "./Gallery"
import { Sidebar } from "./Sidebar"
import { SAM } from "./data"
import { DocScene } from "./scenes/doc"

/**
 * The doc's plates for /playful-dev (Gallery.tsx): the live capture's view
 * to hold against it, the Docs tab's scene and its phone at their end, and
 * the selection bar, which no scene plays.
 */
export function Plates() {
  return (
    <>
      {/* As captured from the live demo: the pointer resting on the first
          block, and Sam's face in the hue the doc gives the user id (sun),
          where every other surface keys it by name (lake). */}
      <Plate name="docs" width={1120} height={700}>
        <AppFrame sidebar={<Sidebar place="docs" more="Docs" />}>
          <DocPage title={Q4_PLAN.title} meta={Q4_PLAN.meta} here={[{ person: SAM, hue: "sun" }]}>
            <Q4PlanBody handle />
          </DocPage>
        </AppFrame>
      </Plate>
      <Plate name="docs-tour" width={652} height={520}>
        <DocScene final />
      </Plate>
      <Plate name="docs-phone" width={360} height={600}>
        <DocScene phone final />
      </Plate>
      <Plate name="docs-selection" width={652} height={520}>
        <AppFrame>
          <DocPage title={Q4_PLAN.title} meta={Q4_PLAN.meta} here={[{ person: SAM }]}>
            <Q4PlanBody selection />
          </DocPage>
        </AppFrame>
      </Plate>
    </>
  )
}
