"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Eye, ArrowLeft, Code } from "lucide-react";
import EditorJSComponent from "@/components/EditorJS";
import { htmlToEditorJSBlocks, editorJSBlocksToHTML } from "@/lib/editor-converter";
import FileUpload from "@/components/FileUpload";
import AIGenerator from "@/components/AIGenerator";
import VoiceButton from "@/components/VoiceButton";
import ErrorDialog from "@/components/ErrorDialog";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState<any>({ blocks: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [editor, setEditor] = useState<any>(null);
  
  const setEditorWithLog = useCallback((editorInstance: any) => {
    console.log('🎯 Editor set in admin page:', editorInstance);
    console.log('🎯 Editor methods available:', editorInstance ? Object.getOwnPropertyNames(Object.getPrototypeOf(editorInstance)) : 'null');
    setEditor(editorInstance);
  }, []);
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const router = useRouter();

  useEffect(() => {
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

  const handleFileUpload = async (file: File) => {
    try {
      // Obtener el token de la sesión
      const sessionResponse = await fetch('/api/v1/auth/session');
      if (!sessionResponse.ok) {
        throw new Error('Sesión expirada');
      }
      
      const sessionData = await sessionResponse.json();
      const token = sessionData.token;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const result = await response.json();
      
      // Si es una imagen, insertarla automáticamente en el editor
      if (file.type.startsWith('image/')) {
        const imageUrl = `${window.location.origin}${result.url}`;
        if (editor) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
              } else {
        setErrorDialog({ 
          isOpen: true, 
          message: `Imagen subida: ${imageUrl}\nPuedes usar esta URL en el editor.` 
        });
      }
    } else {
      setErrorDialog({ 
        isOpen: true, 
        message: `Archivo subido: ${result.fileName}\nURL: ${window.location.origin}${result.url}` 
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    setErrorDialog({ 
      isOpen: true, 
      message: 'Error al subir el archivo. Por favor, intenta de nuevo.' 
    });
  }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const currentContent = editor ? editor.getHTML() : content;

    // Validaciones
    if (!title.trim()) {
      setError("El título es requerido");
      setLoading(false);
      return;
    }
    if (!slug.trim()) {
      setError("El slug es requerido");
      setLoading(false);
      return;
    }
    if (!currentContent || !currentContent.blocks || currentContent.blocks.length === 0) {
      setError("El contenido es requerido");
      setLoading(false);
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("El slug solo puede contener letras minúsculas, números y guiones");
      setLoading(false);
      return;
    }

    try {
      // Obtener el token de la sesión
      const sessionResponse = await fetch('/api/v1/auth/session');
      if (!sessionResponse.ok) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        setLoading(false);
        return;
      }
      
      const sessionData = await sessionResponse.json();
      const token = sessionData.token;

      // Obtener el contenido HTML del editor
      let htmlContent = '';
      console.log('🔍 handleSubmit - Editor state:', {
        hasEditor: !!editor,
        editorType: typeof editor,
        hasGetHTML: editor ? typeof editor.getHTML === 'function' : false,
        editorKeys: editor ? Object.keys(editor) : 'null',
        editorMethods: editor ? Object.getOwnPropertyNames(Object.getPrototypeOf(editor)) : 'null'
      });
      
      if (editor && typeof editor.getHTML === 'function') {
        try {
          console.log('🔍 About to call editor.getHTML()');
          htmlContent = await editor.getHTML();
          console.log('📄 HTML content for submission:', htmlContent);
          console.log('📄 HTML content length:', htmlContent.length);
        } catch (error) {
          console.error('❌ Error getting HTML from editor:', error);
          setError("Error obteniendo el contenido del editor");
          setLoading(false);
          return;
        }
      } else {
        console.error('❌ Editor not available for getHTML');
        console.error('❌ Editor details:', {
          editor: editor,
          hasEditor: !!editor,
          editorType: typeof editor,
          hasGetHTML: editor ? typeof editor.getHTML === 'function' : false
        });
        setError("Editor no disponible");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, slug, content: htmlContent }),
      });

      if (response.status === 201) {
        router.push(`/post/${slug}`);
      } else {
        const body = await response.json();
        setError(body?.error || `Error creando post (${response.status})`);
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/session', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAIGenerate = (data: { title: string; content: string; slug: string }) => {
    console.log('🤖 AI Generated data:', data);
    setTitle(data.title);
    setSlug(data.slug);
    // Convertir HTML a bloques de Editor.js
    const convertedContent = htmlToEditorJSBlocks(data.content);
    console.log('🔄 Converted HTML to Editor.js blocks:', convertedContent);
    setContent(convertedContent);
  };

  const handleAIImprove = (improvedContent: string) => {
    console.log('🤖 AI Improved content:', improvedContent);
    // Convertir HTML a bloques de Editor.js
    const convertedContent = htmlToEditorJSBlocks(improvedContent);
    console.log('🔄 Converted improved HTML to Editor.js blocks:', convertedContent);
    setContent(convertedContent);
  };

  const handleVoiceDictate = (content: string, type: 'title' | 'body' | 'summary') => {
    console.log('🎤 Voice dictated content:', { content, type });
    switch (type) {
      case 'title':
        setTitle(content);
        break;
      case 'body':
        const convertedContent = htmlToEditorJSBlocks(content);
        console.log('🔄 Converted voice content to Editor.js blocks:', convertedContent);
        setContent(convertedContent);
        break;
      case 'summary':
        // Podrías agregar un campo de resumen si lo necesitas
        break;
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
      case 'search':
        // Implementar búsqueda si es necesario
        break;
    }
  };

  const handleVoiceGenerate = (topic: string, style: string, length: string) => {
    // Usar el generador de IA existente
    handleAIGenerate({
      title: '',
      content: '',
      slug: ''
    });
  };

  if (!user) {
    return <div className="py-10 text-center">Cargando...</div>;
  }

  return (
    <main className="py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="btn flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-3xl font-semibold">Nuevo Post</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="btn flex items-center gap-2"
          >
            Gestionar Posts
          </Link>
          
          <Link
            href="/admin/compare-editors"
            className="btn flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            <Code className="w-4 h-4" />
            Comparar Editores
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Logueado como: <span className="font-medium">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm underline text-red-600 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
              placeholder="Título del post"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
              placeholder="mi-post"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo letras minúsculas, números y guiones
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Contenido</label>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="btn flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Editar' : 'Vista previa'}
            </button>
          </div>
          
          {previewMode ? (
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[300px] prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: editorJSBlocksToHTML(content) }} />
            </div>
                      ) : (
              <EditorJSComponent
                content={content}
                onChange={setContent}
                placeholder="Escribe tu contenido aquí..."
                onEditorReady={setEditorWithLog}
              />
            )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subir archivos</label>
          <FileUpload
            onFileUpload={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
            maxSize={5}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Publicando..." : "Publicar"}
          </button>
          
          <AIGenerator
            onGenerate={handleAIGenerate}
            onImprove={handleAIImprove}
            currentContent={content}
          />
          
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setSlug("");
              setContent({ blocks: [] });
              setError(null);
            }}
            className="btn"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Asistente de voz */}
      <VoiceButton
        onDictateContent={handleVoiceDictate}
        onNavigate={handleVoiceNavigate}
        onGenerateContent={handleVoiceGenerate}
      />

      {/* Diálogo de error */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title="Error"
        message={errorDialog.message}
        type="error"
      />
    </main>
  );
}
