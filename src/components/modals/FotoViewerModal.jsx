import React from 'react';
import { X } from 'lucide-react';
import { useModals } from '../../contexts/ModalContext';

export const FotoViewerModal = () => {
    const { fotoViewerModal, setFotoViewerModal } = useModals();

    if (!fotoViewerModal) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 transition-opacity">
            <div className="relative max-w-lg w-full animate-in zoom-in-95">
                <button
                    onClick={() => setFotoViewerModal(null)}
                    className="absolute -top-12 right-0 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all">
                    <X size={24} />
                </button>
                <img
                    src={fotoViewerModal}
                    className="w-full rounded-[2rem] shadow-2xl shadow-black/50 border border-white/10"
                    alt="Evidência da Ocorrência"
                />
            </div>
        </div>
    );
};
