import React from 'react';

const Modal = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, type = 'confirm' }) => {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';
  const isAlert = type === 'alert';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {title && <div className="text-lg font-semibold text-slate-800 mb-2">{title}</div>}
        <div className="text-slate-600 mb-6">{message}</div>
        <div className="flex gap-3 justify-end">
          {isAlert ? (
            <button
              onClick={onConfirm}
              className="btn btn-primary"
            >
              {confirmText}
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="btn btn-ghost"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="btn btn-primary"
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
