import { useEffect, useRef } from "react";

export default function YouTubeStage({
  videoId,
  hidden = false,
  onTimeUpdate,
  playerRef,
}) {
  const containerRef = useRef(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const initializedRef = useRef(false);

  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === "function") {
        const t = player.getCurrentTime();
        if (typeof t === "number" && !Number.isNaN(t) && onTimeUpdateRef.current) {
          onTimeUpdateRef.current(t);
        }
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [playerRef]);

  useEffect(() => {
    if (!videoId) return;

    const mountOrLoad = () => {
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
        playerRef.current.loadVideoById(videoId);
        return;
      }

      if (!containerRef.current || initializedRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      initializedRef.current = true;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event) => {
            if (
              playerRef.current &&
              typeof playerRef.current.getCurrentTime === "function" &&
              onTimeUpdateRef.current
            ) {
              onTimeUpdateRef.current(playerRef.current.getCurrentTime());
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      mountOrLoad();
    } else {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        mountOrLoad();
      };
    }
  }, [videoId, playerRef]);

  return (
    <div className={`video-stage ${hidden ? "video-stage--audio-only" : ""}`}>
      <div ref={containerRef} className="youtube-embed" />
    </div>
  );
}
