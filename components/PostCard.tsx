import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export function PostCard({ post }: { post: { id: number; title: string; slug: string; createdAt: string; content: string } }) {
  // Extraer la primera imagen del contenido HTML si existe
  const getFirstImage = (htmlContent: string) => {
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/);
    return imgMatch ? imgMatch[1] : null;
  };

  // Extraer texto plano del HTML para la descripción
  const getPlainText = (htmlContent: string) => {
    return htmlContent.replace(/<[^>]*>/g, '').trim();
  };

  // Generar categoría basada en el contenido o usar una por defecto
  const getCategory = (content: string) => {
    const text = content.toLowerCase();
    if (text.includes('telemedicina') || text.includes('salud')) return 'Telemedicina';
    if (text.includes('monitoreo') || text.includes('remoto')) return 'Monitoreo remoto';
    if (text.includes('tecnología') || text.includes('digital')) return 'Tecnología';
    return 'General';
  };

  const firstImage = getFirstImage(post.content);
  const plainText = getPlainText(post.content);
  const category = getCategory(post.content);
  const readingTime = Math.ceil(plainText.split(' ').length / 200); // ~200 palabras por minuto

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen del post */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            <div className="text-4xl text-gray-400 dark:text-gray-600">📝</div>
          </div>
        )}
        
        {/* Etiqueta de categoría */}
        <div className="absolute top-3 left-3">
          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
          <Link href={`/post/${post.slug}`} className="no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
          {plainText.length > 150 ? `${plainText.substring(0, 150)}...` : plainText}
        </p>

        {/* Footer con tiempo de lectura y enlace */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/post/${post.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Continuar leyendo
            <ArrowRight className="w-3 h-3" />
          </Link>
          
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="w-3 h-3" />
            <span>{readingTime} min de lectura</span>
          </div>
        </div>
      </div>
    </article>
  );
}
