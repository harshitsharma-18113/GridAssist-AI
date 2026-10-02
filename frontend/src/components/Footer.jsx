import React from 'react';
import Branding from './Branding';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <Branding layout="row" />
      </div>
    </footer>
  );
}
