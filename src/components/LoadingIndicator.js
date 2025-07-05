// src/components/LoadingIndicator.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { motion, AnimatePresence } from 'framer-motion';

NProgress.configure({ showSpinner: false, speed: 400, trickleSpeed: 200 });

const LoadingIndicator = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      console.log('Router Event: routeChangeStart for URL:', url); // AJOUTE CETTE LIGNE
      setLoading(true);
      NProgress.start();
    };

    const handleStop = (url) => {
      console.log('Router Event: routeChangeComplete/routeChangeError for URL:', url); // AJOUTE CETTE LIGNE
      setLoading(false);
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(255, 255, 255, 0.3)',
              borderTop: '6px solid #FF69B4',
              borderRadius: '50%',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIndicator;