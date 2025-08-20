"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Función para procesar el contenido HTML y reemplazar imágenes
  const processContent = (htmlContent: string) => {
    // Reemplazar etiquetas img con componentes Image de Next.js
    return htmlContent.replace(
      /<img([^>]+)>/gi,
      (match, attributes) => {
        const srcMatch = attributes.match(/src="([^"]*)"/);
        const altMatch = attributes.match(/alt="([^"]*)"/);
        
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : 'Imagen';
        
        // Si es una imagen local que no existe, usar placeholder
        const imageSrc = src.startsWith('http') ? src : `https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(alt)}`;
        
        return `<div class="my-6">
          <img src="${imageSrc}" alt="${alt}" class="rounded-lg shadow-md max-w-full h-auto" style="width: 100%; height: auto;" />
        </div>`;
      }
    );
  };

  // Aplicar estilos CSS a las etiquetas HTML
  const applyStyles = (htmlContent: string) => {
    let processed = htmlContent;
    
    // Aplicar clases CSS a las etiquetas
    processed = processed.replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-6 mt-8 text-gray-900 dark:text-white">');
    processed = processed.replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-4 mt-6 text-gray-800 dark:text-gray-100">');
    processed = processed.replace(/<h3>/g, '<h3 class="text-xl font-medium mb-3 mt-5 text-gray-700 dark:text-gray-200">');
    processed = processed.replace(/<p>/g, '<p class="mb-4 text-gray-700 dark:text-gray-300">');
    processed = processed.replace(/<ul>/g, '<ul class="mb-4 pl-6">');
    processed = processed.replace(/<li>/g, '<li class="mb-2 text-gray-700 dark:text-gray-300">');
    processed = processed.replace(/<strong>/g, '<strong class="font-semibold text-gray-900 dark:text-white">');
    processed = processed.replace(/<em>/g, '<em class="italic text-gray-600 dark:text-gray-400">');
    
    return processed;
  };

  const processedContent = isClient ? applyStyles(processContent(content)) : content;

  return (
    <article 
      className="prose mt-8 max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
