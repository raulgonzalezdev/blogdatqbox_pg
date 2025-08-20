interface GeneratePostOptions {
  topic?: string;
  title?: string;
  style?: 'informative' | 'casual' | 'professional' | 'storytelling';
  length?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
  language?: 'es' | 'en';
}

// URLs de imágenes reales y gratuitas para diferentes categorías
const REAL_IMAGE_URLS = {
  technology: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop'
  ],
  health: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop'
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900240-9a9049b7c63e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop'
  ],
  business: [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4f6aeb0f7043?w=800&h=400&fit=crop'
  ],
  general: [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop'
  ]
};

// Función para obtener una imagen aleatoria según el tema
function getRandomImageForTopic(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('tecnología') || topicLower.includes('tech') || topicLower.includes('digital') || topicLower.includes('software')) {
    return REAL_IMAGE_URLS.technology[Math.floor(Math.random() * REAL_IMAGE_URLS.technology.length)];
  } else if (topicLower.includes('salud') || topicLower.includes('health') || topicLower.includes('medicina') || topicLower.includes('bienestar')) {
    return REAL_IMAGE_URLS.health[Math.floor(Math.random() * REAL_IMAGE_URLS.health.length)];
  } else if (topicLower.includes('estilo') || topicLower.includes('lifestyle') || topicLower.includes('vida') || topicLower.includes('personal')) {
    return REAL_IMAGE_URLS.lifestyle[Math.floor(Math.random() * REAL_IMAGE_URLS.lifestyle.length)];
  } else if (topicLower.includes('negocio') || topicLower.includes('business') || topicLower.includes('empresa') || topicLower.includes('emprendimiento')) {
    return REAL_IMAGE_URLS.business[Math.floor(Math.random() * REAL_IMAGE_URLS.business.length)];
  } else {
    return REAL_IMAGE_URLS.general[Math.floor(Math.random() * REAL_IMAGE_URLS.general.length)];
  }
}

interface GeneratePostResponse {
  title: string;
  content: string;
  slug: string;
  summary: string;
  tags: string[];
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY no está configurada - las funcionalidades de IA no estarán disponibles');
    }
  }

  private async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Error en la API de OpenAI: ${response.status}`);
    }

    return response.json();
  }

  async generatePost(options: GeneratePostOptions): Promise<GeneratePostResponse> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada. Por favor, configura la variable de entorno.');
    }

    const {
      topic = 'tecnología y innovación',
      title,
      style = 'informative',
      length = 'medium',
      includeImages = false,
      language = 'es'
    } = options;

    const lengthTokens = {
      short: 500,
      medium: 1000,
      long: 2000
    };

    const stylePrompts = {
      informative: 'Escribe de manera informativa y educativa, con datos y ejemplos claros.',
      casual: 'Escribe de manera conversacional y amigable, como si estuvieras hablando con un amigo.',
      professional: 'Escribe de manera profesional y formal, con un tono corporativo.',
      storytelling: 'Escribe como una historia, con narrativa envolvente y ejemplos personales.'
    };

    const prompt = `
Eres un experto escritor de blogs especializado en ${topic}. 
${stylePrompts[style]}

${title ? `Título sugerido: ${title}` : 'Genera un título atractivo y SEO-friendly'}

Requisitos:
- Longitud: ${lengthTokens[length]} palabras aproximadamente
- Idioma: ${language === 'es' ? 'Español' : 'English'}
- Formato: HTML con etiquetas apropiadas (h1, h2, h3, p, ul, li, strong, em)
- Incluye una introducción atractiva
- Desarrolla el contenido con subtítulos y estructura clara
- Concluye con un resumen o llamada a la acción
${includeImages ? '- Incluye 2-3 etiquetas HTML img con URLs de Unsplash relacionadas al tema. Usa URLs como: https://images.unsplash.com/photo-[ID]?w=800&h=400&fit=crop' : '- NO incluyas etiquetas de imagen (img) en el contenido'}

Responde en formato JSON con esta estructura:
{
  "title": "Título del post",
  "content": "Contenido HTML completo",
  "slug": "slug-url-amigable",
  "summary": "Resumen de 2-3 líneas",
  "tags": ["tag1", "tag2", "tag3"]
}
`;

    try {
      // Seleccionar modelo según si se incluyen imágenes o no
      const model = includeImages ? 'gpt-4o' : 'gpt-3.5-turbo';
      const modelReason = includeImages 
        ? 'gpt-4o (mejor para generar contenido con imágenes)' 
        : 'gpt-3.5-turbo (más económico para texto)';
      
      console.log(`🤖 Usando modelo: ${modelReason}`);
      
      const response = await this.makeRequest('/responses', {
        model: model,
        input: prompt,
        temperature: 0.7,
        max_output_tokens: lengthTokens[length] * 2,
        text: {
          format: {
            type: 'json_object'
          }
        }
      });

      const content = response.output[0]?.content[0]?.text;
      if (!content) {
        throw new Error('No se pudo generar contenido');
      }

      // Parsear el JSON de la respuesta
      const parsed = JSON.parse(content);
      
      // Procesar el contenido para asegurar que las imágenes sean reales
      let processedContent = parsed.content;
      if (includeImages) {
        processedContent = this.processImagesInContent(processedContent, topic);
      }
      
      return {
        title: parsed.title,
        content: processedContent,
        slug: parsed.slug,
        summary: parsed.summary,
        tags: parsed.tags || []
      };
    } catch (error) {
      console.error('Error generando post:', error);
      throw new Error('Error al generar el contenido con IA');
    }
  }

  async improveContent(content: string, instructions: string, includeImages: boolean = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada. Por favor, configura la variable de entorno.');
    }

    const prompt = `
