// src/pages/index.js
import Head from 'next/head';

export default function Home() {
  console.log("Home simple test rendering"); // Debug log
  return (
    <>
      <Head>
        <title>Test Simple</title>
      </Head>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>HELLO WORLD TEST !</h1>
      </div>
    </>
  );
}