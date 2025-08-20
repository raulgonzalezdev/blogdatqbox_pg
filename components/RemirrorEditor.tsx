"use client";
import React from 'react';
import 'remirror/styles/all.css';
import { 
  BoldExtension, 
  ItalicExtension, 
  UnderlineExtension,
  ParagraphExtension,
  HeadingExtension,
  BulletListExtension,
  OrderedListExtension,
  ListItemExtension,
  ImageExtension,
  LinkExtension,
  BlockquoteExtension,
  CodeBlockExtension,
  CodeExtension
} from 'remirror/extensions';
import { 
  Remirror, 
  useRemirror, 
  useCommands, 
  useActive,
  useChainedCommands,
  useHelpers,
  EditorComponent 
} from '@remirror/react';

// Componente del menú de herramientas
const Toolbar = () => {
  const chain = useChainedCommands();
  const active = useActive();

  const handleImageUpload = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      chain.setImage({ src: url }).focus().run();
    }
  };

  const handleLinkAdd = () => {
    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
      chain.setLink({ href: url }).focus().run();
    }
  };

  return (
    <div className="border-b border-gray-300 dark:border-gray-700 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => chain.toggleBold().focus().run()}
        className={`p-2 rounded ${active.bold() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleBold().enabled()}
      >
        <strong>B</strong>
      </button>
      
      <button
        onClick={() => chain.toggleItalic().focus().run()}
        className={`p-2 rounded ${active.italic() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleItalic().enabled()}
      >
        <em>I</em>
      </button>
      
      <button
        onClick={() => chain.toggleUnderline().focus().run()}
        className={`p-2 rounded ${active.underline() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleUnderline().enabled()}
      >
        <u>U</u>
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleHeading({ level: 1 }).focus().run()}
        className={`p-2 rounded ${active.heading({ level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleHeading({ level: 1 }).enabled()}
      >
        H1
      </button>
      
      <button
        onClick={() => chain.toggleHeading({ level: 2 }).focus().run()}
        className={`p-2 rounded ${active.heading({ level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleHeading({ level: 2 }).enabled()}
      >
        H2
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleBulletList().focus().run()}
        className={`p-2 rounded ${active.bulletList() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleBulletList().enabled()}
      >
        • Lista
      </button>
      
      <button
        onClick={() => chain.toggleOrderedList().focus().run()}
        className={`p-2 rounded ${active.orderedList() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleOrderedList().enabled()}
      >
        1. Lista
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleBlockquote().focus().run()}
        className={`p-2 rounded ${active.blockquote() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleBlockquote().enabled()}
      >
        Quote
      </button>
      
      <button
        onClick={() => chain.toggleCodeBlock().focus().run()}
        className={`p-2 rounded ${active.codeBlock() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        disabled={!chain.toggleCodeBlock().enabled()}
      >
        Code
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={handleImageUpload}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Insertar imagen"
      >
        🖼️
      </button>
      
      <button
        onClick={handleLinkAdd}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Insertar enlace"
      >
        🔗
      </button>
    </div>
  );
};

// Componente interno que maneja los hooks
const RemirrorEditorInternal = ({ content, onChange, onEditorReady }: {
  content: string;
  onChange: (content: string) => void;
  onEditorReady?: (editor: any) => void;
}) => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new BoldExtension(),
      new ItalicExtension(), 
      new UnderlineExtension(),
      new ParagraphExtension(),
      new HeadingExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new ListItemExtension(),
      new ImageExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new CodeBlockExtension(),
      new CodeExtension()
    ],
    content: content || '<p></p>',
    stringHandler: 'html',
    selection: 'end',
  });

  const { getHTML } = useHelpers();

  React.useEffect(() => {
    if (onEditorReady) {
      const editorInterface = {
        getHTML: async () => {
          return getHTML();
        },
        save: async () => {
          return getHTML();
        },
        destroy: () => {
          // Cleanup si es necesario
        }
      };
      onEditorReady(editorInterface);
    }
  }, [onEditorReady, getHTML]);

  // Efecto para actualizar el contenido cuando cambia la prop content
  React.useEffect(() => {
    if (manager && content) {
      console.log('🔄 Updating Remirror content:', content);
      try {
        // Usar el manager para actualizar el contenido con HTML
        manager.store.update((state) => {
          // Crear un nuevo estado con el contenido HTML
          const newState = state.apply(state.tr.replaceWith(
            0,
            state.doc.content.size,
            manager.schema.node('doc', {}, manager.schema.text(content))
          ));
          return newState;
        });
      } catch (error) {
        console.error('❌ Error updating Remirror content:', error);
        // Fallback: intentar con contenido simple
        try {
          manager.store.update((state) => {
            const newState = state.apply(state.tr.replaceWith(
              0,
              state.doc.content.size,
              manager.schema.node('doc', {}, manager.schema.text(content))
            ));
            return newState;
          });
        } catch (fallbackError) {
          console.error('❌ Fallback error updating Remirror content:', fallbackError);
        }
      }
    }
  }, [content, manager]);

  // Hook para manejar cambios
  const handleChange = React.useCallback(({ state }: any) => {
    const html = getHTML();
    console.log('🔄 Remirror content changed:', html);
    onChange(html);
  }, [onChange, getHTML]);

  return (
    <Remirror 
      manager={manager} 
      initialContent={state}
      onChange={handleChange}
    >
      <Toolbar />
      <div className="p-4 min-h-[300px]">
        <EditorComponent />
      </div>
    </Remirror>
  );
};

interface RemirrorEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
}

const RemirrorEditor: React.FC<RemirrorEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Escribe tu contenido aquí...",
  onEditorReady 
}) => {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="remirror-theme">
        <RemirrorEditorInternal
          content={content}
          onChange={onChange}
          onEditorReady={onEditorReady}
        />
      </div>
    </div>
  );
};

export default RemirrorEditor; 