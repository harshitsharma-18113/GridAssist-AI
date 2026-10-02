import React from 'react';

export default function CompanyBrand({ variant = 'horizontal', showDetails = true, className = '' }) {
  const logoUrl = "https://thesaicomputers.com/wp-content/uploads/2023/images/SAI_logo_Png_2-01.png";

  const renderLogo = (height = "h-8") => (
    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs inline-flex items-center justify-center shrink-0">
      <img 
        src={logoUrl} 
        alt="Sai Computers Limited Logo" 
        className={`${height} w-auto object-contain`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = `
            <div class="bg-blue-600 text-white font-extrabold text-[10px] uppercase w-8 h-8 rounded flex items-center justify-center select-none shadow-sm">
              SCL
            </div>
          `;
        }}
      />
    </div>
  );

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 select-none ${className}`}>
        {renderLogo("h-12")}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">GridAssist AI</h2>
          <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Version 1.0</p>
        </div>
        <div className="border-t border-slate-100 pt-3 w-full max-w-xs">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
            Developed during Internship at
          </p>
          <span className="font-semibold text-slate-700 text-xs mt-1 block">Sai Computers Limited</span>
        </div>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center text-center space-y-4 select-none ${className}`}>
        {renderLogo("h-14")}
        <div className="border-t border-slate-100 pt-3 w-full max-w-xs">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">
            Developed during Internship at
          </p>
          <span className="font-semibold text-slate-700 text-sm mt-1 block">
            Sai Computers Limited
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col md:flex-row items-center justify-between w-full gap-4 text-xs text-slate-500 select-none ${className}`}>
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5 justify-center md:justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>GridAssist AI v1.0</span>
          </div>
          <div>Developed during Internship at <span className="font-medium text-slate-800">Sai Computers Limited</span></div>
          <div>© 2026 GridAssist AI</div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          {renderLogo("h-8")}
          <span className="text-[9px] tracking-widest text-blue-600 font-bold uppercase mt-1">
            Internship Prototype
          </span>
        </div>
      </div>
    );
  }

  // default 'horizontal' (for Navbar)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {renderLogo("h-7")}
      {showDetails && (
        <div className="flex flex-col select-none text-left">
          <span className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight">
            GridAssist AI
          </span>
          <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
            Internship Project • Sai Computers Ltd.
          </span>
        </div>
      )}
    </div>
  );
}
