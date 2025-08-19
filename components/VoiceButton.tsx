"use client";
import { useState } from 'react';
import { Mic, MicOff, Headphones } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';

interface VoiceButtonProps {
  onDictateContent?: (content: string, type: 'title' | 'body' | 'summary') => void;
  onNavigate?: (action: string, query?: string) => void;
  onGenerateContent?: (topic: string, style: string, length: string) => void;
}

export default function VoiceButton({ 
  onDictateContent, 
  onNavigate, 
  onGenerateContent 
}: VoiceButtonProps) {
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsAssistantVisible(!isAssistantVisible)}
        className={`fixed bottom-4 right-4 z-40 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isAssistantVisible
            ? 'bg-red-500 text-white hover:bg-red-600 scale-110'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
        }`}
        title="Asistente de voz"
      >
        {isAssistantVisible ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Headphones className="w-6 h-6" />
        )}
      </button>

      {/* Asistente de voz */}
      <VoiceAssistant
        isVisible={isAssistantVisible}
        onClose={() => setIsAssistantVisible(false)}
        onDictateContent={onDictateContent}
        onNavigate={onNavigate}
        onGenerateContent={onGenerateContent}
      />
    </>
  );
}
