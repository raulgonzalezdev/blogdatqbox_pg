"use client";
import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import 'easymde/dist/easymde.min.css';

// Importar EasyMDE solo en el cliente
let EasyMDE: any = null;
if (typeof window !== 'undefined') {
  EasyMDE = require('easymde');
}

interface EasyMDEEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
}

const EasyMDEEditor: React.FC<EasyMDEEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Escribe tu contenido aquí...",
  onEditorReady 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para convertir HTML a Markdown
  const htmlToMarkdown = (html: string): string => {
    if (!html) return '';
    
    // Reemplazos básicos de HTML a Markdown
    let markdown = html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      
      // Párrafos
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      
      // Negrita e Italic
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      
      // Enlaces
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      
      // Imágenes
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      
      // Listas
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n') + '\n';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
      })
      
      // Blockquotes
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n';
      })
      
      // Código
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n\n')
      
      // Líneas horizontales
      .replace(/<hr[^>]*>/gi, '---\n\n')
      
      // Limpiar HTML restante
      .replace(/<[^>]*>/g, '')
      
      // Decodificar entidades HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      
      // Limpiar espacios extra
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return markdown;
  };

  // Inicializar el editor
  useEffect(() => {
    if (textareaRef.current && !editor) {
      console.log('🎯 Initializing EasyMDE editor');
      
      const easyMDE = new EasyMDE({
        element: textareaRef.current,
        placeholder: placeholder,
        autofocus: false,
        spellChecker: false,
        status: ["lines", "words", "cursor"],
        minHeight: "300px",
        maxHeight: "600px",
        lineWrapping: true,
        toolbar: [
          "bold", "italic", "strikethrough", "|",
          "heading", "heading-smaller", "heading-bigger", "|",
          "unordered-list", "ordered-list", "|",
          "link", "image", "|",
          "quote", "code", "|",
          "preview", "side-by-side", "fullscreen", "|",
          "guide"
        ],
        insertTexts: {
          image: ["![", "](https://)"],
          link: ["[", "](https://)"],
        },
        previewRender: (plainText: string) => {
          // Usar marked para renderizar Markdown a HTML de forma síncrona
          try {
            return marked.parse(plainText) as string;
          } catch (error) {
            console.error('Error parsing markdown:', error);
            return plainText;
          }
        },
        renderingConfig: {
          singleLineBreaks: false,
          codeSyntaxHighlighting: false,
        },
        shortcuts: {
          "toggleBold": "Ctrl-B",
          "toggleItalic": "Ctrl-I",
          "toggleHeadingSmaller": "Ctrl-H",
          "toggleHeadingBigger": "Shift-Ctrl-H",
          "toggleCodeBlock": "Ctrl-Alt-C",
          "drawLink": "Ctrl-K",
          "drawImage": "Ctrl-Alt-I",
          "toggleUnorderedList": "Ctrl-L",
          "toggleOrderedList": "Ctrl-Alt-L",
          "toggleBlockquote": "Ctrl-'",
          "togglePreview": "Ctrl-P",
          "toggleSideBySide": "F9",
          "toggleFullScreen": "F11",
        }
      });

      // Configurar el evento onChange
      easyMDE.codemirror.on("change", () => {
        const value = easyMDE.value();
        console.log('🔄 EasyMDE onChange triggered with content:', value);
        onChange(value);
      });

      setEditor(easyMDE);
      setIsInitialized(true);

      // Proporcionar la interfaz del editor al componente padre
      if (onEditorReady) {
        const editorInterface = {
          getHTML: async () => {
            // Convertir Markdown a HTML usando marked
            try {
              return marked.parse(easyMDE.value()) as string;
            } catch (error) {
              console.error('Error parsing markdown:', error);
              return easyMDE.value();
            }
          },
          save: async () => {
            return easyMDE.value();
          },
          destroy: () => {
            easyMDE.toTextArea();
            easyMDE.cleanup();
          }
        };
        onEditorReady(editorInterface);
      }
    }
  }, [onChange, onEditorReady, placeholder]);

  // Actualizar contenido cuando cambie la prop content
  useEffect(() => {
    if (editor && isInitialized && content) {
      console.log('🔄 Updating EasyMDE content from prop:', content);
      
      // Si el contenido es HTML, convertirlo a Markdown
      const markdownContent = content.includes('<') ? htmlToMarkdown(content) : content;
      
      // Solo actualizar si el contenido es diferente
      if (editor.value() !== markdownContent) {
        editor.value(markdownContent);
        console.log('✅ EasyMDE content updated to:', markdownContent);
      }
    }
  }, [content, editor, isInitialized]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
      <textarea
        ref={textareaRef}
        className="w-full"
        defaultValue=""
      />
    </div>
  );
};

export default EasyMDEEditor;
