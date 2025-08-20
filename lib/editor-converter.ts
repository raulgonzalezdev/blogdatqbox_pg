// Utilidades para convertir entre HTML y Editor.js blocks

export function htmlToEditorJSBlocks(html: string) {
  if (!html) return { blocks: [] };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: any[] = [];

  // Función para procesar nodos
  function processNode(node: Node): any[] {
    const blocks: any[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          type: 'paragraph',
          data: { text }
        });
      }
      return blocks;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const level = parseInt(tagName.charAt(1));
          blocks.push({
            type: 'header',
            data: {
              text: element.textContent || '',
              level
            }
          });
          break;

        case 'p':
          if (element.textContent?.trim()) {
            blocks.push({
              type: 'paragraph',
              data: { text: element.textContent }
            });
          }
          break;

        case 'ul':
        case 'ol':
          const items = Array.from(element.children).map(li => li.textContent || '');
          blocks.push({
            type: 'list',
            data: {
              items,
              style: tagName === 'ol' ? 'ordered' : 'unordered'
            }
          });
          break;

        case 'blockquote':
          const quoteText = element.querySelector('p')?.textContent || element.textContent || '';
          const cite = element.querySelector('cite')?.textContent || '';
          blocks.push({
            type: 'quote',
            data: {
              text: quoteText,
              caption: cite
            }
          });
          break;

        case 'pre':
          const codeElement = element.querySelector('code');
          if (codeElement) {
            const language = codeElement.className.replace('language-', '') || 'javascript';
            blocks.push({
              type: 'code',
              data: {
                code: codeElement.textContent || '',
                language
              }
            });
          }
          break;

        case 'img':
          blocks.push({
            type: 'image',
            data: {
              url: element.getAttribute('src') || '',
              caption: element.getAttribute('alt') || ''
            }
          });
          break;

        case 'hr':
          blocks.push({
            type: 'delimiter',
            data: {}
          });
          break;

        default:
          // Para otros elementos, procesar sus hijos
          for (const child of Array.from(element.childNodes)) {
            blocks.push(...processNode(child));
          }
          break;
      }
    }

    return blocks;
  }

  // Procesar todos los nodos del documento
  for (const node of Array.from(doc.body.childNodes)) {
    blocks.push(...processNode(node));
  }

  return { blocks };
}

export function editorJSBlocksToHTML(data: any): string {
  if (!data.blocks) return '';

  return data.blocks.map((block: any) => {
    switch (block.type) {
      case 'header':
        const level = block.data.level || 2;
        return `<h${level}>${block.data.text}</h${level}>`;
      
      case 'paragraph':
        return `<p>${block.data.text}</p>`;
      
      case 'list':
        const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
        const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
        return `<${listType}>${items}</${listType}>`;
      
      case 'checklist':
        const checklistItems = block.data.items.map((item: any) => 
          `<li><input type="checkbox" ${item.checked ? 'checked' : ''} disabled> ${item.text}</li>`
        ).join('');
        return `<ul class="checklist">${checklistItems}</ul>`;
      
      case 'quote':
        return `<blockquote><p>${block.data.text}</p><cite>${block.data.caption}</cite></blockquote>`;
      
      case 'warning':
        return `<div class="warning"><h4>${block.data.title}</h4><p>${block.data.message}</p></div>`;
      
      case 'code':
        return `<pre><code class="language-${block.data.language || 'javascript'}">${block.data.code}</code></pre>`;
      
      case 'delimiter':
        return '<hr>';
      
      case 'image':
        return `<img src="${block.data.url}" alt="${block.data.caption || ''}" class="rounded-lg shadow-md my-6 max-w-full h-auto">`;
      
      case 'table':
        const tableContent = block.data.content.map((row: string[]) => 
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
        return `<table class="table-auto w-full border-collapse border border-gray-300"><tbody>${tableContent}</tbody></table>`;
      
      default:
        return `<p>${block.data.text || ''}</p>`;
    }
  }).join('');
}
