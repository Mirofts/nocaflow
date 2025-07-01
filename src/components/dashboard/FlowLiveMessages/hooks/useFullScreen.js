// src/components/dashboard/FlowLiveMessages/hooks/useFullScreen.js
import { useState, useEffect, useCallback, useImperativeHandle } from 'react';

const useFullScreen = (elementRef, componentRef) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
  }, []);

  const toggleFullScreen = useCallback(() => {
    const element = elementRef.current;
    if (element) {
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) { element.requestFullscreen().catch(e => console.error("Fullscreen failed on element:", e)); }
        else if (element.mozRequestFullScreen) { element.mozRequestFullScreen().catch(e => console.error("Fullscreen failed on element (moz):", e)); }
        else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen().catch(e => console.error("Fullscreen failed on element (webkit):", e)); }
        else if (element.msRequestFullscreen) { element.msRequestFullscreen().catch(e => console.error("Fullscreen failed on element (ms):", e)); }
      } else {
        if (document.exitFullscreen) { document.exitFullscreen(); }
        else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
        else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        else if (document.msExitFullscreen) { document.msExitFullscreen(); }
      }
    }
  }, [elementRef]);

  useImperativeHandle(componentRef, () => ({
    toggleFullScreen: toggleFullScreen
  }));

  return { isFullScreen, toggleFullScreen };
};

export default useFullScreen;