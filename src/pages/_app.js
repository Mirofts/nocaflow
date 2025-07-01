// src/pages/_app.js
import '@/styles/globals.css'; // Importe le CSS généré dans public/

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