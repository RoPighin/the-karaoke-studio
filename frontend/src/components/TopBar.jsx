import { useState } from "react";

const MODES = [
  { id: "studio", label: "Studio Mode" },
  { id: "video", label: "Solo Video" },
  { id: "lyrics", label: "Solo Letra" },
];

const MAX_SEARCH_LENGTH = 100;

export function sanitizeSearchInput(rawValue) {
  if (typeof rawValue !== "string") return "";

  return rawValue
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\b(?:javascript|data|vbscript)\s*:/gi, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, MAX_SEARCH_LENGTH);
}

export default function TopBar({ mode, onModeChange, onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const cleaned = sanitizeSearchInput(e.target.value);
    setQuery(cleaned);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalQuery = sanitizeSearchInput(query).trim();
    setQuery(finalQuery);
    if (!finalQuery) return;
    onSearch(finalQuery);
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        <h1>The Karaoke Studio</h1>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder="Buscar canción o artista (ej. Bohemian Rhapsody Queen)..."
          aria-label="Buscar canción"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <nav className="mode-switcher" aria-label="Modos de visualización">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mode-btn ${mode === item.id ? "active" : ""}`}
            onClick={() => onModeChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
