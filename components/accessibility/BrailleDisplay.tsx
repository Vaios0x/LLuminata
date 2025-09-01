'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface BrailleCell {
  dots: boolean[];
  character: string;
  unicode: string;
}

interface BrailleDisplayProps {
  text: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showUnicode?: boolean;
  enableHaptic?: boolean;
  autoScroll?: boolean;
  scrollSpeed?: number;
  className?: string;
  onCharacterClick?: (character: string, braille: BrailleCell) => void;
  onTextChange?: (text: string) => void;
  accessibility?: {
    ariaLabel?: string;
    ariaDescription?: string;
    enableKeyboardNavigation?: boolean;
  };
}

const BrailleDisplay: React.FC<BrailleDisplayProps> = ({
  text,
  title = 'Display Braille',
  size = 'md',
  showText = true,
  showUnicode = false,
  enableHaptic = true,
  autoScroll = false,
  scrollSpeed = 1000,
  className,
  onCharacterClick,
  onTextChange,
  accessibility = {}
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [customText, setCustomText] = useState(text);

  // Tabla de conversión Braille (español)
  const brailleTable = useMemo(() => {
    const table: Record<string, BrailleCell> = {
      'a': { dots: [true, false, false, false, false, false], character: 'a', unicode: '⠁' },
      'b': { dots: [true, true, false, false, false, false], character: 'b', unicode: '⠃' },
      'c': { dots: [true, false, false, true, false, false], character: 'c', unicode: '⠉' },
      'd': { dots: [true, false, false, true, true, false], character: 'd', unicode: '⠙' },
      'e': { dots: [true, false, false, false, true, false], character: 'e', unicode: '⠑' },
      'f': { dots: [true, true, false, true, false, false], character: 'f', unicode: '⠋' },
      'g': { dots: [true, true, false, true, true, false], character: 'g', unicode: '⠛' },
      'h': { dots: [true, true, false, false, true, false], character: 'h', unicode: '⠓' },
      'i': { dots: [false, true, false, true, false, false], character: 'i', unicode: '⠊' },
      'j': { dots: [false, true, false, true, true, false], character: 'j', unicode: '⠚' },
      'k': { dots: [true, false, true, false, false, false], character: 'k', unicode: '⠅' },
      'l': { dots: [true, true, true, false, false, false], character: 'l', unicode: '⠇' },
      'm': { dots: [true, false, true, true, false, false], character: 'm', unicode: '⠍' },
      'n': { dots: [true, false, true, true, true, false], character: 'n', unicode: '⠝' },
      'o': { dots: [true, false, true, false, true, false], character: 'o', unicode: '⠕' },
      'p': { dots: [true, true, true, true, false, false], character: 'p', unicode: '⠏' },
      'q': { dots: [true, true, true, true, true, false], character: 'q', unicode: '⠟' },
      'r': { dots: [true, true, true, false, true, false], character: 'r', unicode: '⠗' },
      's': { dots: [false, true, true, true, false, false], character: 's', unicode: '⠎' },
      't': { dots: [false, true, true, true, true, false], character: 't', unicode: '⠞' },
      'u': { dots: [true, false, true, false, false, true], character: 'u', unicode: '⠥' },
      'v': { dots: [true, true, true, false, false, true], character: 'v', unicode: '⠧' },
      'w': { dots: [false, true, false, true, true, true], character: 'w', unicode: '⠺' },
      'x': { dots: [true, false, true, true, false, true], character: 'x', unicode: '⠭' },
      'y': { dots: [true, false, true, true, true, true], character: 'y', unicode: '⠽' },
      'z': { dots: [true, false, true, false, true, true], character: 'z', unicode: '⠵' },
      'á': { dots: [true, false, false, false, false, true], character: 'á', unicode: '⠷' },
      'é': { dots: [true, true, false, false, false, true], character: 'é', unicode: '⠮' },
      'í': { dots: [false, true, false, false, true, false], character: 'í', unicode: '⠌' },
      'ó': { dots: [false, true, true, false, true, false], character: 'ó', unicode: '⠬' },
      'ú': { dots: [false, true, true, false, false, true], character: 'ú', unicode: '⠾' },
      'ñ': { dots: [true, true, false, false, true, true], character: 'ñ', unicode: '⠻' },
      'ü': { dots: [true, true, true, false, true, true], character: 'ü', unicode: '⠳' },
      ' ': { dots: [false, false, false, false, false, false], character: ' ', unicode: '⠀' },
      '.': { dots: [false, true, false, false, true, true], character: '.', unicode: '⠲' },
      ',': { dots: [false, true, false, false, false, false], character: ',', unicode: '⠂' },
      ';': { dots: [false, true, true, false, false, false], character: ';', unicode: '⠆' },
      ':': { dots: [false, true, false, false, true, false], character: ':', unicode: '⠒' },
      '!': { dots: [false, true, true, false, true, true], character: '!', unicode: '⠖' },
      '?': { dots: [false, true, true, false, false, true], character: '?', unicode: '⠦' },
      '-': { dots: [false, false, true, false, false, true], character: '-', unicode: '⠤' },
      '(': { dots: [false, true, true, false, true, true], character: '(', unicode: '⠐⠣' },
      ')': { dots: [false, true, true, false, true, true], character: ')', unicode: '⠐⠜' },
      '0': { dots: [false, true, false, true, true, false], character: '0', unicode: '⠚' },
      '1': { dots: [true, false, false, false, false, false], character: '1', unicode: '⠁' },
      '2': { dots: [true, true, false, false, false, false], character: '2', unicode: '⠃' },
      '3': { dots: [true, false, false, true, false, false], character: '3', unicode: '⠉' },
      '4': { dots: [true, false, false, true, true, false], character: '4', unicode: '⠙' },
      '5': { dots: [true, false, false, false, true, false], character: '5', unicode: '⠑' },
      '6': { dots: [true, true, false, true, false, false], character: '6', unicode: '⠋' },
      '7': { dots: [true, true, false, true, true, false], character: '7', unicode: '⠛' },
      '8': { dots: [true, true, false, false, true, false], character: '8', unicode: '⠓' },
      '9': { dots: [false, true, false, true, false, false], character: '9', unicode: '⠊' }
    };
    return table;
  }, []);

  // Convertir texto a braille
  const convertToBraille = useCallback((inputText: string): BrailleCell[] => {
    return inputText.toLowerCase().split('').map(char => {
      return brailleTable[char] || brailleTable[' '];
    });
  }, [brailleTable]);

  // Obtener caracteres braille para mostrar
  const brailleCharacters = useMemo(() => {
    const allBraille = convertToBraille(customText);
    
    if (autoScroll && isScrolling) {
      // Mostrar solo una ventana de caracteres
      const windowSize = size === 'sm' ? 10 : size === 'lg' ? 20 : 15;
      const start = currentIndex % allBraille.length;
      return allBraille.slice(start, start + windowSize);
    }
    
    return allBraille;
  }, [customText, convertToBraille, autoScroll, isScrolling, currentIndex, size]);

  // Retroalimentación háptica
  const triggerHaptic = useCallback(() => {
    if (!enableHaptic) return;

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [enableHaptic]);

  // Manejar clic en celda braille
  const handleCellClick = useCallback((index: number, brailleCell: BrailleCell) => {
    setSelectedCell(index);
    triggerHaptic();
    onCharacterClick?.(brailleCell.character, brailleCell);
  }, [triggerHaptic, onCharacterClick]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.enableKeyboardNavigation) return;

    const totalCells = brailleCharacters.length;
    let newIndex = selectedCell ?? -1;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(newIndex + 1, totalCells - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(newIndex - 1, 0);
        break;
      case 'ArrowUp':
        newIndex = Math.max(newIndex - 5, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(newIndex + 5, totalCells - 1);
        break;
      case 'Enter':
      case ' ':
        if (newIndex >= 0) {
          handleCellClick(newIndex, brailleCharacters[newIndex]);
        }
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalCells - 1;
        break;
      default:
        return;
    }

    if (newIndex !== selectedCell) {
      event.preventDefault();
      setSelectedCell(newIndex);
    }
  }, [accessibility.enableKeyboardNavigation, selectedCell, brailleCharacters, handleCellClick]);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || !isScrolling) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
    }, scrollSpeed);

    return () => clearInterval(interval);
  }, [autoScroll, isScrolling, scrollSpeed]);

  // Controlar auto-scroll
  const toggleAutoScroll = useCallback(() => {
    setIsScrolling(!isScrolling);
  }, [isScrolling]);

  // Actualizar texto personalizado
  const handleTextChange = useCallback((newText: string) => {
    setCustomText(newText);
    onTextChange?.(newText);
  }, [onTextChange]);

  // Renderizar celda braille
  const renderBrailleCell = useCallback((brailleCell: BrailleCell, index: number) => {
    const isSelected = selectedCell === index;
    const cellSize = size === 'sm' ? 'w-8 h-12' : size === 'lg' ? 'w-12 h-16' : 'w-10 h-14';
    const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5';

    return (
      <div
        key={index}
        className={cn(
          'relative border border-gray-300 dark:border-gray-600 rounded p-1 cursor-pointer transition-all duration-200',
          cellSize,
          isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'hover:border-gray-400 dark:hover:border-gray-500'
        )}
        onClick={() => handleCellClick(index, brailleCell)}
        tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
        role="button"
        aria-label={`Carácter braille ${brailleCell.character}`}
      >
        {/* Puntos braille */}
        <div className="grid grid-cols-2 grid-rows-3 gap-1 h-full">
          {brailleCell.dots.map((dot, dotIndex) => (
            <div
              key={dotIndex}
              className={cn(
                'rounded-full transition-all duration-200',
                dotSize,
                dot 
                  ? 'bg-gray-900 dark:bg-gray-100' 
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>

        {/* Carácter original */}
        {showText && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
            {brailleCell.character}
          </div>
        )}

        {/* Unicode */}
        {showUnicode && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-500">
            {brailleCell.unicode}
          </div>
        )}
      </div>
    );
  }, [selectedCell, size, showText, showUnicode, handleCellClick, accessibility.enableKeyboardNavigation]);

  return (
    <div 
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
      role="region"
      aria-label={accessibility.ariaLabel || title}
      aria-describedby={accessibility.ariaDescription ? 'braille-description' : undefined}
      tabIndex={accessibility.enableKeyboardNavigation ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {accessibility.ariaDescription && (
        <div id="braille-description" className="sr-only">
          {accessibility.ariaDescription}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoScroll}
            className={cn(
              'px-3 py-1 text-sm rounded transition-colors duration-200',
              isScrolling 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
            aria-label={isScrolling ? 'Detener auto-scroll' : 'Iniciar auto-scroll'}
          >
            {isScrolling ? '⏸️ Pausar' : '▶️ Auto-scroll'}
          </button>
          
          {isScrolling && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Velocidad: {scrollSpeed}ms
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {brailleCharacters.length} caracteres
        </div>
      </div>

      {/* Input de texto */}
      <div className="mb-4">
        <label htmlFor="braille-text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Texto a convertir:
        </label>
        <textarea
          id="braille-text-input"
          value={customText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
          rows={3}
          placeholder="Escribe texto para convertir a braille..."
          aria-label="Texto para convertir a braille"
        />
      </div>

      {/* Display braille */}
      <div className="mb-4">
        <div className="flex items-center justify-center flex-wrap gap-2 min-h-20">
          {brailleCharacters.map((brailleCell, index) => 
            renderBrailleCell(brailleCell, index)
          )}
        </div>
      </div>

      {/* Información del carácter seleccionado */}
      {selectedCell !== null && brailleCharacters[selectedCell] && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Carácter Seleccionado
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Carácter:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brailleCharacters[selectedCell].character}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Unicode:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brailleCharacters[selectedCell].unicode}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Posición:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {selectedCell + 1} de {brailleCharacters.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Puntos:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brailleCharacters[selectedCell].dots.map((dot, i) => dot ? i + 1 : null).filter(Boolean).join(', ') || 'ninguno'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {brailleCharacters.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Caracteres</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {brailleCharacters.filter(c => c.character !== ' ').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Letras</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {brailleCharacters.filter(c => c.character === ' ').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Espacios</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {brailleCharacters.filter(c => /[0-9]/.test(c.character)).length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Números</div>
        </div>
      </div>

      {/* Instrucciones de accesibilidad */}
      {accessibility.enableKeyboardNavigation && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Controles de teclado:</p>
          <p>Flechas: Navegar entre caracteres</p>
          <p>Enter/Espacio: Seleccionar carácter</p>
          <p>Home/End: Ir al inicio/final</p>
        </div>
      )}
    </div>
  );
};

export default BrailleDisplay;
