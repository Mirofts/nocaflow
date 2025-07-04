import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('common'); // ✅ Appelé dans le composant et avec namespace

  return (
    <footer className="bg-color-bg-secondary border-t border-color-border-primary py-10 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-color-text-secondary text-sm space-y-6 md:space-y-0">
        <div className="text-center md:text-left">
          {/* Removed t('footer_copyright') to address hydration issue */}
          <p>© 2025 NocaFLOW. Le travail, unifié.</p>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/privacy" className="hover:text-color-text-primary transition-colors">
            {t('privacy') || 'Confidentialité'}
          </Link>
          <Link href="/terms" className="hover:text-color-text-primary transition-colors">
            {t('terms') || 'Conditions'}
          </Link>
          <Link href="/contact" className="hover:text-color-text-primary transition-colors">
            {t('contact_us') || 'Nous contacter'}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-color-text-secondary hover:text-color-text-primary transition-colors">
            {/* Twitter Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17-19 11.6 11.3 7.5 22.9-2.8 20-10.4C22.9 8.6 22 4 22 4Z" />
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-color-text-secondary hover:text-color-text-primary transition-colors">
            {/* LinkedIn Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-color-text-secondary hover:text-color-text-primary transition-colors">
            {/* Facebook Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;