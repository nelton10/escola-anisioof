import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [showToast, setShowToast] = useState(null);

    // Modals Data
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteStudentsModal, setDeleteStudentsModal] = useState(false);
    const [overtimeModal, setOvertimeModal] = useState(null);
    const [suspensionModal, setSuspensionModal] = useState(null);
    const [authReturnModal, setAuthReturnModal] = useState(null);
    const [endSuspensionModal, setEndSuspensionModal] = useState(null);
    const [editRecordModal, setEditRecordModal] = useState(null);
    const [fotoViewerModal, setFotoViewerModal] = useState(null);

    const showNotification = (msg) => {
        setShowToast(msg);
        setTimeout(() => setShowToast(null), 3000);
    };

    const value = {
        showToast, showNotification,
        deleteConfirm, setDeleteConfirm,
        deleteStudentsModal, setDeleteStudentsModal,
        overtimeModal, setOvertimeModal,
        suspensionModal, setSuspensionModal,
        authReturnModal, setAuthReturnModal,
        endSuspensionModal, setEndSuspensionModal,
        editRecordModal, setEditRecordModal,
        fotoViewerModal, setFotoViewerModal
    };

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export const useModals = () => useContext(ModalContext);
