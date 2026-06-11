import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "OneCamp — self-hosted workspace with chat, tasks, docs, video, and local AI";

/** JSX tree consumed by next/og ImageResponse (Satori). */
export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#06060a",
        fontFamily: "Inter",
      }}
    >
      {/* Aurora + grid — engineered dark canvas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(90% 70% at 12% 8%, rgba(109,94,252,0.34) 0%, transparent 58%), radial-gradient(70% 60% at 88% 92%, rgba(52,227,227,0.16) 0%, transparent 55%), radial-gradient(50% 40% at 70% 20%, rgba(167,139,250,0.12) 0%, transparent 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #6d5efc, #34e3e3, #a78bfa, #6d5efc)",
        }}
      />

      <div style={{ display: "flex", width: "100%", height: "100%", padding: "52px 56px 48px 60px" }}>
        {/* Copy */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", maxWidth: 640 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <OneCampLogoMark />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>OneCamp</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b", marginTop: 2 }}>by OneMana · onemana.dev</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 36,
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: "#fff",
              }}
            >
              <span>The workspace for the</span>
              <span style={{ color: "#8b7dff" }}>AI era.</span>
              <span style={{ fontSize: 44, marginTop: 6, color: "#e2e8f0" }}>Yours forever.</span>
            </div>

            <div style={{ display: "flex", marginTop: 22, fontSize: 22, lineHeight: 1.45, color: "#94a3b8", maxWidth: 560 }}>
              Replace Slack, Notion, Asana, Zoom & Calendar in one Docker deploy — with local AI that never phones home.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 26, gap: 10 }}>
              {["Chat", "Tasks", "Docs", "Video", "Calendar", "Local AI"].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#cbd5e1",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #6d5efc, #5847e0)",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 12px 40px rgba(109,94,252,0.45)",
              }}
            >
              ${site.priceUsd} lifetime · unlimited users
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(52,227,227,0.25)",
                background: "rgba(52,227,227,0.08)",
                fontSize: 18,
                fontWeight: 600,
                color: "#7de8e8",
              }}
            >
              8-in-1 · self-hosted
            </div>
          </div>
        </div>

        {/* Product mock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 430,
            marginLeft: 28,
            marginTop: 8,
          }}
        >
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
        width: 52,
        height: 52,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF8A00, #FF3D00)",
        boxShadow: "0 8px 28px rgba(255,100,0,0.35)",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          border: "4px solid #fff",
        }}
      />
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
        height: 500,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(11,11,18,0.82)",
        boxShadow: "0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#f87171" }} />
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#fbbf24" }} />
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#34d399" }} />
          <div style={{ marginLeft: 10, fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>onecamp.acme.com</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(109,94,252,0.2)",
            fontSize: 12,
            fontWeight: 700,
            color: "#c4bbff",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 999, background: "#34e3e3" }} />
          AI online
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 118,
            padding: "14px 10px",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            gap: 8,
          }}
        >
          {["# general", "# product", "# eng"].map((ch, i) => (
            <div
              key={ch}
              style={{
                display: "flex",
                padding: "7px 10px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: i === 1 ? 700 : 500,
                color: i === 1 ? "#fff" : "#64748b",
                background: i === 1 ? "rgba(109,94,252,0.22)" : "transparent",
              }}
            >
              {ch}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "14px 16px", gap: 12 }}>
          <ChatLine name="Alex" text="Can we ship the onboarding doc by Thursday?" time="10:42" />
          <ChatLine name="You" text="Yeah — I'll have it done by Thursday." time="10:43" mine />
          <ChatLine name="Sam" text="Budget approved in today's call." time="10:51" />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 8,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(109,94,252,0.28)",
              background: "linear-gradient(135deg, rgba(109,94,252,0.14), rgba(52,227,227,0.06))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 16 }}>🔔</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>AI Nudge</div>
            </div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 12, lineHeight: 1.4, color: "#94a3b8" }}>
              Onboarding doc is overdue — you committed for Thursday.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <MiniStat icon="📋" label="12 tasks" />
            <MiniStat icon="📹" label="Call recap" />
            <MiniStat icon="🧠" label="Memory" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatLine({ name, text, time, mine }: { name: string; text: string; time: string; mine?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
      <div style={{ display: "flex", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
        {name} · {time}
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: "92%",
          padding: "8px 12px",
          borderRadius: 12,
          fontSize: 12,
          lineHeight: 1.4,
          color: mine ? "#fff" : "#cbd5e1",
          background: mine ? "rgba(109,94,252,0.35)" : "rgba(255,255,255,0.05)",
          border: mine ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function MiniStat({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11,
        fontWeight: 600,
        color: "#94a3b8",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}