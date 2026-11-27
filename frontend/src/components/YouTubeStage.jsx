import { useEffect, useRef } from "react";

export default function YouTubeStage({
  videoId,
  hidden = false,
  onTimeUpdate,
  playerRef,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;

    let intervalId = null;

    const createPlayer = () => {
      if (!containerRef.current) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }

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
          onReady: () => {
            intervalId = setInterval(() => {
              if (
                playerRef.current &&
                typeof playerRef.current.getCurrentTime === "function"
              ) {
                onTimeUpdate(playerRef.current.getCurrentTime());
              }
            }, 250);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoId, onTimeUpdate, playerRef]);

  return (
    <div className={`video-stage ${hidden ? "video-stage--audio-only" : ""}`}>
      <div ref={containerRef} className="youtube-embed" />
    </div>
  );
}
