# 🚀 Quick Start - 2match App

## ⚡ Inicio Rápido (5 minutos)

### 1. Configurar Supabase

```bash
# 1. Ve a https://supabase.com y crea un proyecto
# 2. Copia tu Project URL y anon key
# 3. Ve al SQL Editor y ejecuta:
```

Ejecuta el archivo `supabase-matching-schema.sql` completo en el SQL Editor de Supabase.

### 2. Configurar Variables de Entorno

Crea `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Instalar y Ejecutar

```bash
npm install
npm run dev
```

¡Listo! Abre http://localhost:5173

## 📱 Flujo de la App

1. **Pantalla de Bienvenida** → Click en "Comenzar"
2. **Selección de Modo**:
   - 🤝 Conocer gente afín (por intereses)
   - 🎯 Busco perfiles específicos (busco/ofrezco)
   - 🧭 Explorar y descubrir (serendipia)
3. **Completar Perfil** (1 minuto):
   - Nombre, email, bio
   - Según modo: intereses, busco/ofrezco, o tags amplios
4. **Ver Matches** (swipe tipo Tinder):
   - ✕ Pasar
   - ⭐ Me interesa
   - 🤝 Conectar
5. **Ver Perfil Completo** → Explicación del match

## 🎯 Ejemplos de Uso

### Modo Affinity (Gente Afín)

**Perfil de ejemplo:**
```
Nombre: Ana García
Bio: Desarrolladora full-stack apasionada por IA
Intereses: [IA, Startups, React, Machine Learning]
Personalidad: [Técnico, Creativo, Emprendedor]
Conversación: 8/10 (profundas)
```

**Matcheará bien con:**
- Personas con intereses en IA/tech
- Personalidades similares
- Que prefieran conversaciones profundas

### Modo Specific (Perfiles Específicos)

**Perfil de ejemplo:**
```
Nombre: Carlos Ruiz
Bio: Fundador de startup fintech en fase seed
Busco: [Inversor seed, CTO técnico, Mentor en producto]
Ofrezco: [Prototipo validado, Tracción inicial, Equipo comprometido]
```

**Matcheará bien con:**
- Inversores que busquen startups fintech
- CTOs que busquen proyectos
- Mentores que ofrezcan expertise en producto

### Modo Explore (Explorar)

**Perfil de ejemplo:**
```
Nombre: Laura Martín
Bio: Diseñadora UX curiosa por nuevas oportunidades
Tags: [Diseño, Tecnología]
```

**Matcheará con:**
- Perfiles diversos (serendipia)
- Conexiones inesperadas
- Máxima variedad

## 🔧 Personalización Rápida

### Cambiar el Evento

Edita `src/AppMatching.jsx`:

```javascript
const EVENT_ID = 'tu-nuevo-evento-id'
```

Luego inserta el evento en Supabase:

```sql
INSERT INTO events (id, name, description, location, event_date)
VALUES (
  'tu-nuevo-evento-id',
  'Nombre del Evento',
  'Descripción',
  'Ubicación',
  NOW() + INTERVAL '7 days'
);
```

### Ajustar Colores

Edita `src/AppMatching.css`:

```css
:root {
  --primary: #3b82f6;  /* Color principal */
  --success: #10b981;  /* Color de éxito */
  /* ... más colores */
}
```

### Cambiar Umbral de Score

Edita las funciones SQL en Supabase:

```sql
-- En get_best_matches, línea del WHERE
WHERE cm.score > 20  -- Cambiar a 30, 40, etc.
```

## 📊 Verificar que Funciona

### 1. Crear 2 perfiles de prueba

**Perfil 1:**
- Modo: Affinity
- Intereses: [IA, Startups, Marketing]

**Perfil 2:**
- Modo: Affinity
- Intereses: [IA, Desarrollo, Startups]

**Resultado esperado:** Match ~70% (2 intereses comunes)

### 2. Verificar en Supabase

```sql
-- Ver perfiles creados
SELECT * FROM event_profiles;

-- Ver matches calculados
SELECT * FROM matches;

-- Ver interacciones
SELECT * FROM match_interactions;
```

## 🐛 Problemas Comunes

### "No aparecen matches"

**Solución:**
1. Verifica que hay al menos 2 perfiles en el mismo evento
2. Comprueba que tienen algún tag/interés en común
3. Revisa en Supabase SQL Editor:

```sql
SELECT * FROM event_profiles WHERE event_id = '00000000-0000-0000-0000-000000000001';
```

### "Error: get_best_matches is not a function"

**Solución:**
1. Ve a SQL Editor en Supabase
2. Ejecuta de nuevo `supabase-matching-schema.sql`
3. Verifica que las funciones existen:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION';
```

### "CORS error"

**Solución:**
1. Verifica que `.env` tiene las URLs correctas
2. Comprueba que las políticas RLS están activas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'event_profiles';
```

## 📱 Probar en Móvil

```bash
# 1. Obtén tu IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Ejecuta con --host
npm run dev -- --host

# 3. Abre en móvil
http://TU_IP:5173
```

## 🚀 Deploy a Producción

### Opción 1: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Opción 2: GitHub Pages

```bash
npm run build
npm run deploy
```

### Opción 3: Netlify

1. Conecta tu repo de GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

**No olvides configurar las variables de entorno en tu plataforma de deploy!**

## 📚 Recursos

- [Documentación completa](./MATCHING-SYSTEM-README.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

## 💡 Tips

1. **Crea perfiles de prueba variados** para ver diferentes tipos de matches
2. **Experimenta con los modos** para entender cómo funciona cada algoritmo
3. **Revisa las tablas en Supabase** para ver cómo se almacenan los datos
4. **Personaliza los textos** en los componentes para tu evento específico

---

**¿Necesitas ayuda?** Revisa [MATCHING-SYSTEM-README.md](./MATCHING-SYSTEM-README.md) para documentación completa.
