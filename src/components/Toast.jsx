import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${bgColor} text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50`}>
      {message}
    </div>
  );
}
