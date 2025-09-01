# Sistema de Localización - InclusiveAI Coach

## Descripción General

Este directorio contiene todos los archivos de localización para el proyecto InclusiveAI Coach, que soporta múltiples idiomas incluyendo idiomas indígenas de América Latina.

## Estructura de Directorios

```
locales/
├── config.json                 # Configuración central de idiomas
├── README.md                   # Esta documentación
├── es-MX/                      # Español (México)
│   └── common.json
├── maya/                       # Idioma Maya
│   └── common.json
├── nahuatl/                    # Idioma Náhuatl
│   └── common.json
├── kiche/                      # Idioma K'iche'
│   └── common.json
├── kaqchikel/                  # Idioma Kaqchikel
│   └── common.json
├── mam/                        # Idioma Mam
│   └── common.json
├── qeqchi/                     # Idioma Q'eqchi'
│   └── common.json
├── tzotzil/                    # Idioma Tzotzil
│   └── common.json
├── tseltal/                    # Idioma Tseltal
│   └── common.json
├── mixteco/                    # Idioma Mixteco
│   └── common.json
├── zapoteco/                   # Idioma Zapoteco
│   └── common.json
├── otomi/                      # Idioma Otomí (hñähñu)
│   └── common.json
├── totonaco/                   # Idioma Totonaco
│   └── common.json
├── mazateco/                   # Idioma Mazateco
│   └── common.json
├── chol/                       # Idioma Chol
│   └── common.json
├── mazahua/                    # Idioma Mazahua
│   └── common.json
├── huasteco/                   # Idioma Huasteco
│   └── common.json
├── chinanteco/                 # Idioma Chinanteco
│   └── common.json
├── purepecha/                  # Idioma Purépecha
│   └── common.json
├── mixe/                       # Idioma Mixe
│   └── common.json
├── tlapaneco/                  # Idioma Tlapaneco
│   └── common.json
├── tarahumara/                 # Idioma Tarahumara
│   └── common.json
├── en/                         # Inglés
│   └── common.json
├── pt/                         # Portugués
│   └── common.json
├── fr/                         # Francés
│   └── common.json
└── de/                         # Alemán
    └── common.json
```

## Idiomas Soportados

### Idiomas Primarios
- **es-MX**: Español (México) - 130M hablantes
- **pt**: Portugués - 260M hablantes

### Idiomas Indígenas
- **maya**: Maya (Yucateco) - 774,755 hablantes - Península de Yucatán
- **nahuatl**: Náhuatl - 1,651,958 hablantes - Puebla, Hidalgo, Veracruz, Guerrero, Estado de México
- **tseltal**: Tseltal - 589,144 hablantes - Chiapas (Altos y Selva)
- **tzotzil**: Tsotsil - 550,234 hablantes - Chiapas (región Altos)
- **mixteco**: Mixteco - 529,593 hablantes - Región Mixteca (Oaxaca, Guerrero, Puebla)
- **zapoteco**: Zapoteco - 490,845 hablantes - Oaxaca, Veracruz, Guerrero
- **totonaco**: Totonaco - 267,635 hablantes - Veracruz, Puebla, Hidalgo
- **mazateco**: Mazateco - 237,212 hablantes - Oaxaca, Puebla, Veracruz
- **chol**: Chol - 223,050 hablantes - Chiapas, Tabasco
- **mazahua**: Mazahua - 147,088 hablantes - Estado de México, Michoacán
- **huasteco**: Huasteco - 173,765 hablantes - San Luis Potosí, Veracruz, Hidalgo, Tamaulipas
- **chinanteco**: Chinanteco - 141,706 hablantes - Oaxaca, Veracruz
- **purepecha**: Purépecha - 141,177 hablantes - Michoacán
- **mixe**: Mixe - 139,760 hablantes - Oaxaca
- **tlapaneco**: Tlapaneco - 119,497 hablantes - Guerrero
- **tarahumara**: Tarahumara - 85,018 hablantes - Chihuahua
- **otomi**: Otomí (hñähñu) - 298,861 hablantes - Hidalgo, México, Querétaro, Veracruz
- **kiche**: K'iche' - 1.1M hablantes - Guatemala
- **kaqchikel**: Kaqchikel - 450K hablantes - Guatemala
- **mam**: Mam - 520K hablantes - Guatemala
- **qeqchi**: Q'eqchi' - 420K hablantes - Guatemala, Belice

