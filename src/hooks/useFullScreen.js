// src/hooks/useFullScreen.js
import { useState, useCallback, useEffect } from 'react';

export const useFullScreen = (ref) => { // 'ref' is passed as a prop, it's the ref of the element to make fullscreen
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = useCallback(() => {
        if (ref && ref.current) { // Vérifier que ref et ref.current existent
            if (!document.fullscreenElement) {
                // Utiliser requestFullscreen sur l'élément référencé
                ref.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                // Utiliser exitFullscreen sur le document
                document.exitFullscreen();
            }
        } else {
            console.warn("Fullscreen toggle attempted without a valid ref.current element. Element might not be mounted or ref is null.");
        }
    }, [ref]); // ref est une dépendance car toggleFullScreen l'utilise

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        // Ajouter des listeners pour les différents préfixes de navigateur
        // Ces listeners doivent être attachés au 'document' ou à 'ref.current' si vous gérez le mode élément par élément
        // Pour un comportement global de "mode plein écran", attacher au document est standard.
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