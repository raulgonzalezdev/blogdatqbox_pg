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
      >
        <strong>B</strong>
      </button>
      
      <button
        onClick={() => chain.toggleItalic().focus().run()}
        className={`p-2 rounded ${active.italic() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        <em>I</em>
      </button>
      
      <button
        onClick={() => chain.toggleUnderline().focus().run()}
        className={`p-2 rounded ${active.underline() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        <u>U</u>
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleHeading({ level: 1 }).focus().run()}
        className={`p-2 rounded ${active.heading({ level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        H1
      </button>
      
      <button
        onClick={() => chain.toggleHeading({ level: 2 }).focus().run()}
        className={`p-2 rounded ${active.heading({ level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        H2
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleBulletList().focus().run()}
        className={`p-2 rounded ${active.bulletList() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        • Lista
      </button>
      
      <button
        onClick={() => chain.toggleOrderedList().focus().run()}
        className={`p-2 rounded ${active.orderedList() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        1. Lista
      </button>
      
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => chain.toggleBlockquote().focus().run()}
        className={`p-2 rounded ${active.blockquote() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        Quote
      </button>
      
      <button
        onClick={() => chain.toggleCodeBlock().focus().run()}
        className={`p-2 rounded ${active.codeBlock() ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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

// Componente que maneja los hooks dentro del contexto
const EditorContent = React.memo(({ onEditorReady }: { onEditorReady?: (editor: any) => void }) => {
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

  return (
    <>
      <Toolbar />
      <div className="p-4 min-h-[300px]">
        <EditorComponent />
      </div>
    </>
  );
});

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



  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="remirror-theme">
        <Remirror 
          manager={manager} 
          initialContent={state}
          onChange={({ state }) => {
            // Este onChange se ejecuta cuando el contenido cambia
            console.log('🔄 Remirror onChange triggered');
            // Llamar al onChange del componente padre con HTML
            const html = state.doc.textContent;
            onChange(html);
          }}
        >
          <EditorContent onEditorReady={onEditorReady} />
        </Remirror>
      </div>
    </div>
  );
};

export default RemirrorEditor; 