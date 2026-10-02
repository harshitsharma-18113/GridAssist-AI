import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

// Toast Component
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-600 shrink-0" size={16} />;
      case 'info':
      default:
        return <Info className="text-blue-600 shrink-0" size={16} />;
    }
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-lg flex items-start gap-3 max-w-sm w-full animate-in slide-in-from-bottom duration-300 ${getStyle()}`}>
      {getIcon()}
      <div className="flex-1 text-xs font-semibold leading-relaxed">
        {message}
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

// Confirmation Modal Component
export function Modal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-750 text-white font-semibold text-xs rounded-lg shadow transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton Card Component
export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="h-8 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-150 rounded w-full" />
    </div>
  );
}

// Skeleton Table Component
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-slate-50 border-b border-slate-100 w-full rounded-t-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center justify-between p-3.5 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-1/6" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/6" />
          <div className="h-4 bg-slate-100 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
}
