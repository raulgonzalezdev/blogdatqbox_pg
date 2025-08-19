"use client";
import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  X,
  Loader2,
  MessageSquare,
  Keyboard,
  Headphones
} from 'lucide-react';
import { realtimeService } from '@/lib/realtime';

interface VoiceAssistantProps {
  onDictateContent?: (content: string, type: 'title' | 'body' | 'summary') => void;
  onNavigate?: (action: string, query?: string) => void;
  onGenerateContent?: (topic: string, style: string, length: string) => void;
  isVisible?: boolean;
  onClose?: () => void;
}

export default function VoiceAssistant({ 
  onDictateContent, 
  onNavigate, 
  onGenerateContent,
  isVisible = false,
  onClose 
}: VoiceAssistantProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const connectionRef = useRef<{
    peerConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    audioElement: HTMLAudioElement;
    mediaStream: MediaStream;
  } | null>(null);

  const sessionRef = useRef<string | null>(null);

  // Inicializar conexión de voz
  const initializeVoiceConnection = async () => {
    if (isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Crear sesión
      const sessionResponse = await fetch('/api/v1/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-realtime-preview-2025-06-03' })
      });

      if (!sessionResponse.ok) {
        throw new Error('Error creando sesión de voz');
      }

      const session = await sessionResponse.json();
      sessionRef.current = session.id;

      // Inicializar conexión WebRTC
      const connection = await realtimeService.initializeWebRTCConnection(
        session.client_secret.value
      );

      connectionRef.current = connection;

      // Configurar manejadores de eventos
      realtimeService.setupDataChannelHandlers(connection.dataChannel, {
        onMessage: (message) => {
          const content = message.content?.[0]?.text || '';
          setMessages(prev => [...prev, { role: 'assistant', content }]);
        },
        onToolCall: (toolCall) => {
          handleToolCall(toolCall);
        },
        onError: (error) => {
          setError('Error en la conexión de voz');
          console.error('Voice connection error:', error);
        }
      });

      // Configurar eventos de conexión
      connection.peerConnection.onconnectionstatechange = () => {
        if (connection.peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
          addMessage('assistant', '¡Hola! Soy tu asistente de voz. Puedo ayudarte a dictar contenido, navegar por el blog o generar contenido con IA. ¿En qué puedo ayudarte?');
        } else if (connection.peerConnection.connectionState === 'failed') {
          setError('Error de conexión');
          setIsConnecting(false);
        }
      };

    } catch (error: any) {
      setError(error.message || 'Error inicializando asistente de voz');
      setIsConnecting(false);
    }
  };

  // Manejar llamadas a herramientas
  const handleToolCall = (toolCall: any) => {
    const { name, arguments: args } = toolCall.function;
    
    try {
      const parsedArgs = JSON.parse(args);
      
      switch (name) {
        case 'dictate_content':
          onDictateContent?.(parsedArgs.content, parsedArgs.type);
          addMessage('assistant', `He dictado el ${parsedArgs.type}: "${parsedArgs.content}"`);
          break;
          
        case 'navigate_blog':
          onNavigate?.(parsedArgs.action, parsedArgs.query);
          addMessage('assistant', `Navegando a: ${parsedArgs.action}`);
          break;
          
        case 'generate_content':
          onGenerateContent?.(parsedArgs.topic, parsedArgs.style || 'informative', parsedArgs.length || 'medium');
          addMessage('assistant', `Generando contenido sobre: ${parsedArgs.topic}`);
          break;
      }
    } catch (error) {
      console.error('Error handling tool call:', error);
    }
  };

  // Agregar mensaje al historial
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  // Enviar comando de voz
  const sendVoiceCommand = (command: string) => {
    if (!connectionRef.current?.dataChannel) return;

    realtimeService.sendVoiceCommand(connectionRef.current.dataChannel, {
      type: 'dictate',
      content: command
    });

    addMessage('user', command);
  };

  // Alternar micrófono
  const toggleMicrophone = () => {
    if (!connectionRef.current?.mediaStream) return;

    const audioTrack = connectionRef.current.mediaStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsListening(audioTrack.enabled);
    }
  };

  // Alternar audio
  const toggleAudio = () => {
    if (!connectionRef.current?.audioElement) return;

    connectionRef.current.audioElement.muted = !connectionRef.current.audioElement.muted;
    setIsMuted(connectionRef.current.audioElement.muted);
  };

  // Cerrar conexión
  const closeConnection = () => {
    if (connectionRef.current) {
      realtimeService.closeConnection(
        connectionRef.current.peerConnection,
        connectionRef.current.mediaStream
      );
      connectionRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setMessages([]);
    setError(null);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Asistente de Voz
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Estado de conexión */}
          {!isConnected && !isConnecting && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Conecta tu micrófono para usar el asistente de voz
              </p>
              <button
                onClick={initializeVoiceConnection}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Mic className="w-4 h-4" />
                Conectar
              </button>
            </div>
          )}

          {isConnecting && (
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conectando...
              </p>
            </div>
          )}

          {/* Controles de voz */}
          {isConnected && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMicrophone}
                className={`p-3 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Mensajes */}
          {messages.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 ml-4'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-4'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}

          {/* Comandos rápidos */}
          {isConnected && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Comandos rápidos:
              </p>
              <div className="flex flex-wrap gap-1">
                {[
                  'Dictar título',
                  'Nuevo post',
                  'Generar contenido',
                  'Ir al inicio'
                ].map((command) => (
                  <button
                    key={command}
                    onClick={() => sendVoiceCommand(command)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
