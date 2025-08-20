"use client";
import { useState } from 'react';
import { X, Edit, Save, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useDialogContext } from './DialogProvider';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (newUrl: string) => void;
}

export default function ImageEditor({ isOpen, onClose, currentUrl, onSave }: ImageEditorProps) {
  const [url, setUrl] = useState(currentUrl);
  const [isLoading, setIsLoading] = useState(false);
  const { alert } = useDialogContext();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validar que la URL sea válida
      if (!url.trim()) {
        alert({
          title: 'Error',
          message: 'Por favor, ingresa una URL válida',
          type: 'error'
        });
        return;
      }

      // Verificar que la URL tenga un formato válido
      try {
        new URL(url);
      } catch {
        alert({
          title: 'Error',
          message: 'Por favor, ingresa una URL válida (debe incluir http:// o https://)',
          type: 'error'
        });
        return;
      }

      onSave(url);
      onClose();
    } catch (error) {
      console.error('Error guardando URL:', error);
      alert({
        title: 'Error',
        message: 'Error al guardar la URL',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestImage = () => {
    if (url.trim()) {
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Editar Imagen
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de la imagen
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Vista previa de la imagen */}
            {url && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vista previa
                </label>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                  <img
                    src={url}
                    alt="Vista previa"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="w-full h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm hidden"
                    style={{ display: 'none' }}
                  >
                    No se pudo cargar la imagen
                  </div>
                </div>
              </div>
            )}

            {/* Sugerencias de URLs */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URLs sugeridas
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop'
                ].map((suggestedUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setUrl(suggestedUrl)}
                    className="text-left p-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    {suggestedUrl.split('/').pop()?.split('?')[0] || 'Imagen sugerida'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleTestImage}
              disabled={!url.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              Probar
            </button>
            
            <div className="flex-1" />
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
