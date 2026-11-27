import { useRef, useState } from "react";
import TopBar from "./components/TopBar";
import YouTubeStage from "./components/YouTubeStage";
import LyricsTeleprompter from "./components/LyricsTeleprompter";
import { DEMO_TRACK } from "./data/mockSong";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("studio");
  const [currentTrack, setCurrentTrack] = useState(DEMO_TRACK);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const playerRef = useRef(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setStatusMessage(`Búsqueda lista para conectar al backend: "${query}"`);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleSeek = (seconds) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  };

  return (
    <div className="app-shell">
      <TopBar
        mode={mode}
        onModeChange={setMode}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <main className={`workspace workspace--${mode}`}>
        <section className="stage-column">
          <div className="track-meta">
            <h2 className="notranslate" translate="no">{currentTrack.title}</h2>
            <span className="notranslate" translate="no">{currentTrack.artist}</span>
          </div>

          <YouTubeStage
            videoId={currentTrack.videoId}
            hidden={mode === "lyrics"}
            onTimeUpdate={setCurrentTime}
            playerRef={playerRef}
          />
        </section>

        {mode !== "video" && (
          <section className="lyrics-column">
            <LyricsTeleprompter
              syncedLyrics={currentTrack.syncedLyrics}
              plainLyrics={currentTrack.plainLyrics}
              currentTime={currentTime}
              onSeek={handleSeek}
              fullWidth={mode === "lyrics"}
            />
          </section>
        )}
      </main>
    </div>
  );
}
