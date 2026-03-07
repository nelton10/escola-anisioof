import React from 'react';
import { useModals } from '../../contexts/ModalContext';

export const GlobalToast = () => {
    const { showToast } = useModals();

    if (!showToast) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-800/20 z-[160] font-bold text-sm flex items-center gap-3 animate-in slide-in-from-top-6 fade-in border border-slate-700">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            {showToast}
        </div>
    );
};
