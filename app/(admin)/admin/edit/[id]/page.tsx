"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Eye, ArrowLeft, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import FileUpload from "@/components/FileUpload";

export default function EditPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [post, setPost] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  useEffect(() => {
    checkAuthStatus();
    if (postId) {
      loadPost();
    }
  }, [postId]);

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

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}`);
      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
        setTitle(postData.title);
        setSlug(postData.slug);
        setContent(postData.content);
      } else {
        setError("Post no encontrado");
      }
    } catch (error) {
      setError("Error cargando el post");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const result = await response.json();
      
      if (file.type.startsWith('image/')) {
        const imageUrl = `${window.location.origin}${result.url}`;
        if (editor) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } else {
          alert(`Imagen subida: ${imageUrl}\nPuedes usar esta URL en el editor.`);
        }
      } else {
        alert(`Archivo subido: ${result.fileName}\nURL: ${window.location.origin}${result.url}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    if (!content.trim()) {
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
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, slug, content }),
      });

      if (response.ok) {
        router.push(`/post/${slug}`);
      } else {
        const body = await response.json();
        setError(body?.error || `Error actualizando post (${response.status})`);
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        setError("Error eliminando el post");
      }
    } catch (error) {
      setError("Error de conexión");
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

  if (!user) {
    return <div className="py-10 text-center">Cargando...</div>;
  }

  if (!post && !error) {
    return <div className="py-10 text-center">Cargando post...</div>;
  }

  return (
    <main className="py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="btn flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-3xl font-semibold">Editar Post</h1>
        </div>
        
        <div className="flex items-center gap-4">
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

      {error && !post && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {post && (
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
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            ) : (
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Escribe tu contenido aquí..."
                onEditorReady={setEditor}
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="btn flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
