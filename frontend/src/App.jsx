import { useRef, useState } from "react";
import TopBar from "./components/TopBar";
import YouTubeStage from "./components/YouTubeStage";
import LyricsTeleprompter from "./components/LyricsTeleprompter";
import { DEMO_TRACK } from "./data/mockSong";
import "./App.css";

//const API_BASE = "http://localhost:3001";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

function extractTrackAndArtist(query) {
  const clean = query
    .replace(/\b(karaoke|instrumental|lyrics|letra|official|video|hd|4k)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.includes(" - ")) {
    const [first, ...rest] = clean.split(" - ");
    return {
      artist: first.trim(),
      track: rest.join(" - ").trim(),
    };
  }

  return {
    artist: "",
    track: clean || query.trim(),
  };
}

export default function App() {
  const [mode, setMode] = useState("studio");
  const [currentTrack, setCurrentTrack] = useState(DEMO_TRACK);
  const [searchResults, setSearchResults] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const playerRef = useRef(null);

  const fetchLyricsForQuery = async (rawTitle) => {
    const { artist, track } = extractTrackAndArtist(rawTitle);
    const params = new URLSearchParams({ track_name: track });
    if (artist) params.set("artist_name", artist);

    let res = await fetch(`${API_BASE}/api/lyrics?${params.toString()}`);

    if (!res.ok && artist) {
      const fallbackParams = new URLSearchParams({ track_name: `${artist} ${track}`.trim() });
      res = await fetch(`${API_BASE}/api/lyrics?${fallbackParams.toString()}`);
    }

    if (!res.ok) return null;
    return res.json();
  };

  const handleSearch = async (query) => {
    setIsLoading(true);
    setStatusMessage(`Buscando "${query}" en YouTube y letras...`);

    try {
      const [videoRes, lyricsData] = await Promise.all([
        fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`),
        fetchLyricsForQuery(query),
      ]);

      const videoData = await videoRes.json();
      if (!videoRes.ok) {
        throw new Error(videoData.error || "Error al buscar videos.");
      }

      const videos = videoData.results || [];
      setSearchResults(videos);

      if (videos.length === 0) {
        setStatusMessage("No se encontraron videos para esa búsqueda.");
        return;
      }

      const firstVideo = videos[0];
      setCurrentTrack((prev) => ({
        videoId: firstVideo.videoId,
        title: firstVideo.title,
        artist: firstVideo.channelTitle || prev.artist,
        syncedLyrics: lyricsData?.syncedLyrics || "",
        plainLyrics: lyricsData?.plainLyrics || "",
      }));
      setCurrentTime(0);

      setStatusMessage(
        lyricsData?.syncedLyrics
          ? "Video y letra sincronizada cargados."
          : lyricsData?.plainLyrics
          ? "Video cargado con letra estática (sin timestamps)."
          : "Video cargado. No se encontró letra automática para este título."
      );
    } catch (err) {
      setStatusMessage(err.message || "Error al conectar con el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVideo = async (video) => {
    setIsLoading(true);
    setStatusMessage(`Cargando "${video.title}"...`);
    try {
      const lyricsData = await fetchLyricsForQuery(video.title);
      setCurrentTrack({
        videoId: video.videoId,
        title: video.title,
        artist: video.channelTitle || "",
        syncedLyrics: lyricsData?.syncedLyrics || "",
        plainLyrics: lyricsData?.plainLyrics || "",
      });
      setCurrentTime(0);
      setStatusMessage(
        lyricsData?.syncedLyrics
          ? "Letra sincronizada lista."
          : "Video actualizado."
      );
    } finally {
      setIsLoading(false);
    }
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

      {searchResults.length > 1 && (
        <section className="results-strip" aria-label="Resultados de búsqueda">
          {searchResults.map((vid) => (
            <button
              key={vid.videoId}
              type="button"
              className={`result-card ${
                currentTrack.videoId === vid.videoId ? "selected" : ""
              }`}
              onClick={() => handleSelectVideo(vid)}
            >
              {vid.thumbnail && (
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="result-thumb"
                />
              )}
              <div className="result-info">
                <span className="result-title notranslate" translate="no">
                  {vid.title}
                </span>
                <span className="result-channel notranslate" translate="no">
                  {vid.channelTitle} {vid.duration ? `· ${vid.duration}` : ""}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

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
