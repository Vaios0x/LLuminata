import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Chatbot } from '@/components/ui/chatbot';

expect.extend(toHaveNoViolations);

// Mock fetch
global.fetch = jest.fn();

// Mock Web Speech API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'es-ES',
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: jest.fn(),
  onerror: jest.fn(),
};

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

// Mock Audio API
const mockAudio = {
  src: '',
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  currentTime: 0,
  duration: 0,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onended: jest.fn(),
  onerror: jest.fn(),
};

Object.defineProperty(window, 'Audio', {
  value: jest.fn(() => mockAudio),
  writable: true,
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: jest.fn().mockResolvedValue(undefined),
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

describe('Chatbot Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        message: 'Respuesta del asistente',
        conversationId: 'conv-123',
        timestamp: Date.now(),
        audioUrl: 'test-audio.mp3',
        suggestions: ['Sugerencia 1', 'Sugerencia 2'],
      }),
    });
  });

  describe('Rendering', () => {
    it('should render chatbot button initially', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('w-16', 'h-16', 'rounded-full');
    });

    it('should render with custom initial message', () => {
      render(<Chatbot initialMessage="Mensaje personalizado" />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      expect(screen.getByText('Mensaje personalizado')).toBeInTheDocument();
    });

    it('should render with custom language', () => {
      render(<Chatbot language="en" />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      expect(screen.getByText('Hello! I am your personal AI assistant. How can I help you today?')).toBeInTheDocument();
    });

    it('should render chatbot window when opened', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      expect(screen.getByText('LLuminata')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeInTheDocument();
    });

    it('should render settings panel when toggled', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const settingsButton = screen.getByRole('button', { name: /configuración/i });
      fireEvent.click(settingsButton);
      
      expect(screen.getByText('Síntesis de voz')).toBeInTheDocument();
      expect(screen.getByText('Modelo de IA')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should toggle chatbot window when button is clicked', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      
      // Open chatbot
      fireEvent.click(button);
      expect(screen.getByText('LLuminata')).toBeInTheDocument();
      
      // Close chatbot
      fireEvent.click(button);
      expect(screen.queryByText('LLuminata')).not.toBeInTheDocument();
    });

    it('should send message when Enter is pressed', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Hola mundo');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Hola mundo')).toBeInTheDocument();
      });
    });

    it('should send message when send button is clicked', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Mensaje de prueba');
      
      const sendButton = screen.getByRole('button', { name: /enviar mensaje/i });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
      });
    });

    it('should not send empty messages', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      // Should not have any user messages
      const messages = screen.queryAllByText(/^[^¡].*$/);
      expect(messages).toHaveLength(0);
    });

    it('should handle voice recognition toggle', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const voiceButton = screen.getByRole('button', { name: /iniciar grabación de voz/i });
      fireEvent.click(voiceButton);
      
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
      expect(voiceButton).toHaveClass('bg-red-100', 'border-red-300', 'text-red-600');
    });

    it('should handle suggestion clicks', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      // Send a message to trigger suggestions
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Necesito ayuda');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        const suggestion = screen.getByText('Sugerencia 1');
        fireEvent.click(suggestion);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Sugerencia 1')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should send message to API and display response', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Test message');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Test message',
            conversationId: '',
            model: 'claude-3',
            language: 'es',
            voiceEnabled: false,
          }),
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Respuesta del asistente')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Error test');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(/Lo siento, hubo un error al procesar tu mensaje/)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Network error test');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(/Lo siento, hubo un error al procesar tu mensaje/)).toBeInTheDocument();
      });
    });
  });

  describe('Voice Features', () => {
    it('should enable voice synthesis when toggled', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const settingsButton = screen.getByRole('button', { name: /configuración/i });
      fireEvent.click(settingsButton);
      
      const voiceToggle = screen.getByRole('button', { name: /síntesis de voz/i });
      fireEvent.click(voiceToggle);
      
      // Send a message to test voice synthesis
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, 'Voice test');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });

    it('should handle voice recognition results', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const voiceButton = screen.getByRole('button', { name: /iniciar grabación de voz/i });
      fireEvent.click(voiceButton);
      
      // Simulate voice recognition result
      const mockEvent = {
        results: [
          [
            {
              transcript: 'Texto reconocido por voz',
              confidence: 0.95,
            },
          ],
        ],
      };
      
      mockSpeechRecognition.onresult(mockEvent);
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Escribe tu mensaje...') as HTMLInputElement;
        expect(input.value).toBe('Texto reconocido por voz');
      });
    });

    it('should handle voice recognition errors', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const voiceButton = screen.getByRole('button', { name: /iniciar grabación de voz/i });
      fireEvent.click(voiceButton);
      
      // Simulate voice recognition error
      const mockError = {
        error: 'no-speech',
      };
      
      mockSpeechRecognition.onerror(mockError);
      
      await waitFor(() => {
        expect(voiceButton).not.toHaveClass('bg-red-100');
      });
    });
  });

  describe('Export and Share', () => {
    it('should export conversation to file', async () => {
      const mockCreateElement = jest.fn();
      const mockClick = jest.fn();
      const mockRevokeObjectURL = jest.fn();
      
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement.mockReturnValue({
          href: '',
          download: '',
          click: mockClick,
        }),
      });
      
      Object.defineProperty(URL, 'createObjectURL', {
        value: jest.fn(() => 'blob:test'),
      });
      
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: mockRevokeObjectURL,
      });
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const exportButton = screen.getByRole('button', { name: /exportar conversación/i });
      fireEvent.click(exportButton);
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test');
    });

    it('should share conversation when supported', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const shareButton = screen.getByRole('button', { name: /compartir conversación/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(navigator.share).toHaveBeenCalledWith({
          title: 'Conversación con LLuminata',
          text: expect.stringContaining('Usuario:'),
        });
      });
    });

    it('should fallback to clipboard when share is not supported', async () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });
      
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const shareButton = screen.getByRole('button', { name: /compartir conversación/i });
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith('Conversación copiada al portapapeles');
      });
      
      mockAlert.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Chatbot />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      await user.tab();
      expect(button).toHaveFocus();
      
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.tab();
      expect(input).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      expect(screen.getByRole('button', { name: /configuración/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exportar conversación/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /compartir conversación/i })).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      expect(screen.getByText('LLuminata')).toBeInTheDocument();
      expect(screen.getByText('Asistente inteligente')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(10000);
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, longMessage);
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(longMessage)).toBeInTheDocument();
      });
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = 'Mensaje con émojis 🚀 y símbolos @#$%';
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      await user.type(input, specialMessage);
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(specialMessage)).toBeInTheDocument();
      });
    });

    it('should handle rapid message sending', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      const sendButton = screen.getByRole('button', { name: /enviar mensaje/i });
      
      // Send multiple messages rapidly
      for (let i = 0; i < 5; i++) {
        await user.clear(input);
        await user.type(input, `Message ${i}`);
        fireEvent.click(sendButton);
      }
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(5);
      });
    });

    it('should handle browser without speech recognition', () => {
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: undefined,
        writable: true,
      });
      
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
      });
      
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const voiceButton = screen.getByRole('button', { name: /iniciar grabación de voz/i });
      fireEvent.click(voiceButton);
      
      expect(mockAlert).toHaveBeenCalledWith('El reconocimiento de voz no está disponible en tu navegador');
      
      mockAlert.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      
      render(<Chatbot />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle many messages efficiently', async () => {
      render(<Chatbot />);
      
      const button = screen.getByRole('button', { name: /abrir chatbot/i });
      fireEvent.click(button);
      
      const input = screen.getByPlaceholderText('Escribe tu mensaje...');
      
      const startTime = performance.now();
      
      // Send many messages
      for (let i = 0; i < 20; i++) {
        await user.clear(input);
        await user.type(input, `Message ${i}`);
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should handle 20 messages in less than 2s
    });
  });
});
