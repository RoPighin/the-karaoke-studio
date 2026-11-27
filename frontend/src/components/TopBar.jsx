import { useState } from "react";

const MODES = [
  { id: "studio", label: "Studio Mode" },
  { id: "video", label: "Solo Video" },
  { id: "lyrics", label: "Solo Letra" },
];

export default function TopBar({ mode, onModeChange, onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
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
          onChange={(e) => setQuery(e.target.value)}
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
