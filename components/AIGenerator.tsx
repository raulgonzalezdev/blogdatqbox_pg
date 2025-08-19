"use client";
import { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Type, 
  FileText, 
  Settings, 
  Loader2,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

interface AIGeneratorProps {
  onGenerate: (data: { title: string; content: string; slug: string }) => void;
  onImprove: (content: string) => void;
  currentContent?: string;
}

export default function AIGenerator({ onGenerate, onImprove, currentContent }: AIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState<'informative' | 'casual' | 'professional' | 'storytelling'>('informative');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [includeImages, setIncludeImages] = useState(false);
  const [improveInstructions, setImproveInstructions] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          title: title || undefined,
          style,
          length,
          includeImages
        })
      });

      if (!response.ok) {
        throw new Error('Error generando contenido');
      }

      const data = await response.json();
      onGenerate({
        title: data.title,
        content: data.content,
        slug: data.slug
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar contenido con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent || !improveInstructions.trim()) return;
    
    setIsImproving(true);
    try {
      const response = await fetch('/api/v1/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          instructions: improveInstructions
        })
      });

      if (!response.ok) {
        throw new Error('Error mejorando contenido');
      }

      const data = await response.json();
      onImprove(data.content);
      setImproveInstructions('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al mejorar el contenido');
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!topic.trim()) return;
    
    try {
      const response = await fetch('/api/v1/ai/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
      }
    } catch (error) {
      console.error('Error generando título:', error);
    }
  };

  return (
    <>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden md:inline">Generar con IA</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Generador de Contenido IA
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crea contenido profesional con inteligencia artificial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de generación */}
            <div className="space-y-6">
              {/* Tema */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tema del post *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Inteligencia artificial en el marketing digital"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white"
                />
              </div>

              {/* Título */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título (opcional)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTitle}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generar
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Deja vacío para generar automáticamente"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white"
                />
              </div>

              {/* Configuraciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estilo */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Estilo de escritura
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white"
                  >
                    <option value="informative">Informativo</option>
                    <option value="casual">Casual</option>
                    <option value="professional">Profesional</option>
                    <option value="storytelling">Narrativo</option>
                  </select>
                </div>

                {/* Longitud */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Longitud
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white"
                  >
                    <option value="short">Corto (~500 palabras)</option>
                    <option value="medium">Medio (~1000 palabras)</option>
                    <option value="long">Largo (~2000 palabras)</option>
                  </select>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="rounded"
                  />
                  Incluir sugerencias de imágenes
                </label>
              </div>

              {/* Botón de generación */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generar Post Completo
                  </>
                )}
              </button>
            </div>

            {/* Separador */}
            {currentContent && (
              <>
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
                
                {/* Mejorar contenido existente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Mejorar contenido existente
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Instrucciones de mejora
                    </label>
                    <textarea
                      value={improveInstructions}
                      onChange={(e) => setImproveInstructions(e.target.value)}
                      placeholder="Ej: Haz el contenido más profesional, agrega más ejemplos, mejora la estructura..."
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white h-20 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleImprove}
                    disabled={isImproving || !improveInstructions.trim()}
                    className="w-full btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 py-2"
                  >
                    {isImproving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mejorando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Mejorar Contenido
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
