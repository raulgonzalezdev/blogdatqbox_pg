"use client";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react';
import ImageEditor from './ImageEditor';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [imageEditorOpen, setImageEditorOpen] = React.useState(false);
  const [editingImageUrl, setEditingImageUrl] = React.useState('');

  if (!editor) {
    return null;
  }

  const addImage = () => {
    setEditingImageUrl('');
    setImageEditorOpen(true);
  };

  const handleImageSave = (newUrl: string) => {
    editor.chain().focus().setImage({ src: newUrl }).run();
  };

  const setLink = () => {
    const url = window.prompt('URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Heading3 className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <List className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Quote className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <button
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>

    {/* Editor de imágenes */}
    <ImageEditor
      isOpen={imageEditorOpen}
      onClose={() => setImageEditorOpen(false)}
      currentUrl={editingImageUrl}
      onSave={handleImageSave}
    />
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Escribe tu contenido aquí...", onEditorReady }: RichTextEditorProps) {
  const [imageEditorOpen, setImageEditorOpen] = React.useState(false);
  const [editingImageUrl, setEditingImageUrl] = React.useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'cursor-pointer hover:opacity-80 transition-opacity',
          onclick: 'handleImageClick(event)',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 min-h-[300px] focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Notificar cuando el editor esté listo
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sincronizar contenido externo con el editor
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Función para manejar clic en imágenes
  const handleImageClick = React.useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const imgSrc = target.getAttribute('src');
      if (imgSrc) {
        setEditingImageUrl(imgSrc);
        setImageEditorOpen(true);
      }
    }
  }, []);

  // Agregar event listener para clics en imágenes
  React.useEffect(() => {
    if (editor) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG' && target.closest('.ProseMirror')) {
          const imgSrc = target.getAttribute('src');
          if (imgSrc) {
            setEditingImageUrl(imgSrc);
            setImageEditorOpen(true);
          }
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [editor]);

  // Función para guardar imagen editada
  const handleImageSave = React.useCallback((newUrl: string) => {
    if (editor) {
      // Buscar la imagen actual y reemplazarla
      const images = editor.view.dom.querySelectorAll('img');
      images.forEach((img) => {
        if (img.getAttribute('src') === editingImageUrl) {
          img.setAttribute('src', newUrl);
        }
      });
      
      // Actualizar el contenido del editor
      onChange(editor.getHTML());
    }
  }, [editor, editingImageUrl, onChange]);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
      />
      
      {/* Editor de imágenes */}
      <ImageEditor
        isOpen={imageEditorOpen}
        onClose={() => setImageEditorOpen(false)}
        currentUrl={editingImageUrl}
        onSave={handleImageSave}
      />
    </div>
  );
}
