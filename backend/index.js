import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ytSearch from "yt-search";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "The Karaoke Studio" });
});

app.get("/api/search", async (req, res) => {
  const { q = "" } = req.query;

  if (!q.trim()) {
    return res.status(400).json({ error: "Falta el término de búsqueda (q)." });
  }

  try {
    const searchQuery = `${q.trim()} karaoke`;
    const result = await ytSearch(searchQuery);

    const videos = (result.videos || []).slice(0, 6).map((video) => ({
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.author?.name || "",
      thumbnail: video.thumbnail || "",
      duration: video.timestamp || "",
    }));

    res.json({ results: videos });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar videos en YouTube." });
  }
});

app.get("/api/lyrics", async (req, res) => {
  const { track_name = "", artist_name = "" } = req.query;

  if (!track_name.trim()) {
    return res
      .status(400)
      .json({ error: "Falta el nombre de la canción (track_name)." });
  }

  try {
    const params = new URLSearchParams({
      track_name: track_name.trim(),
      artist_name: artist_name.trim(),
    });

    const response = await fetch(
      `https://lrclib.net/api/get?${params.toString()}`
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "No se encontró la letra en LRCLIB." });
    }

    const data = await response.json();
    res.json({
      id: data.id,
      trackName: data.trackName,
      artistName: data.artistName,
      syncedLyrics: data.syncedLyrics || null,
      plainLyrics: data.plainLyrics || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al consultar LRCLIB." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
