interface RealtimeSession {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
}

interface VoiceCommand {
  type: 'dictate' | 'navigate' | 'generate' | 'transcribe';
  content: string;
  metadata?: any;
}

export class RealtimeService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada');
    }
  }

  // Crear sesión para obtener token efímero
  async createSession(model: string = 'gpt-4o-realtime-preview-2025-06-03'): Promise<RealtimeSession> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          voice: 'alloy', // Puedes cambiar a 'echo', 'fable', 'onyx', 'nova', 'shimmer'
          tools: [
            {
              type: 'function',
              function: {
                name: 'dictate_content',
                description: 'Dictar contenido para un post del blog',
                parameters: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      description: 'El contenido dictado'
                    },
                    type: {
                      type: 'string',
                      enum: ['title', 'body', 'summary'],
                      description: 'Tipo de contenido'
                    }
                  },
                  required: ['content', 'type']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'navigate_blog',
                description: 'Navegar por el blog con comandos de voz',
                parameters: {
                  type: 'object',
                  properties: {
                    action: {
                      type: 'string',
                      enum: ['home', 'new_post', 'edit_post', 'view_posts', 'search'],
                      description: 'Acción a realizar'
                    },
                    query: {
                      type: 'string',
                      description: 'Consulta adicional (para búsqueda)'
                    }
                  },
                  required: ['action']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'generate_content',
                description: 'Generar contenido usando IA',
                parameters: {
                  type: 'object',
                  properties: {
                    topic: {
                      type: 'string',
                      description: 'Tema del contenido'
                    },
                    style: {
                      type: 'string',
                      enum: ['informative', 'casual', 'professional', 'storytelling'],
                      description: 'Estilo de escritura'
                    },
                    length: {
                      type: 'string',
                      enum: ['short', 'medium', 'long'],
                      description: 'Longitud del contenido'
                    }
                  },
                  required: ['topic']
                }
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Error creando sesión: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando sesión Realtime:', error);
      throw new Error('Error al crear sesión de voz');
    }
  }

  // Inicializar conexión WebRTC
  async initializeWebRTCConnection(ephemeralKey: string, model: string = 'gpt-4o-realtime-preview-2025-06-03') {
    try {
      // Crear conexión peer
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      // Configurar audio para reproducción
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioEl.controls = false;
      document.body.appendChild(audioEl);

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // Obtener acceso al micrófono
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Agregar pista de audio local
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
      });

      // Configurar canal de datos para eventos
      const dataChannel = pc.createDataChannel('oai-events');
      
      // Crear oferta SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Conectar al servidor Realtime
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        }
      });

      if (!sdpResponse.ok) {
        throw new Error(`Error conectando al servidor Realtime: ${sdpResponse.status}`);
      }

      // Configurar respuesta SDP
      const answer = {
        type: 'answer',
        sdp: await sdpResponse.text()
      };
      await pc.setRemoteDescription(answer);

      return {
        peerConnection: pc,
        dataChannel,
        audioElement: audioEl,
        mediaStream
      };
    } catch (error) {
      console.error('Error inicializando WebRTC:', error);
      throw new Error('Error al inicializar conexión de voz');
    }
  }

  // Enviar comando de voz
  sendVoiceCommand(dataChannel: RTCDataChannel, command: VoiceCommand) {
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'text',
            text: command.content
          }
        ]
      }));
    }
  }

  // Manejar eventos del canal de datos
  setupDataChannelHandlers(dataChannel: RTCDataChannel, callbacks: {
    onMessage?: (message: any) => void;
    onToolCall?: (toolCall: any) => void;
    onError?: (error: any) => void;
  }) {
    dataChannel.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' && data.role === 'assistant') {
          callbacks.onMessage?.(data);
        } else if (data.type === 'tool_call') {
          callbacks.onToolCall?.(data);
        } else if (data.type === 'error') {
          callbacks.onError?.(data);
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    });

    dataChannel.addEventListener('error', (error) => {
      callbacks.onError?.(error);
    });
  }

  // Cerrar conexión
  closeConnection(peerConnection: RTCPeerConnection, mediaStream: MediaStream) {
    // Detener todas las pistas de media
    mediaStream.getTracks().forEach(track => track.stop());
    
    // Cerrar conexión peer
    peerConnection.close();
  }
}

export const realtimeService = new RealtimeService();
