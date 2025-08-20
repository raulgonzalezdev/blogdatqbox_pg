"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Code, CheckCircle, XCircle } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import EditorJSComponent from '@/components/EditorJS';
import AIGenerator from '@/components/AIGenerator';
import VoiceButton from '@/components/VoiceButton';
import { useDialogContext } from '@/components/DialogProvider';

type EditorType = 'tiptap' | 'editorjs';

interface PostData {
  title: string;
  slug: string;
  content: string | any;
  editorType: EditorType;
}

export default function CompareEditorsPage() {
  const [selectedEditor, setSelectedEditor] = useState<EditorType>('editorjs');
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
         editorType: 'editorjs'
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  
  const router = useRouter();
  const { confirm, alert } = useDialogContext();
  
  const tiptapEditorRef = useRef<any>(null);
  const editorJSRef = useRef<any>(null);

  // Verificar autenticación al cargar
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/v1/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleContentChange = (content: string | any) => {
    setPostData(prev => ({ ...prev, content }));
  };

  const handleEditorChange = (editorType: EditorType) => {
    setSelectedEditor(editorType);
    setPostData(prev => ({ ...prev, editorType }));
  };

  const handleSave = async () => {
    if (!postData.title.trim() || !postData.slug.trim()) {
      alert({
        title: 'Error',
        message: 'El título y el slug son requeridos',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Obtener el token de autenticación
      const tokenResponse = await fetch('/api/v1/auth/session');
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('No autenticado');
      }

      // Convertir contenido según el editor
      let htmlContent = '';
      if (selectedEditor === 'tiptap') {
        htmlContent = postData.content as string;
      } else {
        // Convertir Editor.js JSON a HTML
        if (editorJSRef.current) {
          htmlContent = await editorJSRef.current.getHTML();
        }
      }

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`
        },
        body: JSON.stringify({
          title: postData.title,
          slug: postData.slug,
          content: htmlContent,
          categoryId: 1 // Categoría por defecto
        })
      });

      if (response.ok) {
        alert({
          title: 'Éxito',
          message: 'Post guardado correctamente',
          type: 'success'
        });
        router.push('/admin/posts');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el post');
      }
    } catch (error: any) {
      alert({
        title: 'Error',
        message: error.message || 'Error al guardar el post',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = (generatedData: { title: string; slug: string; content: string }) => {
    setPostData(prev => ({
      ...prev,
      title: generatedData.title,
      slug: generatedData.slug,
      content: selectedEditor === 'tiptap' ? generatedData.content : prev.content
    }));
  };

  const handleVoiceDictate = (content: string, type: 'title' | 'body' | 'summary') => {
    if (type === 'title') {
      setPostData(prev => ({ ...prev, title: content }));
    } else if (type === 'body' && selectedEditor === 'tiptap') {
      setPostData(prev => ({ ...prev, content }));
    }
  };

  const handleVoiceNavigate = (action: string, query?: string) => {
    switch (action) {
      case 'home':
        router.push('/');
        break;
      case 'new_post':
        router.push('/admin');
        break;
      case 'view_posts':
        router.push('/admin/posts');
        break;
    }
  };

  const handleVoiceGenerate = (topic: string, style: string, length: string) => {
    // Implementar generación por voz
  };

  if (!user) {
    return <div className="py-10 text-center">Cargando...</div>;
  }

  return (
    <main className="py-10 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="btn flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-3xl font-semibold">Comparar Editores</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Logueado como: <span className="font-medium">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Selector de Editor */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-medium">Elige tu editor preferido:</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TipTap Editor */}
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedEditor === 'tiptap' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleEditorChange('tiptap')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">TipTap Editor</h3>
              {selectedEditor === 'tiptap' && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Editor tradicional WYSIWYG</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Barra de herramientas completa</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Edición de imágenes integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Salida HTML directa</span>
              </div>
            </div>
          </div>

          {/* Editor.js */}
          <div 
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedEditor === 'editorjs' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleEditorChange('editorjs')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Editor.js (Estilo Notion)</h3>
              {selectedEditor === 'editorjs' && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Editor de bloques estilo Notion</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Bloques independientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Salida JSON limpia</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Atajos de teclado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel izquierdo - Formulario */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Información del Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={postData.title}
                  onChange={handleTitleChange}
                  placeholder="Título del post"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={postData.slug}
                  onChange={handleSlugChange}
                  placeholder="url-del-post"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* AI Generator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Generador IA</h3>
            <AIGenerator
              onGenerate={handleAIGenerate}
              onImprove={(content) => {
                if (selectedEditor === 'tiptap') {
                  setPostData(prev => ({ ...prev, content }));
                }
              }}
              onGenerateTitle={(title) => setPostData(prev => ({ ...prev, title }))}
            />
          </div>

          {/* Controles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Controles</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full btn flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar Post'}
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full btn flex items-center justify-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
              </button>

              <button
                onClick={() => setShowJSON(!showJSON)}
                className="w-full btn flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
              >
                <Code className="w-4 h-4" />
                {showJSON ? 'Ocultar JSON' : 'Ver JSON'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel derecho - Editor */}
        <div className="lg:col-span-2">
          {selectedEditor === 'tiptap' ? (
            <RichTextEditor
              content={postData.content as string}
              onChange={handleContentChange}
              placeholder="Escribe tu contenido aquí..."
              onEditorReady={(editor) => {
                tiptapEditorRef.current = editor;
              }}
            />
          ) : (
            <EditorJSComponent
              content={postData.content}
              onChange={handleContentChange}
              placeholder="Escribe tu contenido aquí..."
              onEditorReady={(editor) => {
                editorJSRef.current = editor;
              }}
            />
          )}

          {/* Vista previa */}
          {showPreview && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Vista Previa</h3>
              <div 
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: typeof postData.content === 'string' 
                    ? postData.content 
                    : '' 
                }}
              />
            </div>
          )}

          {/* JSON Output */}
          {showJSON && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Salida JSON</h3>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(postData.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Voice Button */}
      <VoiceButton
        onDictateContent={handleVoiceDictate}
        onNavigate={handleVoiceNavigate}
        onGenerateContent={handleVoiceGenerate}
      />
    </main>
  );
}
