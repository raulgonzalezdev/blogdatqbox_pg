"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import ErrorDialog from "./ErrorDialog";

interface PostActionsProps {
  postId: number;
  slug: string;
  authorId: number;
}

export default function PostActions({ postId, slug, authorId }: PostActionsProps) {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; onConfirm: () => void }>({ isOpen: false, onConfirm: () => {} });
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
      }
    } catch (error) {
      console.log('No user logged in');
    }
  };

  const handleEdit = () => {
    router.push(`/admin/edit/${postId}`);
  };

  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`/api/v1/posts/${slug}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            router.push('/');
          } else {
            setErrorDialog({ 
              isOpen: true, 
              message: 'Error al eliminar el post. Por favor, intenta de nuevo.' 
            });
          }
        } catch (error) {
          setErrorDialog({ 
            isOpen: true, 
            message: 'Error de conexión al eliminar el post.' 
          });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  // Si no hay usuario logueado o no es el autor del post, no mostrar nada
  if (!user || user.id !== authorId.toString()) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="btn p-2"
          aria-label="Acciones del post"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <>
            {/* Overlay para cerrar el menú */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menú de acciones */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar post
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar post'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Diálogo de error */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title="Error"
        message={errorDialog.message}
        type="error"
      />

      {/* Diálogo de confirmación */}
      <ErrorDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: () => {} })}
        onConfirm={confirmDialog.onConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
        type="warning"
        showConfirmButton={true}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
