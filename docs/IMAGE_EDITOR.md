# Editor de Imágenes - Funcionalidad de Edición de URLs

## Descripción

El editor de imágenes permite a los usuarios modificar las URLs de las imágenes generadas por la IA directamente desde el editor de texto enriquecido. Esto proporciona flexibilidad para personalizar las imágenes según las preferencias del usuario.

## Características

### 🎯 Funcionalidades Principales

- **Edición de URLs**: Modificar URLs de imágenes existentes
- **Vista previa**: Ver la imagen antes de guardar
- **Validación**: Verificar que las URLs sean válidas
- **Sugerencias**: URLs predefinidas de Unsplash para elegir
- **Prueba de imagen**: Abrir la imagen en una nueva pestaña
- **Interfaz moderna**: Diseño responsive y accesible

### 🔧 Cómo Usar

#### 1. Editar Imagen Existente
1. **Hacer clic** en cualquier imagen en el editor
2. **Modificar** la URL en el campo de texto
3. **Ver vista previa** de la imagen
4. **Probar** la imagen en nueva pestaña (opcional)
5. **Guardar** los cambios

#### 2. Agregar Nueva Imagen
1. **Hacer clic** en el botón de imagen en la barra de herramientas
2. **Ingresar** URL de la imagen
3. **Usar sugerencias** de Unsplash (opcional)
4. **Guardar** la imagen

#### 3. Usar URLs Sugeridas
- **Tecnología**: Imágenes relacionadas con tecnología
- **Salud**: Imágenes médicas y de bienestar
- **Estilo de Vida**: Imágenes de vida cotidiana
- **Negocios**: Imágenes corporativas

## Componentes

### ImageEditor.tsx
```typescript
interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (newUrl: string) => void;
}
```

### RichTextEditor.tsx
- **Integración** con el editor de texto enriquecido
- **Event listeners** para clics en imágenes
- **Sincronización** automática del contenido

## URLs Sugeridas

### Tecnología
- `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop`
- `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop`
- `https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=400&fit=crop`

### Salud
- `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop`
- `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop`
- `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop`

## Validaciones

### URL Válida
- **Formato**: Debe incluir `http://` o `https://`
- **Estructura**: Debe ser una URL válida
- **No vacía**: No puede estar vacía

### Vista Previa
- **Carga automática**: Se muestra automáticamente
- **Manejo de errores**: Mensaje si no se puede cargar
- **Responsive**: Se adapta al tamaño del contenedor

## Integración con IA

### Flujo de Trabajo
1. **IA genera** contenido con imágenes de Unsplash
2. **Usuario revisa** las imágenes generadas
3. **Usuario hace clic** en imagen para editar
4. **Usuario modifica** URL según preferencias
5. **Cambios se guardan** automáticamente

### Beneficios
- **Personalización**: Control total sobre las imágenes
- **Flexibilidad**: Cambiar imágenes sin regenerar contenido
- **Eficiencia**: Edición rápida y directa
- **Calidad**: Mantener estándares de imagen deseados

## Estilos CSS

### Imágenes Editables
```css
.cursor-pointer:hover:opacity-80 transition-opacity
```

### Vista Previa
```css
.w-full h-32 object-cover rounded
```

### Botones
```css
.px-4 py-2 text-sm font-medium rounded-lg transition-colors
```

## Eventos

### onClick
- **Imagen**: Abre editor de imágenes
- **Botón Probar**: Abre imagen en nueva pestaña
- **Botón Guardar**: Actualiza URL en editor

### onChange
- **Campo URL**: Actualiza vista previa
- **Editor**: Sincroniza contenido

## Manejo de Errores

### Validación de URL
- **Formato inválido**: Mensaje de error
- **URL vacía**: Mensaje de error
- **Error de carga**: Mensaje en vista previa

### Diálogos de Error
- **Sistema personalizado**: No usa alert() nativo
- **Diseño consistente**: Con el resto de la aplicación
- **Información clara**: Mensajes específicos

## Accesibilidad

### Navegación por Teclado
- **Tab**: Navegación entre elementos
- **Enter**: Activar botones
- **Escape**: Cerrar editor

### Lectores de Pantalla
- **Labels**: Etiquetas descriptivas
- **Alt text**: Texto alternativo para imágenes
- **ARIA**: Atributos de accesibilidad

## Responsive Design

### Móvil
- **Pantalla completa**: Editor ocupa toda la pantalla
- **Botones grandes**: Fácil interacción táctil
- **Texto legible**: Tamaños apropiados

### Desktop
- **Modal centrado**: Editor en ventana modal
- **Vista previa grande**: Mejor visualización
- **Controles optimizados**: Para mouse y teclado
