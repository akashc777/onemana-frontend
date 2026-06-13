import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_TITLE = `${site.name} · The workspace for the AI era`;
export const OG_DESCRIPTION =
  "Chat, docs, tasks, video, calendar, and local AI in one Docker deploy on your server. Pay once, unlimited users.";
export const OG_ALT =
  "OneCamp: self-hosted workspace with chat, docs, tasks, video, calendar, and local AI on your server.";

export const defaultOgImages = [
  { url: "/opengraph-image", width: 1200, height: 630, alt: OG_ALT, type: "image/png" as const },
];

export const defaultTwitterImages = ["/twitter-image"];

const GRID_BG = {
  position: "absolute" as const,
  inset: 0,
  backgroundImage:
    "linear-gradient(#e1e4e8 1px, transparent 1px), linear-gradient(90deg, #e1e4e8 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  opacity: 0.45,
};

const ORANGE_BEAM = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  height: 200,
  background: "radial-gradient(ellipse 90% 70% at 50% -20%, rgba(255,77,0,0.12), transparent 62%)",
};

/** Cloudflare-inspired OG card — matches current landing page voice and visuals. */
export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
        fontFamily: "Inter",
        color: "#222222",
      }}
    >
      <div style={GRID_BG} />
      <div style={ORANGE_BEAM} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#FF4D00" }} />

      <div style={{ display: "flex", width: "100%", height: "100%", padding: "52px 56px" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", maxWidth: 640 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <OneCampLogoMark />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{site.name}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#5f6368", marginTop: 2 }}>
                  Built by OneMana · onemana.dev
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 36,
                fontSize: 50,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              <span>The workspace for the</span>
              <span style={{ color: "#FF4D00" }}>AI era. Yours forever.</span>
            </div>

            <div style={{ display: "flex", marginTop: 18, fontSize: 21, lineHeight: 1.45, color: "#5f6368", maxWidth: 540 }}>
              {OG_DESCRIPTION}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22, gap: 8 }}>
              {["Chat", "Docs", "Tasks", "Video", "Calendar", "Local AI"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "5px 11px",
                    borderRadius: 4,
                    border: "1px solid #e1e4e8",
                    background: "#fafbfc",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5f6368",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                padding: "11px 20px",
                borderRadius: 8,
                background: "#FF4D00",
                fontSize: 18,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              Get OneCamp · ${site.priceUsd} lifetime
            </div>
            <div
              style={{
                display: "flex",
                padding: "11px 18px",
                borderRadius: 8,
                border: "1px solid #e1e4e8",
                fontSize: 16,
                fontWeight: 600,
                color: "#5f6368",
              }}
            >
              Self-hosted
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 400, marginLeft: 28 }}>
          <WorkspaceMock />
        </div>
      </div>
    </div>
  );
}

function OneCampLogoMark() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF8A00, #FF3D00)",
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 999, border: "3px solid #fff" }} />
    </div>
  );
}

function WorkspaceMock() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: 470,
        borderRadius: 8,
        border: "1px solid #e1e4e8",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg, #FF4D00, #FF8A00)" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid #e1e4e8",
          background: "#fafbfc",
          gap: 6,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fca5a5" }} />
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fcd34d" }} />
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "#86efac" }} />
        <div style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#5f6368" }}>onecamp.acme.com</div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 100,
            padding: "10px 8px",
            borderRight: "1px solid #e1e4e8",
            gap: 4,
            background: "#f5f6f8",
          }}
        >
          {["general", "engineering", "design"].map((ch, i) => (
            <div
              key={ch}
              style={{
                display: "flex",
                padding: "5px 7px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: i === 1 ? 600 : 500,
                color: i === 1 ? "#222222" : "#5f6368",
                background: i === 1 ? "#eceef1" : "transparent",
              }}
            >
              # {ch}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "12px 12px", gap: 8 }}>
            <ChatLine name="Priya" text="Shipped checkout to staging." time="9:41" />
            <ChatLine name="Daniel" text="Reviewing the deploy." time="9:42" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 148,
              borderLeft: "1px solid #e1e4e8",
              background: "#fafbfc",
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid #e1e4e8",
                fontSize: 10,
                fontWeight: 700,
                color: "#222222",
              }}
            >
              AI Assistant
            </div>
            <div style={{ padding: "8px 10px", fontSize: 9, lineHeight: 1.45, color: "#5f6368" }}>
              <div style={{ marginBottom: 4, color: "#222222", fontWeight: 600 }}>#engineering recap</div>
              • Priya shipped checkout
              <br />
              • Daniel is reviewing
              <br />• 2 tasks closed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatLine({ name, text, time }: { name: string; text: string; time: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 9, fontWeight: 600, color: "#5f6368", marginBottom: 3 }}>
        {name} · {time}
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: "92%",
          padding: "6px 9px",
          borderRadius: 6,
          fontSize: 10,
          lineHeight: 1.35,
          color: "#222222",
          background: "#f5f6f8",
        }}
      >
        {text}
      </div>
    </div>
  );
}