import React from 'react';
import { GitBranch, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  githubUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  githubUrl = "https://github.com/michaelschellenberger/fmea-kontrollplan"
}) => {
  // Global build revision and timestamp injected by Vite
  const appRev = typeof __APP_REV__ !== 'undefined' ? __APP_REV__ : 'v1.0.0+rev.2026';
  const buildTime = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : new Date().toLocaleDateString('de-DE');

  return (
    <footer className="no-print mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-sm py-4 px-6 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Author & Open Source Notice */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Open Source Projekt von <strong className="text-brand-700">Michael Schellenberger</strong>
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Freie Nutzung (Nicht-kommerziell, CC BY-NC 4.0)
          </span>
        </div>

        {/* GitHub Link & Dynamic Revision Badge */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          {/* GitHub Icon + Repository Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors font-medium text-xs border border-slate-200/80 shadow-sm"
            title="Projekt auf GitHub ansehen"
          >
            {/* SVG GitHub Icon */}
            <svg
              className="w-4 h-4 fill-current text-slate-800"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>

          {/* Dynamische Revisions-Nummer */}
          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 text-xs font-mono font-medium border border-brand-200"
            title={`Automatischer Build-Stand: ${buildTime}`}
          >
            <GitBranch className="w-3.5 h-3.5 text-brand-600" />
            <span>Rev: {appRev}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
