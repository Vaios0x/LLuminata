'use client';

import React, { useState } from 'react';

export function ChatbotSimple() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('Botón clickeado!');
    console.log('Estado anterior:', isOpen);
    setIsOpen(!isOpen);
    console.log('Nuevo estado:', !isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón ultra simple */}
      <button
        onClick={handleClick}
        className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white text-2xl font-bold shadow-lg border-2 border-white cursor-pointer"
        style={{ zIndex: 99999 }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Ventana ultra simple */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[400px] bg-white border-2 border-red-200 rounded-lg shadow-lg z-40">
          <div className="p-4 bg-red-50 border-b">
            <h3 className="font-bold text-red-800">Chatbot Simple</h3>
            <p className="text-sm text-red-600">Estado: {isOpen ? 'Abierto' : 'Cerrado'}</p>
          </div>
          <div className="p-4">
            <p>¡El chatbot está funcionando!</p>
            <p>Estado actual: {isOpen.toString()}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
