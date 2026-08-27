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

/** A faint repeating doodle pattern — real WhatsApp's chat wallpaper
 * has one behind the flat color. Rendered as an inline SVG <pattern>
 * (Remotion disallows CSS background-image) and kept very subtle so it
 * reads as "real app background" without competing with the bubbles on
 * top of it. */
const WallpaperPattern: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="wa-doodle" patternUnits="userSpaceOnUse" width={220} height={220}>
        <g fill="none" stroke="#8a9a8f" strokeWidth={1.4} opacity={0.16}>
          <circle cx={30} cy={30} r={10} />
          <path d="M70 20 L90 20 L90 40" />
          <path d="M40 90 q14 -14 28 0" />
          <rect x={120} y={30} width={18} height={18} rx={3} transform="rotate(18 129 39)" />
          <path d="M160 80 l10 -14 10 14 z" />
          <circle cx={180} cy={140} r={7} />
          <path d="M20 150 L36 150 L36 166" />
          <path d="M100 160 q14 -14 28 0" />
          <path d="M60 190 l10 -14 10 14 z" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wa-doodle)" />
  </svg>
);

/** Android status bar — time + signal/wifi/battery, tinted to match the
 * app below it (real Android themes the status bar to the open app). */
const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div
    style={{
      flexShrink: 0,
      height: 40,
      background: WA.headerBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 36px",
    }}
  >
    <span style={{ color: WA.headerText, fontSize: 17, fontWeight: 600, letterSpacing: 0.2 }}>{time}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="17" height="12" viewBox="0 0 18 12" fill="none">
        <rect x="0" y="7" width="3" height="5" rx="0.5" fill={WA.headerText} />
        <rect x="5" y="5" width="3" height="7" rx="0.5" fill={WA.headerText} />
        <rect x="10" y="3" width="3" height="9" rx="0.5" fill={WA.headerText} />
        <rect x="15" y="0" width="3" height="12" rx="0.5" fill={WA.headerText} />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <path
          d="M8 11.5c-2.6 0-5-1-6.8-2.7a.5.5 0 010-.7 10 10 0 0113.6 0 .5.5 0 010 .7C13 10.5 10.6 11.5 8 11.5z"
          fill={WA.headerText}
        />
      </svg>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 22, height: 11, border: `1.4px solid ${WA.headerText}`, borderRadius: 2.5, padding: 1.5 }}>
          <div style={{ width: "78%", height: "100%", background: WA.headerText, borderRadius: 0.5 }} />
        </div>
        <div style={{ width: 2, height: 4, background: WA.headerText, borderRadius: 1, marginLeft: 1 }} />
      </div>
    </div>
  </div>
);

/** Classic 3-button Android nav bar (back / home / recents), matching
 * the reference screenshot's own device chrome. */