Eres un editor experto. Mejora el siguiente contenido de blog según estas instrucciones:

Instrucciones: ${instructions}

Contenido actual:
${content}

Mejora el contenido manteniendo el formato HTML y responde solo con el contenido mejorado.
${includeImages ? 'Si hay imágenes en el contenido, asegúrate de que las URLs sean válidas y de alta calidad.' : ''}
`;

    try {
      // Seleccionar modelo según si se incluyen imágenes o no
      const model = includeImages ? 'gpt-4o' : 'gpt-3.5-turbo';
      const modelReason = includeImages 
        ? 'gpt-4o (mejor para mejorar contenido con imágenes)' 
        : 'gpt-3.5-turbo (más económico para texto)';
      
      console.log(`🤖 Usando modelo para mejorar contenido: ${modelReason}`);
      
      const response = await this.makeRequest('/responses', {
        model: model,
        input: prompt,
        temperature: 0.3,
        max_output_tokens: 4000,
        text: {
          format: {
            type: 'text'
          }
        }
      });

      return response.output[0]?.content[0]?.text || content;
    } catch (error) {
      console.error('Error mejorando contenido:', error);
      throw new Error('Error al mejorar el contenido');
    }
  }

  async generateTitle(topic: string, content?: string, includeImages: boolean = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada. Por favor, configura la variable de entorno.');
    }

    const prompt = content 
      ? `Genera un título atractivo y SEO-friendly para este contenido sobre ${topic}:\n\n${content.substring(0, 500)}...`
      : `Genera 5 títulos atractivos y SEO-friendly para un blog sobre ${topic}. Responde solo con los títulos, uno por línea.`;

    try {
      // Seleccionar modelo según si se incluyen imágenes o no
      const model = includeImages ? 'gpt-4o' : 'gpt-3.5-turbo';
      const modelReason = includeImages 
        ? 'gpt-4o (mejor para generar títulos con contexto visual)' 
        : 'gpt-3.5-turbo (más económico para títulos)';
      
      console.log(`🤖 Usando modelo para generar título: ${modelReason}`);
      
      const response = await this.makeRequest('/responses', {
        model: model,
        input: prompt,
        temperature: 0.8,
        max_output_tokens: 200,
        text: {
          format: {
            type: 'text'
          }
        }
      });

      const titles = response.output[0]?.content[0]?.text || '';
      return content ? titles.trim() : titles.split('\n')[0]?.trim() || 'Nuevo Post';
    } catch (error) {
      console.error('Error generando título:', error);
      return 'Nuevo Post';
    }
  }

  async generateSlug(title: string, includeImages: boolean = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada. Por favor, configura la variable de entorno.');
    }

    const prompt = `Convierte este título en un slug URL-friendly (solo letras minúsculas, números y guiones): "${title}"`;

    try {
      // Para slugs siempre usamos gpt-3.5-turbo ya que es una tarea simple
      const model = 'gpt-3.5-turbo';
      console.log(`🤖 Usando modelo para generar slug: ${model} (tarea simple, siempre económico)`);
      
      const response = await this.makeRequest('/responses', {
        model: model,
        input: prompt,
        temperature: 0.1,
        max_output_tokens: 100,
        text: {
          format: {
            type: 'text'
          }
        }
      });

      const slug = response.output[0]?.content[0]?.text || '';
      return slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    } catch (error) {
      console.error('Error generando slug:', error);
      return title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
  }

  // Método para procesar y reemplazar imágenes en el contenido
  private processImagesInContent(content: string, topic: string): string {
    // Reemplazar URLs de placeholder con URLs reales
    let processedContent = content.replace(
      /https:\/\/via\.placeholder\.com\/[^"'\s]+/g,
      getRandomImageForTopic(topic)
    );

    // Si no hay imágenes en el contenido, agregar una al principio
    if (!processedContent.includes('<img')) {
      const imageUrl = getRandomImageForTopic(topic);
      const imageTag = `<img src="${imageUrl}" alt="Imagen relacionada al tema" class="rounded-lg shadow-md my-6 max-w-full h-auto" />`;
      
      // Insertar después del primer h1 o al principio si no hay h1
      if (processedContent.includes('<h1>')) {
        processedContent = processedContent.replace(
          /(<h1>.*?<\/h1>)/s,
          `$1\n${imageTag}`
        );
      } else {
        processedContent = imageTag + '\n' + processedContent;
      }
    }

    return processedContent;
  }
}

export const openaiService = new OpenAIService();
