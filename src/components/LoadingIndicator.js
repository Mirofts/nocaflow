// src/components/LoadingIndicator.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { motion, AnimatePresence } from 'framer-motion';

// Optionnel: Configure NProgress. showSpinner: false est important si tu utilises ton propre spinner.
NProgress.configure({ showSpinner: false, speed: 400, trickleSpeed: 200 });

const LoadingIndicator = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // État pour contrôler la visibilité du spinner personnalisé

  useEffect(() => {
    // Fonction appelée au début de la navigation
    const handleStart = () => {
      setLoading(true); // Affiche le spinner personnalisé
      NProgress.start(); // Démarre la barre de progression NProgress
    };

    // Fonction appelée à la fin de la navigation (succès ou erreur)
    const handleStop = () => {
      setLoading(false); // Cache le spinner personnalisé
      NProgress.done(); // Termine la barre de progression NProgress
    };

    // Écoute les événements du routeur
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop); // Gère aussi les erreurs pour cacher le spinner

    // Fonction de nettoyage pour désabonner les écouteurs d'événements
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]); // Dépendance à l'objet router pour s'assurer que les écouteurs sont bien configurés

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fond semi-transparent plus sombre pour mieux voir le spinner
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // Assure que le spinner est au-dessus de tout
          }}
        >
          {/* Ton spinner personnalisé Framer Motion */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '60px', // Taille légèrement augmentée
              height: '60px',
              border: '6px solid rgba(255, 255, 255, 0.3)', // Cercle gris clair
              borderTop: '6px solid #FF69B4', // Partie rose (couleur NocaFLOW)
              borderRadius: '50%',
            }}
          />
          {/* Optionnel: Ajoute un texte ou une icône au centre du spinner */}
          {/* <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{
              position: 'absolute',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Loading...
          </motion.span> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIndicator;