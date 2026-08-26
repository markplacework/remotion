import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

// WhatsApp's own real palette (current app), not invented — the header
// teal is coincidentally almost identical to Wapi's own brand green,
// since Wapi is itself a WhatsApp tool.
const WA = {
  headerBg: "#008069",
  headerText: "#ffffff",
  wallpaper: "#e5ddd4",
  bubbleIn: "#ffffff",
  bubbleOut: "#d9fdd3",
  bubbleText: "#111b21",
  timestamp: "#667781",
  readTick: "#53bdeb",
  green: "#25D366",
};

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke={WA.headerText} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const AVATAR_SIZE = 46;

function PersonAvatar() {
  return (
    <svg width={AVATAR_SIZE} height={AVATAR_SIZE} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#c8ccce" />
      <circle cx="20" cy="16" r="7" fill="#eef0f1" />
      <path d="M6 36c1-8 8-13 14-13s13 5 14 13" fill="#eef0f1" />
    </svg>
  );
}

/** A real business logo, used when the chat header contact is the
 * business itself rather than a person (no real customer photo exists,
 * so that side keeps the generic PersonAvatar). The source file is a
 * square lockup (icon + wordmark + stars) — at avatar size the whole
 * thing reads as noise, so this zooms into just the burger icon at the
 * top instead of shrinking the full lockup down. */
function LogoAvatar({ src }: { src: string }) {
  return (
    <div
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: "50%",
        flexShrink: 0,
        background: `#000 url(${src}) no-repeat 50% 20% / 330%`,
      }}
    />
  );
}

function IconVideo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="2.5" stroke={WA.headerText} strokeWidth={1.8} />
      <path d="M16 10.5l6-3.5v10l-6-3.5" stroke={WA.headerText} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

function IconCall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"
        stroke={WA.headerText}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={WA.headerText}>
      <circle cx="12" cy="5" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="12" cy="19" r="1.9" />
    </svg>
  );
}

/** The real "read" receipt — double check, tinted blue. */
function IconReadTicks() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
      <path d="M1 6.8l3.6 3.6L11 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 6.8l3.6 3.6L17 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** WhatsApp renders *text* as bold and single line breaks as-is — parse
 * just enough of that real markdown to render message text faithfully
 * (both the real captured order message, and the owner's reply). */
function renderWaText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    return (
      <div key={i} style={{ minHeight: line ? undefined : "1em" }}>
        {parts.map((part, j) => {
          const boldMatch = /^\*([^*]+)\*$/.exec(part);
          return boldMatch ? <strong key={j}>{boldMatch[1]}</strong> : <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
}

type Bubble = {
  from: "them" | "me";
  text: string;
  timestamp: string;
  /** Frame this scene's own timeline the bubble should appear on. */
  atFrame: number;
};

const ChatBubble: React.FC<Bubble> = ({ from, text, timestamp, atFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - atFrame;
  const enter = spring({ frame: Math.max(0, local), fps, config: { damping: 15, mass: 0.6 } });
  const opacity = local < 0 ? 0 : Math.min(enter, 1);
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const outgoing = from === "me";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: outgoing ? "flex-end" : "flex-start",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: outgoing ? "top right" : "top left",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          position: "relative",
          background: outgoing ? WA.bubbleOut : WA.bubbleIn,
          color: WA.bubbleText,
          borderRadius: outgoing ? "18px 2px 18px 18px" : "2px 18px 18px 18px",
          padding: "14px 16px 10px",
          maxWidth: "84%",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: 26, lineHeight: 1.42, whiteSpace: "pre-wrap" }}>{renderWaText(text)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 5, marginTop: 4 }}>
          <span style={{ fontSize: 18, color: WA.timestamp }}>{timestamp}</span>
          {outgoing && <IconReadTicks />}
        </div>
      </div>
    </div>
  );
};

type Props = {
  contactName: string;
  bubbles: Bubble[];
  /** Real logo to show as the contact's avatar (e.g. when the contact
   * is the business itself). Falls back to a generic person silhouette. */
  avatarSrc?: string;
};

/**
 * A faithful recreation of the real WhatsApp chat UI (not a Wapi page —
 * WhatsApp is a separate real app, so this is built as its own component
 * rather than loaded from a live page). The incoming bubble is the exact
 * order message the catalog's own real sendCartToWA() template produces
 * (captured via catalog-director.js in the previous scene); the outgoing
 * reply is the business's own confirmation, supplied by the user.
 */
export const WhatsAppMockup: React.FC<Props> = ({ contactName, bubbles, avatarSrc }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_STACK,
        background: WA.wallpaper,
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          background: WA.headerBg,
          padding: "22px 18px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <BackArrow />
        {avatarSrc ? <LogoAvatar src={avatarSrc} /> : <PersonAvatar />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: WA.headerText, fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{contactName}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 20 }}>en línea</div>
        </div>
        <IconVideo />
        <IconCall />
        <IconMenu />
      </div>

      {/* Chat body */}
      <div style={{ flex: 1, position: "relative", padding: "20px 16px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.75)",
              color: "#54656f",
              fontSize: 19,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 8,
              boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
            }}
          >
            HOY
          </div>
        </div>

        {bubbles.map((b, i) => (
          <ChatBubble key={i} {...b} />
        ))}
      </div>

      {/* Input bar */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px 26px" }}>
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: 999,
            padding: "14px 20px",
            color: "#8696a0",
            fontSize: 24,
            boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
          }}
        >
          Mensaje
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: WA.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="#fff" />
          </svg>
        </div>
      </div>
    </div>
  );
};
