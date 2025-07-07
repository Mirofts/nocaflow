// src/hooks/useFullScreen.js
import { useState, useCallback, useEffect } from 'react';

export const useFullScreen = (ref) => { // 'ref' is passed as a prop, it's the ref of the element to make fullscreen
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = useCallback(() => {
        if (ref && ref.current) { // Vérifier que ref et ref.current existent
            // Check if element supports requestFullscreen, or use browser-prefixed versions
            if (ref.current.requestFullscreen) {
                ref.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else if (ref.current.webkitRequestFullscreen) { // Safari
                ref.current.webkitRequestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode (webkit): ${err.message} (${err.name})`);
                });
            } else if (ref.current.mozRequestFullScreen) { // Firefox
                ref.current.mozRequestFullScreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode (moz): ${err.message} (${err.name})`);
                });
            } else if (ref.current.msRequestFullscreen) { // IE/Edge
                ref.current.msRequestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode (ms): ${err.message} (${err.name})`);
                });
            } else {
                console.warn("Fullscreen API not supported on this element or browser.");
            }
        } else {
            console.warn("Fullscreen toggle attempted without a valid ref.current element. Element might not be mounted or ref is null.");
        }

        // Check for exiting fullscreen
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    }, [ref]); // ref est une dépendance car toggleFullScreen l'utilise

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement));
        };

        // Ajouter des listeners pour les différents préfixes de navigateur
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
        document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE/Edge

        return () => {
            // Nettoyage des listeners
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []); // Aucune dépendance car les listeners sont gérés globalement sur le document

    return { isFullScreen, toggleFullScreen };
};