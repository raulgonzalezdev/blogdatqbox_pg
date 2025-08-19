interface GeneratePostOptions {
  topic?: string;
  title?: string;
  style?: 'informative' | 'casual' | 'professional' | 'storytelling';
  length?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
  language?: 'es' | 'en';
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
      throw new Error('OPENAI_API_KEY no está configurada');
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
${includeImages ? '- Incluye sugerencias de imágenes con etiquetas HTML img' : ''}

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
      const response = await this.makeRequest('/responses', {
        model: 'gpt-4o',
        input: prompt,
        temperature: 0.7,
        max_output_tokens: lengthTokens[length] * 2,
        text: {
          format: {
            type: 'json'
          }
        }
      });

      const content = response.output[0]?.content[0]?.text;
      if (!content) {
        throw new Error('No se pudo generar contenido');
      }

      // Parsear el JSON de la respuesta
      const parsed = JSON.parse(content);
      
      return {
        title: parsed.title,
        content: parsed.content,
        slug: parsed.slug,
        summary: parsed.summary,
        tags: parsed.tags || []
      };
    } catch (error) {
      console.error('Error generando post:', error);
      throw new Error('Error al generar el contenido con IA');
    }
  }

  async improveContent(content: string, instructions: string): Promise<string> {
    const prompt = `
Eres un editor experto. Mejora el siguiente contenido de blog según estas instrucciones:

Instrucciones: ${instructions}

Contenido actual:
${content}

Mejora el contenido manteniendo el formato HTML y responde solo con el contenido mejorado.
`;

    try {
      const response = await this.makeRequest('/responses', {
        model: 'gpt-4o',
        input: prompt,
        temperature: 0.3,
        max_output_tokens: 4000
      });

      return response.output[0]?.content[0]?.text || content;
    } catch (error) {
      console.error('Error mejorando contenido:', error);
      throw new Error('Error al mejorar el contenido');
    }
  }

  async generateTitle(topic: string, content?: string): Promise<string> {
    const prompt = content 
      ? `Genera un título atractivo y SEO-friendly para este contenido sobre ${topic}:\n\n${content.substring(0, 500)}...`
      : `Genera 5 títulos atractivos y SEO-friendly para un blog sobre ${topic}. Responde solo con los títulos, uno por línea.`;

    try {
      const response = await this.makeRequest('/responses', {
        model: 'gpt-4o',
        input: prompt,
        temperature: 0.8,
        max_output_tokens: 200
      });

      const titles = response.output[0]?.content[0]?.text || '';
      return content ? titles.trim() : titles.split('\n')[0]?.trim() || 'Nuevo Post';
    } catch (error) {
      console.error('Error generando título:', error);
      return 'Nuevo Post';
    }
  }

  async generateSlug(title: string): Promise<string> {
    const prompt = `Convierte este título en un slug URL-friendly (solo letras minúsculas, números y guiones): "${title}"`;

    try {
      const response = await this.makeRequest('/responses', {
        model: 'gpt-4o',
        input: prompt,
        temperature: 0.1,
        max_output_tokens: 100
      });

      const slug = response.output[0]?.content[0]?.text || '';
      return slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    } catch (error) {
      console.error('Error generando slug:', error);
      return title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
  }
}

export const openaiService = new OpenAIService();
