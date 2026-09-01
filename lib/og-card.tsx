import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Bump when the card design changes so social caches refetch.
 *
 * 4: repositioned on governed AI. This bump is load-bearing rather than housekeeping — the image URL is
 * otherwise identical, and Slack, LinkedIn and X all cache OG images hard, so a reworded card at an
 * unchanged URL keeps showing the old headline to exactly the audience the rewording was for.
 */
export const OG_IMAGE_VERSION = "4";

export const OG_TITLE = `${site.name} · Governed AI on your own server`;
export const OG_DESCRIPTION =
  "AI agents bounded by the live permissions of whoever authorised them, and audited before they act. Self-hosted, with SSO, SCIM, and MFA. Pay once, unlimited users.";
export const OG_ALT = "OneCamp: AI with permissions, not promises. On your own server.";

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
          background: "#c84f00",
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
          {/*
            Mirrors the hero h1. Line lengths checked against the 900px cap at these sizes rather than
            eyeballed: satori does not wrap-and-shrink, it just overflows the card, so a headline that is
            two characters too long ships as a cropped image nobody notices until it is in a tweet.
          */}
          <span style={{ display: "flex" }}>AI with permissions,</span>
          <span style={{ display: "flex", color: "#c84f00" }}>not promises.</span>
          <span style={{ display: "flex", marginTop: 10, fontSize: 52, color: "#222222" }}>On your own server.</span>
        </div>

        <div style={{ display: "flex", marginTop: 32, fontSize: 26, fontWeight: 500, color: "#5f6368" }}>
          {site.tagline}
        </div>

        <div style={{ display: "flex", marginTop: 48, fontSize: 20, fontWeight: 600, color: "#c84f00" }}>
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