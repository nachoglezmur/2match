# 🤝 2match

Aplicación web inteligente para conectar personas en eventos mediante matching contextual. Sistema completo con 200+ tags organizados, buscador en tiempo real y algoritmos de matching avanzados.

## 🚀 Características Principales

### 🎯 Sistema de Matching Inteligente
- **3 modos de conexión**: Affinity (intereses similares), Specific (busco/ofrezco), Explore (serendipia)
- **Algoritmos contextuales** que adaptan el matching según el modo elegido
- **Scoring dinámico** basado en complementariedad y afinidad

### 🏷️ Sistema de Tags Avanzado
- **200+ tags organizados** en 6 categorías (Tecnología, Negocios, Marketing, Producto, Ventas, Otros)
- **Buscador en tiempo real** con filtrado mientras escribes
- **Filtros por categoría** para navegación rápida
- **Área scrollable** con altura máxima y scrollbar personalizado

### 💪 Campos Profesionales
- **Skills**: Qué se te da bien (60+ opciones en 5 categorías)
- **Nivel de compromiso**: Slider 1-10 con descripciones dinámicas
- **Disponibilidad**: 12 opciones (tiempo completo, tardes, remoto, etc.)
- **Proyecto actual**: Checkbox + descripción opcional
- **Separación busco/ofrezco**: Inputs completamente independientes

### 🎨 UX/UI Moderna
- **Diseño responsive** para móvil y desktop
- **Colores diferenciados** por tipo de tag
- **Animaciones suaves** y feedback visual
- **Contador de selección** en tiempo real

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Cuenta de Supabase (gratuita)
- Cuenta de GitHub (para deployment)

## 🔧 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda tu **URL** y **anon key** del proyecto

### 2. Ejecutar scripts SQL en Supabase

En el SQL Editor de Supabase, ejecuta estos archivos **en orden**:

#### **Paso 1: Estructura de Base de Datos**
```bash
# Ejecuta: supabase-clean-migration.sql
```
Crea todas las tablas, campos, índices y RLS básico.

#### **Paso 2: Funciones de Matching**
```bash
# Ejecuta: supabase-functions.sql
```
Crea las 6 funciones de matching contextual.

#### **Paso 3: Políticas de Seguridad**
```bash
# Ejecuta: supabase-fix-policies.sql
```
Configura las políticas RLS para permitir upsert.

Ver documentación completa en: `INSTRUCCIONES-SUPABASE.md`

### 3. Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita `.env` y añade tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

## 💻 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Deployment en GitHub Pages

### Configuración Automática con GitHub Actions

El proyecto incluye un workflow de GitHub Actions que despliega automáticamente a GitHub Pages en cada push a `main`.

### 1. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. **Source**: Selecciona "GitHub Actions"
4. Guarda los cambios

### 2. Push al repositorio

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 3. Verificar el deployment

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Cuando termine (✅), tu app estará en: `https://nachoglezmur.github.io/2match/`

### 4. Configurar variables de entorno en producción

⚠️ **IMPORTANTE**: Las variables de entorno (`.env`) no se suben a GitHub por seguridad.

Para que funcione en producción, las credenciales de Supabase están **hardcodeadas** en el código o debes usar GitHub Secrets:

**Opción A: Hardcodear (solo para demos)**
```javascript
// En src/supabaseClient.js
const supabaseUrl = 'https://xdrlsucphzxgazngsnqg.supabase.co'
const supabaseKey = 'tu_anon_key_aqui'
```

**Opción B: GitHub Secrets (recomendado)**
1. Settings → Secrets and variables → Actions
2. New repository secret:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Actualiza `.github/workflows/deploy.yml` para usar los secrets

## 📊 Ver los Datos Recopilados

Para ver los participantes registrados:

1. Ve a tu proyecto en Supabase
2. Abre el **Table Editor**
3. Selecciona la tabla `participants`
4. Verás todos los registros con sus datos

También puedes exportar los datos a CSV desde Supabase para análisis.

## 🎯 Principios de The Mom Test Aplicados

El formulario está diseñado siguiendo The Mom Test:

- **Preguntas específicas**: "¿Qué temas te interesan?" en lugar de "¿Te gusta networking?"
- **Comportamiento real**: Capturamos intereses concretos, no opiniones generales
- **Compromiso medible**: El usuario invierte tiempo completando el formulario
- **Datos accionables**: Información específica para hacer matching real

## 🔒 Seguridad

- Las credenciales de Supabase están en variables de entorno (no en el código)
- Row Level Security habilitado en Supabase
- Solo inserciones públicas permitidas (no lecturas públicas)
- Los datos son privados y solo accesibles por administradores

## 📱 Responsive Design

La aplicación funciona perfectamente en:
- 📱 Móviles
- 📱 Tablets
- 💻 Desktop

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework frontend
- **Vite** - Build tool y dev server
- **Supabase** - Backend as a Service (PostgreSQL)
- **GitHub Pages** - Hosting gratuito
- **CSS3** - Estilos modernos con gradientes

## 📝 Próximos Pasos

1. **Validar la idea**: Usa la app en tu próximo evento
2. **Recopilar feedback**: Observa cómo la gente usa el formulario
3. **Analizar datos**: Revisa qué intereses son más comunes
4. **Iterar**: Mejora el formulario basándote en datos reales

## 🤝 Contribuir

Este es un proyecto de validación. Si tienes sugerencias:

1. Abre un Issue
2. Propón mejoras basadas en datos reales
3. Comparte tus resultados de validación

## 📄 Licencia

MIT License - Úsalo libremente para validar tu startup

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de 2match.
