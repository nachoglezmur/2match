# 🤝 2match

Aplicación web para conectar personas con intereses similares en eventos. Validación de startup siguiendo los principios de The Mom Test.

## 🚀 Características

- **Formulario de registro** con información de contacto (email/teléfono)
- **Captura de intereses** específicos de cada participante
- **Biografía personal** para conocer mejor a cada persona
- **Preferencias de conexión** para matching efectivo
- **Backend con Supabase** para almacenamiento de datos
- **Diseño moderno y responsive** con gradientes atractivos

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Cuenta de Supabase (gratuita)
- Cuenta de GitHub (para deployment)

## 🔧 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda tu **URL** y **anon key** del proyecto

### 2. Crear la tabla en Supabase

En el SQL Editor de Supabase, ejecuta este código:

```sql
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone')),
  interests TEXT NOT NULL,
  looking_for_similar BOOLEAN DEFAULT true,
  bio TEXT NOT NULL,
  characteristics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas (para el formulario)
CREATE POLICY "Allow public inserts" ON participants
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lecturas autenticadas (para administradores)
CREATE POLICY "Allow authenticated reads" ON participants
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

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

### 1. Preparar el repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Añadir todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - 2match app"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/2match-app.git
git branch -M main
git push -u origin main
```

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: selecciona "Deploy from a branch"
4. Branch: selecciona `gh-pages` y `/root`
5. Guarda los cambios

### 3. Desplegar

```bash
npm run deploy
```

Tu aplicación estará disponible en: `https://TU_USUARIO.github.io/2match-app/`

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
