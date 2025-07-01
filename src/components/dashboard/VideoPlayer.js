// components/VideoPlayer.js
import React from 'react';

const VideoPlayer = ({ platform, videoId }) => {
  let embedUrl = null;

  if (platform === 'youtube' && videoId) {
    // CORRECTION : L'URL d'intégration YouTube a été corrigée.
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  } else if (platform === 'vimeo' && videoId) {
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0`;
  }

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-slate-800 flex items-center justify-center text-center text-slate-400 p-4 rounded-xl">
        Vidéo non disponible.
      </div>
    );
  }

  return (
    <div className="w-full aspect-video">
      <iframe
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-xl" // Ajout de rounded-xl pour le style
        title="Lecteur Vidéo"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;