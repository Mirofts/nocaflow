// src/components/LoadingIndicator.js
import { useEffect, useState } from 'react'; // Add useState
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { motion, AnimatePresence } from 'framer-motion'; // For animations

NProgress.configure({ showSpinner: false, speed: 400, trickleSpeed: 200 });

const LoadingIndicator = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to control spinner visibility

  useEffect(() => {
    const handleStart = (url) => {
      setLoading(true);
      NProgress.start();
    };
    const handleStop = () => {
      setLoading(false);
      NProgress.done();
    };
    const handleError = () => {
      setLoading(false);
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleError);
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // Ensure it's on top
          }}
        >
          {/* Your beautiful spinner goes here */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3', // Light grey
              borderTop: '5px solid #3498db', // Blue spinner part
              borderRadius: '50%',
            }}
          />
          {/* You can replace the simple spinner above with an SVG, Lottie animation, etc. */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIndicator;