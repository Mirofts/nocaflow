import { useState, useCallback, useEffect } from 'react';

export const useFullScreen = (ref) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    const elem = ref?.current;

    if (!elem) {
      console.warn("Impossible de passer en plein écran : ref.current est vide.");
      return;
    }

    const isCurrentlyFullScreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (!isCurrentlyFullScreen) {
      const requestFullscreen =
        elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.msRequestFullscreen;

      if (requestFullscreen) {
        const maybePromise = requestFullscreen.call(elem);
        if (maybePromise?.catch) {
          maybePromise.catch((err) => {
            console.error("Erreur en entrant en plein écran :", err);
          });
        }
      } else {
        console.warn("L'API Fullscreen n'est pas supportée.");
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(document);
      }
    }
  }, [ref]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS =
        !!(document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement);
      setIsFullScreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return { isFullScreen, toggleFullScreen };
};
