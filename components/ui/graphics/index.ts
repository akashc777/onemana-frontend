// The playful layer's graphics, in one place: identity (hues, marks, tiles),
// the motif (rings, orbit, arc, spark), the progress ring, the spot
// illustrations and the hero's orbit. The same set as the workspace's
// components/ui/graphics, so a person or channel looks the same on both.
export { HUE_CLASS, avatarHueClass, cx } from "./hues"
export { IdentityMark, type IdentityMarkProps, type IdentityMarkVariant } from "./IdentityMark"
export { Tile, type TileProps, type TileSize } from "./Tile"
export { Arc, Orbit, Rings, Spark, SPARK_PATH, type MotifProps } from "./motifs"
export { ProgressRing, type ProgressRingProps } from "./ProgressRing"
export {
  SPOTS,
  SpotCalendar,
  SpotDocs,
  SpotError,
  SpotImported,
  SpotInbox,
  SpotPlug,
  SpotSearch,
  SpotTasks,
  SpotWelcome,
  type SpotProps,
} from "./spots"
export { HeroOrbit, type OrbitThing } from "./HeroOrbit"