### Idiomas Secundarios
- **en**: Inglés - 1.5B hablantes
- **fr**: Francés - 300M hablantes
- **de**: Alemán - 95M hablantes

## Estructura de Archivos JSON

### config.json
Archivo de configuración central que contiene:
- Metadatos de cada idioma
- Características soportadas
- Configuración de accesibilidad
- Contexto cultural
- Idioma por defecto y de respaldo

### common.json
Archivo de traducciones que incluye:
- Navegación de la aplicación
- Acciones comunes
- Estados del sistema
- Términos educativos
- Características de accesibilidad
- Contexto cultural
- Matemáticas y ciencias
- Tecnología y medios

## Características por Idioma

### Características Soportadas
- **translation**: Traducción automática
- **speechRecognition**: Reconocimiento de voz
- **textToSpeech**: Síntesis de voz
- **culturalAdaptation**: Adaptación cultural

### Accesibilidad
- **screenReader**: Soporte para lectores de pantalla
- **voiceSynthesis**: Síntesis de voz
- **subtitles**: Subtítulos
- **signLanguage**: Lengua de señas

## Uso en la Aplicación

### Importación de Traducciones
```typescript
import common from '@/locales/es-MX/common.json';
import config from '@/locales/config.json';
```

### Selección de Idioma
```typescript
const userLanguage = 'es-MX';
const translations = await import(`@/locales/${userLanguage}/common.json`);
```

### Fallback Automático
Si un idioma no está disponible, el sistema usa:
1. Idioma por defecto (es-MX)
2. Idioma de respaldo (en)

## Agregar Nuevos Idiomas

### 1. Crear Directorio
```bash
mkdir locales/nuevo-idioma
```

### 2. Crear Archivo common.json
```json
{
  "common": {
    "app": {
      "name": "InclusiveAI Coach",
      "tagline": "Traducción del tagline",
      "version": "1.0.0"
    }
    // ... resto de traducciones
  }
}
```

### 3. Actualizar config.json
```json
{
  "languages": {
    "nuevo-idioma": {
      "name": "Nombre del Idioma",
      "nativeName": "Nombre Nativo",
      "code": "nuevo-idioma",
      "region": "Región",
      "type": "indigenous|primary|secondary",
      "status": "active|beta|planned",
      "speakers": 1000000,
      "features": {
        "translation": true,
        "speechRecognition": false,
        "textToSpeech": false,
        "culturalAdaptation": true
      },
      "accessibility": {
        "screenReader": true,
        "voiceSynthesis": false,
        "subtitles": true,
        "signLanguage": false
      },
      "culturalContext": {
        "writingSystem": "Latin",
        "readingDirection": "ltr",
        "numberSystem": "Arabic",
        "culturalReferences": ["Referencia 1", "Referencia 2"]
      }
    }
  }
}
```

## Consideraciones Especiales

### Idiomas Indígenas
- Algunos idiomas indígenas tienen soporte limitado para reconocimiento de voz y síntesis
- Se prioriza la preservación cultural y la accesibilidad básica
- Las traducciones incluyen términos específicos de cada cultura

### Accesibilidad
- Todos los idiomas incluyen términos de accesibilidad
- Se mantiene consistencia en la estructura de archivos
- Se consideran diferentes sistemas de escritura y direcciones de lectura

### Contexto Cultural
- Cada idioma incluye referencias culturales específicas
- Se adaptan los ejemplos y contextos a cada cultura
- Se respetan las tradiciones y costumbres locales

## Mantenimiento

### Actualización de Traducciones
1. Editar el archivo `common.json` correspondiente
2. Verificar consistencia con otros idiomas
3. Probar la aplicación con el nuevo idioma
4. Actualizar la documentación si es necesario

### Validación
- Verificar que todas las claves estén presentes en todos los idiomas
- Asegurar que las traducciones sean apropiadas culturalmente
- Probar la funcionalidad de accesibilidad

## Recursos Adicionales

### Documentación de Referencia
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Indigenous Languages of the Americas](https://en.wikipedia.org/wiki/Indigenous_languages_of_the_Americas)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Herramientas Recomendadas
- [i18next](https://www.i18next.com/) - Framework de internacionalización
- [Lingui](https://lingui.js.org/) - Alternativa moderna
- [Crowdin](https://crowdin.com/) - Plataforma de traducción colaborativa

## Contacto

Para preguntas sobre localización o para contribuir con nuevas traducciones, contactar al equipo de desarrollo de InclusiveAI Coach.
