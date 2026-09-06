import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Exported so BurningChatLog.tsx (the self-destruct/burn variant) can
// reuse the exact same visual building blocks instead of duplicating
// them — only the export keywords are new here, behavior is unchanged.
export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

// Dark-mode WhatsApp's own real palette — shared by every scene that
// composites a conversation onto a real photographed phone mockup.
export const WA = {
  bubbleOut: "#005c4b",
  bubbleIn: "#202c33",
  text: "#e9edef",
  timestamp: "#8696a0",
  readTick: "#53bdeb",
  link: "#53bdeb",
};

export function IconReadTicks() {
  return (
    <svg width="16" height="11" viewBox="0 0 18 13" fill="none">
      <path d="M1 6.8l3.6 3.6L11 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.3 6.8l3.6 3.6L17 3.6" stroke={WA.readTick} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** WhatsApp renders *text* as bold, auto-links bare URLs in its own
 * link blue, and single line breaks as-is — parse just enough of that
 * real markdown to render message text faithfully (the real captured
 * order message uses *bold*, and the Wapi link is its own message). */
export function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*[^*]+\*|https?:\/\/\S+)/g).filter(Boolean);
    return (
      <div key={i} style={{ minHeight: line ? undefined : "1em" }}>
        {parts.map((part, j) => {
          const boldMatch = /^\*([^*]+)\*$/.exec(part);
          if (boldMatch) return <strong key={j}>{boldMatch[1]}</strong>;
          if (/^https?:\/\//.test(part)) {
            return (
              <span key={j} style={{ color: WA.link }}>
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

export type DarkBubble = { from: "them" | "me"; text: string; timestamp: string; atFrame: number };

// Exported so AutoScrollChatLog.tsx (the long-conversation, auto-
// scrolling variant) can reuse the exact same bubble rendering/entrance
// spring instead of duplicating it.
export const DarkChatBubble: React.FC<DarkBubble & { marginTop: number; fontSize: number }> = ({
  from,
  text,
  timestamp,
  atFrame,
  marginTop,
  fontSize,
}) => {
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
        marginTop,
      }}
    >
      <div
        style={{
          background: outgoing ? WA.bubbleOut : WA.bubbleIn,
          color: WA.text,
          borderRadius: outgoing ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
          padding: "9px 12px 8px",
          maxWidth: "82%",
        }}
      >
        <div style={{ fontFamily: FONT_STACK, fontSize, lineHeight: 1.32 }}>{renderText(text)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontFamily: FONT_STACK, fontSize: fontSize * 0.68, color: WA.timestamp }}>{timestamp}</span>
          {outgoing && <IconReadTicks />}
        </div>
      </div>
    </div>
  );
};

export const HoyPill: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div
      style={{
        // Real WhatsApp's dark-mode date pill is a near-solid dark chip —
        // at 8% white opacity the busy wallpaper doodles showed through
        // strongly enough to break up its edges into an irregular shape
        // instead of a clean rounded rectangle.
        background: "rgba(24, 34, 41, 0.92)",
        color: WA.timestamp,
        fontFamily: FONT_STACK,
        fontSize: 15,
        fontWeight: 600,
        padding: "5px 12px",
        borderRadius: 7,
      }}
    >
      {label}
    </div>
  </div>
);

/**
 * A WhatsApp dark-mode chat log — HOY divider + bubbles, spaced so
 * consecutive messages from the same sender sit closer together than
 * a sender change, starting a natural gap below the header (like a
 * real conversation that begins near the top and grows down) rather
 * than centered or pinned tight against the header. Meant to sit
 * inside PhotoPhoneMockup's chat-area overlay.
 *
 * `compact` shrinks the font and gaps for scenes with more/longer
 * messages than comfortably fit at the default size — the "no
 * scrolling" of a static composited screen means the content has to
 * fit outright.
 */
export const DarkChatLog: React.FC<{
  bubbles: DarkBubble[];
  compact?: boolean;
  dateLabel?: string;
  /** false when the mockup photo already has its own date/"Hoy"
   * divider baked in (e.g. FakeChatSoloPhoneScene's blank-chat
   * reference photo) — skips rendering a second one. */
  showDateLabel?: boolean;
}> = ({ bubbles, compact = false, dateLabel = "HOY", showDateLabel = true }) => {
  const fontSize = compact ? 18 : 22;
  const senderChangeGap = compact ? 18 : 26;
  const sameSenderGap = compact ? 10 : 14;
  const hoyGap = compact ? 20 : 30;

  return (
    <div style={{ padding: "24px 12px 0" }}>
      {showDateLabel && (
        <div style={{ marginBottom: hoyGap }}>
          <HoyPill label={dateLabel} />
        </div>
      )}
      {bubbles.map((b, i) => {
        const prev = bubbles[i - 1];
        const marginTop = i === 0 ? 0 : prev.from !== b.from ? senderChangeGap : sameSenderGap;
        return <DarkChatBubble key={i} {...b} marginTop={marginTop} fontSize={fontSize} />;
      })}
    </div>
  );
};
