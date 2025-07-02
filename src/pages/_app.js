// src/pages/_app.js
import '@/styles/globals.css'; 
import '../lib/i18n';

// Assure-toi que le reste du fichier est toujours la version simplifiée pour le test :
function MyApp({ Component, pageProps }) {
  console.log("MyApp simple test rendering"); // Debug log
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
}
export default MyApp;