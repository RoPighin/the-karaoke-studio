import { useEffect, useMemo, useRef } from "react";
import { parseLRC } from "../utils/lrcParser";

export default function LyricsTeleprompter({
  syncedLyrics,
  plainLyrics,
  currentTime,
  onSeek,
  fullWidth = false,
}) {
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
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  if (parsedLines.length > 0) {
    return (
      <div className={`lyrics-panel ${fullWidth ? "lyrics-panel--full" : ""}`}>
        <div className="lyrics-badge">Letra sincronizada (LRC)</div>
        <div className="lyrics-scroll">
          {parsedLines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            return (
              <p
                key={`${line.time}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek && onSeek(line.time)}
                className={`lyric-line ${isActive ? "active" : ""} ${
                  isPast ? "past" : ""
                }`}
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
      <div className={`lyrics-panel ${fullWidth ? "lyrics-panel--full" : ""}`}>
        <div className="lyrics-badge">Letra estática</div>
        <div className="lyrics-scroll plain">
          {plainLyrics.split("\n").map((line, idx) => (
            <p key={idx} className="lyric-line plain-line">
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