const NavBar: React.FC = () => (
  <div
    style={{
      flexShrink: 0,
      height: 52,
      background: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14 5l-7 7 7 7" stroke="#c6c6c6" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2.2px solid #c6c6c6" }} />
    <div style={{ width: 16, height: 16, borderRadius: 3, border: "2.2px solid #c6c6c6" }} />
  </div>
);

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
 * so that side keeps the generic PersonAvatar). Shown whole — contain,
 * not cover — with a small margin, so nothing gets cropped off; the
 * logo's own black backdrop matches the circle's fill so it still reads
 * as a clean round avatar rather than a square sticker. */
function LogoAvatar({ src }: { src: string }) {
  return (
    <div
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: "50%",
        flexShrink: 0,
        background: `#000 url(${src}) no-repeat center / 82%`,
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
    <svg width="16" height="11" viewBox="0 0 18 13" fill="none">
      <path d="M1 6.8l3.6 3.6L11 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 6.8l3.6 3.6L17 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEmoji() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="#8696a0" strokeWidth={1.6} />
      <circle cx="8.5" cy="10" r="1.2" fill="#8696a0" />
      <circle cx="15.5" cy="10" r="1.2" fill="#8696a0" />
      <path d="M7.5 14.5c1 1.6 2.7 2.5 4.5 2.5s3.5-.9 4.5-2.5" stroke="#8696a0" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function IconClip() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(45deg)" }}>
      <path
        d="M7 12.5l7-7a3.5 3.5 0 015 5l-8 8a2.3 2.3 0 01-3.3-3.2l7-7"
        stroke="#8696a0"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 8.5a1.5 1.5 0 011.5-1.5h2l1-2h7l1 2h2A1.5 1.5 0 0120 8.5v9A1.5 1.5 0 0118.5 19h-13A1.5 1.5 0 014 17.5v-9z" stroke="#8696a0" strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.4" stroke="#8696a0" strokeWidth={1.6} />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="#fff" strokeWidth={1.7} />
      <path d="M6 11a6 6 0 0012 0" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" />
      <path d="M12 17v3" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  );
}

/** WhatsApp renders *text* as bold, auto-links bare URLs in its own
 * link blue, and single line breaks as-is — parse just enough of that
 * real markdown to render message text faithfully (both the real
 * captured order message, and the owner's reply). */
function renderWaText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*[^*]+\*|(?:https?:\/\/|www\.)\S+)/g).filter(Boolean);
    return (
      <div key={i} style={{ minHeight: line ? undefined : "1em" }}>
        {parts.map((part, j) => {
          const boldMatch = /^\*([^*]+)\*$/.exec(part);
          if (boldMatch) return <strong key={j}>{boldMatch[1]}</strong>;
          if (/^(https?:\/\/|www\.)\S+$/.test(part)) {
            return (
              <span key={j} style={{ color: "#027eb5" }}>
                {part}
              </span>
            );
          }
          return <span key={j}>{part}</span>;
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
        marginBottom: 10,
      }}
    >
      <div
        style={{
          position: "relative",
          background: outgoing ? WA.bubbleOut : WA.bubbleIn,
          color: WA.bubbleText,
          borderRadius: outgoing ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
          padding: "9px 12px 8px",
          maxWidth: "82%",
          boxShadow: "0 1px 1.5px rgba(0,0,0,0.13)",
        }}
      >
        <div style={{ fontSize: 22, lineHeight: 1.36, whiteSpace: "pre-wrap" }}>{renderWaText(text)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 15, color: WA.timestamp }}>{timestamp}</span>
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
 * A faithful recreation of the real WhatsApp chat UI on Android — not
 * just the app chrome but the phone's own status bar and nav bar too,
 * so the whole screen reads as an authentic screenshot rather than an
 * app mockup floating in isolation. WhatsApp isn't part of Wapi, so
 * this is built as its own component rather than loaded from a live
 * page. The incoming bubble is the exact order message the catalog's
 * own real sendCartToWA() template produces (captured via
 * catalog-director.js in the previous scene); the outgoing reply is
 * the business's own confirmation, supplied by the user.
 */
export const WhatsAppMockup: React.FC<Props> = ({ contactName, bubbles, avatarSrc }) => {
  const statusBarTime = bubbles[0]?.timestamp ?? "12:00";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: FONT_STACK }}>
      <StatusBar time={statusBarTime} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            background: WA.headerBg,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BackArrow />
          {avatarSrc ? <LogoAvatar src={avatarSrc} /> : <PersonAvatar />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: WA.headerText, fontSize: 26, fontWeight: 600, lineHeight: 1.2 }}>{contactName}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 17 }}>en línea</div>
          </div>
          <IconVideo />
          <IconCall />
          <IconMenu />
        </div>

        {/* Chat body */}
        <div
          style={{
            flex: 1,
            position: "relative",
            padding: "16px 14px",
            overflow: "hidden",
            backgroundColor: WA.wallpaper,
          }}
        >
          <WallpaperPattern />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.75)",
                  color: "#54656f",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 7,
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
        </div>

        {/* Input bar */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 14px" }}>
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              borderRadius: 999,
              padding: "9px 10px 9px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
            }}
          >
            <IconEmoji />
            <span style={{ flex: 1, color: "#8696a0", fontSize: 20 }}>Mensaje</span>
            <IconClip />
            <IconCamera />
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: WA.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconMic />
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  );
};
