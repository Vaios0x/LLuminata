'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/ai-services/chatbot-service';
import { useChatbot } from '@/lib/hooks/useChatbot';

// Tipos para el componente
interface SuperAIIconProps {
  size?: number;
  color?: string;
}

interface Action {
  type: 'navigate' | 'open_feature' | 'show_resource' | 'start_lesson' | 'accessibility_adjust';
  target: string;
  description: string;
}

// Icono de Super IA inspirado en RoboCop
const SuperAIIcon = ({ size = 28, color = 'currentColor' }: SuperAIIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="robocopGradient" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#374151"/>
        <stop offset="0.3" stopColor="#1F2937"/>
        <stop offset="0.7" stopColor="#111827"/>
        <stop offset="1" stopColor="#000000"/>
      </linearGradient>
      <linearGradient id="visorGradient" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E40AF"/>
        <stop offset="0.5" stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#60A5FA"/>
      </linearGradient>
      <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E5E7EB"/>
        <stop offset="0.5" stopColor="#D1D5DB"/>
        <stop offset="1" stopColor="#9CA3AF"/>
      </linearGradient>
    </defs>
    
    {/* Cuerpo principal */}
    <path d="M4 6 L20 6 L20 18 L4 18 L4 6 Z" fill="url(#robocopGradient)" stroke="#6B7280" strokeWidth="0.5"/>
    
    {/* Visor principal */}
    <rect x="6" y="8" width="12" height="6" rx="1" fill="#000000"/>
    <rect x="6" y="8" width="12" height="6" rx="1" fill="url(#visorGradient)"/>
    
    {/* Línea de escaneo */}
    <rect x="6.5" y="10.5" width="11" height="1" fill="#FFFFFF" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
    </rect>
    
    {/* Indicador de estado */}
    <rect x="11.5" y="8.5" width="1" height="5" fill="#FFFFFF" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s"/>
    </rect>
    
    {/* Detalles laterales */}
    <rect x="3" y="7" width="1" height="10" fill="url(#chromeGradient)"/>
    <rect x="20" y="7" width="1" height="10" fill="url(#chromeGradient)"/>
    
    {/* Indicadores de estado */}
    <rect x="2" y="8" width="0.5" height="3" fill="#F59E0B"/>
    <rect x="21.5" y="8" width="0.5" height="3" fill="#F59E0B"/>
    
    {/* Luces de estado */}
    <circle cx="2.25" cy="7.5" r="0.3" fill="#FFFFFF" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="21.75" cy="7.5" r="0.3" fill="#FFFFFF" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>
    </circle>
    
    {/* Base */}
    <rect x="9" y="15" width="6" height="1.5" rx="0.5" fill="url(#chromeGradient)"/>
    <rect x="9.5" y="15.2" width="5" height="1.1" fill="#1F2937"/>
    
    {/* Indicadores de energía */}
    <rect x="7" y="19" width="10" height="0.5" rx="0.25" fill="#EF4444" opacity="0.8"/>
    <rect x="8" y="19.8" width="8" height="0.3" rx="0.15" fill="#EF4444" opacity="0.6"/>
    
    {/* Detalles del visor */}
    <rect x="6.5" y="8.5" width="1" height="1" rx="0.25" fill="#FFFFFF" opacity="0.7"/>
    <rect x="16.5" y="8.5" width="1" height="1" rx="0.25" fill="#FFFFFF" opacity="0.7"/>
    
    {/* Bordes superiores e inferiores */}
    <rect x="5" y="6" width="14" height="0.5" fill="url(#chromeGradient)"/>
    <rect x="5" y="17.5" width="14" height="0.5" fill="url(#chromeGradient)"/>
  </svg>
);

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showPulse, setShowPulse] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, suggestions, actions, sendMessage } = useChatbot();

  // Sugerencias predefinidas
  const defaultSuggestions = [
            '¿Qué es Lluminata? 🤔',
    '¿Cómo funciona el aprendizaje adaptativo? 📚',
    '¿Qué características de accesibilidad tienes? ♿',
    '¿Puedes ayudarme con matemáticas? 📐'
  ];

  // Acciones predefinidas
  const defaultActions: Action[] = [
    {
      type: 'navigate',
      target: '/dashboard',
      description: 'Ir al Dashboard'
    },
    {
      type: 'navigate',
      target: '/lessons',
      description: 'Ver Lecciones'
    },
    {
      type: 'navigate',
      target: '/assessments',
      description: 'Evaluaciones'
    }
  ];

  // Efecto para mostrar notificación
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Efecto para ocultar pulso después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para hacer scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para manejar el envío de mensajes
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
    
    try {
      await sendMessage(message);
      setNotificationMessage('Mensaje enviado correctamente');
      setShowNotification(true);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setNotificationMessage('Error al enviar mensaje');
      setShowNotification(true);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isLoading, sendMessage]);

  // Función para manejar tecla Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Función para ejecutar acciones
  const executeAction = (action: Action) => {
    console.log('Ejecutando acción:', action);
    // Aquí se implementaría la lógica para ejecutar las acciones
    setNotificationMessage(`Ejecutando: ${action.description}`);
    setShowNotification(true);
  };

  return (
    <>
      {/* Botón flotante del chatbot */}
      <div className="fixed bottom-6 right-6 z-[99999]">
        {/* Indicador de pulso */}
        {showPulse && (
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            ¡Hola! ¿Necesitas ayuda? 🤖
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label={isOpen ? "Cerrar chatbot" : "Abrir chatbot"}
          tabIndex={0}
        >
          {isOpen ? (
            <span className="text-white text-3xl">✕</span>
          ) : (
            <SuperAIIcon size={24} color="white" />
          )}
        </button>
      </div>

      {/* Ventana del chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-20 right-6 w-80 h-[500px] z-40"
            style={{ zIndex: 999998 }}
          >
            <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-2xl rounded-2xl overflow-hidden">
              {/* Notificación */}
              {showNotification && (
                <div className="absolute top-2 left-2 right-2 z-10 px-3 py-1 bg-green-500 text-white text-xs rounded-lg shadow-lg">
                  <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{notificationMessage}</span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <SuperAIIcon size={12} color="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Lluminato</h3>
                    <p className="text-xs text-gray-500">Asistente experto en todo</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Cerrar chatbot"
                  tabIndex={0}
                >
                  <span className="text-gray-500">✕</span>
                </button>
              </div>

              {/* Área de mensajes */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            <SuperAIIcon size={12} color="#3B82F6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <span className="text-white text-xs mt-1">👤</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <SuperAIIcon size={16} color="#3B82F6" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Referencia para scroll automático */}
                <div ref={messagesEndRef} />
              </div>

              {/* Sugerencias */}
              {(suggestions.length > 0 || defaultSuggestions.length > 0) && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Sugerencias:</p>
                  <div className="flex flex-wrap gap-2">
                    {(suggestions.length > 0 ? suggestions : defaultSuggestions).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                        aria-label={`Sugerencia: ${suggestion}`}
                        tabIndex={0}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones rápidas */}
              {(actions.length > 0 || defaultActions.length > 0) && (
                <div className="p-3 border-t border-gray-200 bg-blue-50">
                  <p className="text-xs text-blue-600 mb-2">Acciones rápidas:</p>
                  <div className="flex flex-wrap gap-2">
                    {(actions.length > 0 ? actions : defaultActions).map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAction(action)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                        aria-label={`Acción: ${action.description}`}
                        tabIndex={0}
                      >
                        {action.description}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input de mensaje */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                      disabled={isLoading}
                      aria-label="Mensaje del chatbot"
                      tabIndex={0}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Enviar mensaje"
                    tabIndex={0}
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <span className="text-white text-xs">📤</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
