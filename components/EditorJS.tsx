"use client";
import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import { editorJSBlocksToHTML } from '@/lib/editor-converter';
import { 
  Bold, 
  Italic, 
  List as ListIcon, 
  ListOrdered, 
  Quote as QuoteIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckSquare,
  Minus,
  Table as TableIcon,
  Youtube,
  Type,
  Upload
} from 'lucide-react';

interface EditorJSProps {
  content?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
}

export default function EditorJSComponent({ 
  content, 
  onChange, 
  placeholder = "Escribe tu contenido aquí...",
  onEditorReady 
}: EditorJSProps) {
  // console.log('📝 EditorJS Component received content:', content);
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    console.log('🔄 useEffect triggered - initializing editor');
    if (!holderRef.current || isInitializing) return;

    setIsInitializing(true);

    // Limpiar editor anterior si existe
    if (editorRef.current && typeof editorRef.current.destroy === 'function') {
      try {
        editorRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying previous editor:', error);
      }
      editorRef.current = null;
    }

    // console.log('🔧 Initializing editor with content:', content);
    
    // Configuración inicial del editor
    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly: false,
      placeholder: placeholder,
      
      tools: {
        header: {
          class: Header,
          inlineToolbar: ['marker', 'link'],
          config: {
            placeholder: 'Encabezado',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          },
          shortcut: 'CMD+SHIFT+H'
        },

        list: {
          class: List,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+L'
        },

        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },

        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Ingresa una cita',
            captionPlaceholder: 'Autor de la cita',
          },
          shortcut: 'CMD+SHIFT+O'
        },

        warning: Warning,

        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },

        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+C'
        },

        delimiter: Delimiter,

        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        },

        linkTool: LinkTool,

        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: '/api/v1/upload',
              byUrl: '/api/v1/upload'
            }
          }
        },

        embed: Embed,

        table: {
          class: Table,
          inlineToolbar: true,
          shortcut: 'CMD+ALT+T'
        },
      },

      data: content && content.blocks && content.blocks.length > 0 ? content : {
        blocks: []
      },

                     onReady: () => {
          console.log('✅ Editor.js ready - setting isReady to true');
          setIsReady(true);
          // Asegurar que el editor esté asignado antes de llamar onEditorReady
          editorRef.current = editor;
          console.log('✅ Editor assigned in onReady:', editorRef.current);
          if (onEditorReady) {
                         // Crear un objeto con los métodos necesarios
             const editorWithMethods = {
               ...editor,
               getHTML: async () => {
                 console.log('🔍 getHTML called from handleSubmit');
                 
                 // Usar una función que siempre busque el editor actual
                 const getCurrentEditor = () => {
                   // Primero intentar con editorRef.current
                   if (editorRef.current && typeof editorRef.current.save === 'function') {
                     return editorRef.current;
                   }
                   // Si no está disponible, intentar con el editor del closure
                   if (editor && typeof editor.save === 'function') {
                     return editor;
                   }
                   return null;
                 };
                 
                 const currentEditor = getCurrentEditor();
                 console.log('🔍 Current editor state:', {
                   hasEditor: !!currentEditor,
                   editorType: typeof currentEditor,
                   hasSaveMethod: currentEditor ? typeof currentEditor.save === 'function' : false
                 });
                 
                                   if (currentEditor) {
                    try {
                      const data = await currentEditor.save();
                      console.log('📄 Editor data to convert:', data);
                      
                      // Log específico para bloques de imagen
                      if (data.blocks) {
                        console.log('🔍 Total blocks found:', data.blocks.length);
                        data.blocks.forEach((block: any, index: number) => {
                          console.log(`🔍 Block ${index}:`, { type: block.type, data: block.data });
                          if (block.type === 'image') {
                            console.log(`🖼️ Image block ${index}:`, block);
                            console.log(`🖼️ Image URL:`, block.data?.url || block.data?.file?.url);
                          }
                        });
                      }
                      
                      const html = editorJSBlocksToHTML(data);
                      console.log('🔄 Converted to HTML:', html);
                      return html;
                    } catch (error) {
                      console.error('❌ Error getting HTML:', error);
                      return '';
                    }
                  }
                 console.log('❌ No editor available for getHTML');
                 return '';
               }
             };
            console.log('✅ Calling onEditorReady with editorWithMethods');
            onEditorReady(editorWithMethods);
          }
        },

      onChange: async (api, event) => {
        if (onChange) {
          try {
            const savedData = await editor.save();
            onChange(savedData);
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        }
      }
    });

    // Asignar el editor inmediatamente
    editorRef.current = editor;
    // console.log('✅ Editor assigned to ref immediately:', editorRef.current);

    setIsInitializing(false);

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying editor:', error);
        }
        editorRef.current = null;
      }
    };
     }, [placeholder]);

  // Efecto separado para actualizar el contenido cuando cambie el prop content
  useEffect(() => {
    // Solo ejecutar si hay contenido y el editor está listo
    if (!content || !isReady || !editorRef.current) {
      return;
    }

    // console.log('🔄 useEffect content changed:', { 
    //   content: content?.blocks?.length || 0, 
    //   isReady, 
    //   hasEditor: !!editorRef.current
    // });
    
    if (typeof editorRef.current.render === 'function') {
      // console.log('✅ Rendering content to editor:', content);
      try {
        editorRef.current.render(content);
        // console.log('✅ Content rendered successfully');
      } catch (error) {
        console.error('❌ Error rendering content:', error);
      }
    }
  }, [content, isReady]);

  // Función para obtener el contenido como HTML
  const getHTML = async () => {
    console.log('🔍 getHTML called');
    console.log('🔍 Editor ref state:', {
      hasEditor: !!editorRef.current,
      editorType: typeof editorRef.current,
      editorKeys: editorRef.current ? Object.keys(editorRef.current) : 'null',
      hasSaveMethod: editorRef.current ? typeof editorRef.current.save === 'function' : false
    });
    
    if (editorRef.current && typeof editorRef.current.save === 'function') {
      try {
        const data = await editorRef.current.save();
        console.log('📄 Editor data to convert:', data);
        const html = editorJSBlocksToHTML(data);
        console.log('🔄 Converted to HTML:', html);
        return html;
      } catch (error) {
        console.error('❌ Error getting HTML:', error);
        return '';
      }
    }
    console.log('❌ No editor available for getHTML');
    return '';
  };

  // Funciones para la barra de herramientas
  const addBlock = async (type: string, data?: any) => {
    if (editorRef.current && typeof editorRef.current.blocks === 'object') {
      try {
        await editorRef.current.blocks.insert(type, data);
      } catch (error) {
        console.error('Error adding block:', error);
      }
    }
  };

  const addImage = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url && editorRef.current) {
      addBlock('image', { url, caption: '' });
    }
  };

  const addLink = () => {
    const url = prompt('Ingresa la URL del enlace:');
    if (url && editorRef.current) {
      addBlock('linkTool', { link: url });
    }
  };

  const addEmbed = () => {
    const url = prompt('Ingresa la URL del video (YouTube, etc.):');
    if (url && editorRef.current) {
      addBlock('embed', { service: 'youtube', source: url });
    }
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editorRef.current) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/v1/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            const imageUrl = `${window.location.origin}${result.url}`;
            addBlock('image', { url: imageUrl, caption: '' });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen');
        }
      }
    };
    input.click();
  };

  // Eliminado useImperativeHandle - no lo necesitamos

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Barra de herramientas personalizada */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Encabezados */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addBlock('header', { text: '', level: 1 })}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="H1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => addBlock('header', { text: '', level: 2 })}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="H2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => addBlock('header', { text: '', level: 3 })}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="H3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Texto */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addBlock('paragraph')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Párrafo"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Listas */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addBlock('list')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => addBlock('checklist')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Citas y código */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addBlock('quote')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Cita"
            >
              <QuoteIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => addBlock('code')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Código"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Imágenes y enlaces */}
          <div className="flex items-center gap-1">
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Imagen por URL"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={uploadImage}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Subir imagen"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={addLink}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Enlace"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Tabla y embed */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addBlock('table')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Tabla"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addEmbed}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Video/Embed"
            >
              <Youtube className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Separador */}
          <button
            onClick={() => addBlock('delimiter')}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Separador"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={holderRef} 
        className="min-h-[400px] p-4 bg-white dark:bg-gray-900"
      />
      
      {(!isReady || isInitializing) && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {isInitializing ? 'Inicializando editor...' : 'Cargando editor...'}
        </div>
      )}
    </div>
  );
}
