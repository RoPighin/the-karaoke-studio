import { useEffect, useMemo, useRef } from "react";
import { parseLRC } from "../utils/lrcParser";

export default function LyricsTeleprompter({
  syncedLyrics,
  plainLyrics,
  currentTime,
  onSeek,
  fullWidth = false,
}) {
  const scrollContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  const parsedLines = useMemo(() => parseLRC(syncedLyrics), [syncedLyrics]);

  const activeIndex = useMemo(() => {
    if (parsedLines.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < parsedLines.length; i++) {
      if (currentTime >= parsedLines[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [parsedLines, currentTime]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const targetScrollTop =
      activeEl.offsetTop -
      container.clientHeight / 2 +
      activeEl.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  }, [activeIndex]);

  if (parsedLines.length > 0) {
    return (
      <div
        className={`lyrics-panel notranslate ${fullWidth ? "lyrics-panel--full" : ""}`}
        translate="no"
      >
        <div className="lyrics-badge">Letra sincronizada (LRC)</div>
        <div ref={scrollContainerRef} className="lyrics-scroll">
          {parsedLines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            return (
              <p
                key={`${line.time}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek && onSeek(line.time)}
                className={`lyric-line notranslate ${isActive ? "active" : ""} ${
                  isPast ? "past" : ""
                }`}
                translate="no"
                title="Clic para saltar a este momento"
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  if (plainLyrics) {
    return (
      <div
        className={`lyrics-panel notranslate ${fullWidth ? "lyrics-panel--full" : ""}`}
        translate="no"
      >
        <div className="lyrics-badge">Letra estática</div>
        <div className="lyrics-scroll plain">
          {plainLyrics.split("\n").map((line, idx) => (
            <p key={idx} className="lyric-line plain-line notranslate" translate="no">
              {line || "\u00A0"}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`lyrics-panel empty ${fullWidth ? "lyrics-panel--full" : ""}`}>
      <p>No hay letra disponible para esta canción.</p>
    </div>
  );
}
