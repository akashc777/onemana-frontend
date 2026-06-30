import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Bump when the card design changes so social caches refetch. */
export const OG_IMAGE_VERSION = "3";

export const OG_TITLE = `${site.name} · The workspace for the AI era`;
export const OG_DESCRIPTION =
  "Chat, docs, tasks, video, calendar, and local AI in one Docker deploy on your server. Pay once, unlimited users.";
export const OG_ALT = "OneCamp: one workspace on your server. Pay once.";

export const defaultOgImages = [
  {
    url: `/opengraph-image?v=${OG_IMAGE_VERSION}`,
    width: 1200,
    height: 630,
    alt: OG_ALT,
    type: "image/png" as const,
  },
];

export const defaultTwitterImages = [`/twitter-image?v=${OG_IMAGE_VERSION}`];

const CARD_BG = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  overflow: "hidden",
  background: "#ffffff",
  fontFamily: "Inter",
  color: "#222222",
};

/** Minimal light OG card - headline and one line only. */
export function OgCard() {
  return (
    <div style={CARD_BG}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(#e8eaed 1px, transparent 1px), linear-gradient(90deg, #e8eaed 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          display: "flex",
          background: "radial-gradient(ellipse 80% 60% at 18% -10%, rgba(255,77,0,0.14), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          display: "flex",
          background: "#FF4D00",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <OneCampLogoMark />
          <span style={{ display: "flex", marginLeft: 16, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {site.name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 52,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            maxWidth: 900,
          }}
        >
          <span style={{ display: "flex" }}>The workspace for the</span>
          <span style={{ display: "flex", color: "#FF4D00" }}>AI era.</span>
          <span style={{ display: "flex", marginTop: 10, fontSize: 52, color: "#222222" }}>Yours forever.</span>
        </div>

        <div style={{ display: "flex", marginTop: 32, fontSize: 26, fontWeight: 500, color: "#5f6368" }}>
          {site.tagline}
        </div>

        <div style={{ display: "flex", marginTop: 48, fontSize: 20, fontWeight: 600, color: "#FF4D00" }}>
          onemana.dev
        </div>
      </div>
    </div>
  );
}

function OneCampLogoMark() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF8A00, #FF3D00)",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          display: "flex",
          border: "3px solid #fff",
        }}
      />
    </div>
  );
}