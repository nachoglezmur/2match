# 🤝 2match - Sistema de Matching Contextual

## 📋 Descripción

Sistema completo de networking para eventos con algoritmo de matching contextual que adapta las conexiones según el objetivo del usuario.

## 🎯 Características Principales

### 3 Modos de Conexión

1. **🤝 Conocer gente afín** (Affinity Mode)
   - Matching basado en intereses comunes
   - Rasgos de personalidad compartidos
   - Compatibilidad de estilo de conversación
   - Ideal para: networking casual, hacer amigos, encontrar personas con pasiones similares

2. **🎯 Busco perfiles específicos** (Specific Mode)
   - Sistema "busco/ofrezco"
   - Matching complementario bidireccional
   - Puntuación extra si ambos se pueden ayudar mutuamente
   - Ideal para: buscar inversores, cofundadores, mentores, clientes

3. **🧭 Explorar y descubrir** (Explore Mode)
   - Matching aleatorio con diversidad
   - Conexiones inesperadas (serendipia)
   - Mínima fricción (solo 2-3 tags opcionales)
   - Ideal para: descubrir oportunidades, salir de la zona de confort

### Algoritmo Inteligente

- **Contextual**: Diferentes algoritmos según el modo elegido
- **Explicable**: El usuario siempre sabe POR QUÉ matcheó con alguien
- **Adaptativo**: Aprende de las interacciones (likes, passes, conexiones)
- **Eficiente**: Pre-cálculo de matches con PostgreSQL functions

## 🚀 Instalación y Configuración

### 1. Configurar Supabase

#### Paso 1: Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota tu `Project URL` y `anon public key`

#### Paso 2: Ejecutar el schema SQL
1. Ve a SQL Editor en tu proyecto Supabase
2. Ejecuta el archivo `supabase-matching-schema.sql`
3. Esto creará:
   - Tablas: `events`, `users`, `event_profiles`, `matches`, `match_interactions`
   - Funciones: `calculate_contextual_match`, `get_best_matches`, `record_interaction`
   - Índices optimizados para performance
   - Políticas RLS (Row Level Security)

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── WelcomeScreen.jsx      # Pantalla de bienvenida
│   ├── ModeSelection.jsx      # Selección de modo de conexión
│   ├── ProfileSetup.jsx       # Formulario de perfil adaptado por modo
│   ├── MatchesFeed.jsx        # Feed tipo Tinder con matches
│   └── ProfileDetail.jsx      # Vista detallada del perfil
├── AppMatching.jsx            # Componente principal
├── AppMatching.css            # Estilos completos
├── supabaseClient.js          # Cliente de Supabase
└── main.jsx                   # Entry point
```

## 🎨 Flujo de Usuario

```
1. Welcome Screen
   ↓
2. Mode Selection (elegir: affinity, specific, explore)
   ↓
3. Profile Setup (formulario adaptado según modo)
   ↓
4. Matches Feed (swipe cards con scoring)
   ↓
5. Profile Detail (vista completa + explicación del match)
```

## 🔧 Cómo Funciona el Matching

### Modo Affinity (Afinidad)

**Inputs del usuario:**
- Intereses (3-5 tags)
- Rasgos de personalidad
- Profundidad de conversación (1-10)

**Algoritmo:**
```
Score = (Intereses comunes × 50%) + 
        (Rasgos comunes × 30%) + 
        (Compatibilidad conversación × 20%)
```

**Ejemplo:**
- Usuario A: Intereses [IA, Startups, Marketing], Profundidad: 8
- Usuario B: Intereses [IA, Desarrollo, Startups], Profundidad: 7
- Match: 2 intereses comunes (66%), profundidad similar → Score: ~75%

### Modo Specific (Específico)

**Inputs del usuario:**
- Qué busco (ej: "Inversor seed", "Mentor en marketing")
- Qué ofrezco (ej: "Prototipo validado", "Experiencia en fundraising")

**Algoritmo:**
```
Score = (Coincidencias × 30)
Bonus bidireccional = Score × 1.5 si ambos se ayudan
```

**Ejemplo:**
- Usuario A busca: [Inversor], ofrece: [Prototipo validado]
- Usuario B busca: [Startups early-stage], ofrece: [Capital + mentoría]
- Match bidireccional → Score: 90%

### Modo Explore (Explorar)

**Inputs del usuario:**
- 2-3 tags amplios (opcional)

**Algoritmo:**
```
Score = Random(30-70) + Bonus diversidad(0-20)
```

Cuanto MENOS overlap, mayor score (fomenta serendipia)

## 💾 Base de Datos

### Tablas Principales

#### `event_profiles`
```sql
{
  id: UUID,
  user_id: UUID,
  event_id: UUID,
  connection_mode: 'affinity' | 'specific' | 'explore',
  interests: JSONB,
  personality_traits: JSONB,
  seeking: JSONB,
  offering: JSONB,
  broad_tags: JSONB,
  conversation_depth: INT (1-10)
}
```

#### `matches`
```sql
{
  id: UUID,
  profile1_id: UUID,
  profile2_id: UUID,
  score: FLOAT (0-100),
  match_type: 'affinity' | 'complementary' | 'serendipity' | 'hybrid',
  reason: JSONB  // Explicación del match
}
```

#### `match_interactions`
```sql
{
  id: UUID,
  match_id: UUID,
  user_id: UUID,
  action: 'viewed' | 'interested' | 'passed' | 'connected' | 'chatted'
}
```

### Funciones Principales

#### `get_best_matches(profile_id, limit)`
Obtiene los mejores matches para un perfil:
- Excluye perfiles ya descartados
- Ordena por score descendente
- Diversifica tipos de match
- Retorna datos completos del usuario + explicación

#### `calculate_contextual_match(profile1_id, profile2_id)`
Calcula el score entre dos perfiles:
- Detecta modos de conexión
- Aplica algoritmo correspondiente
- Retorna: score, match_type, reason

#### `record_interaction(match_id, user_id, action)`
Registra interacciones y ajusta scores:
- Guarda la acción del usuario
- Si es positiva (connected/chatted): aumenta score de matches similares
- Si es negativa (passed): reduce score del match

## 🎨 Personalización

### Colores de Match Types

```css
affinity: #10b981 (verde)
complementary: #3b82f6 (azul)
serendipity: #f59e0b (naranja)
hybrid: #8b5cf6 (morado)
```

### Umbrales de Score

- Mínimo para mostrar: 20%
- Bueno: 50-70%
- Excelente: 70-90%
- Perfecto: 90-100%

## 📊 Performance

### Optimizaciones Implementadas

1. **Índices GIN en JSONB**: Búsquedas rápidas en arrays de tags
2. **Índices compuestos**: profile_id + score DESC
3. **Funciones IMMUTABLE**: Cacheo de resultados cuando es posible
4. **Límite de matches**: Máximo 20 por consulta

### Tiempos Esperados

- Evento de 100 personas: ~5 segundos calcular todos los matches
- Evento de 1,000 personas: ~2 minutos (background job)
- Consulta de matches por usuario: < 50ms

## 🔐 Seguridad

### Row Level Security (RLS)

- Todas las tablas tienen RLS habilitado
- Políticas públicas para INSERT (registro)
- Políticas públicas para SELECT (lectura)
- Sin autenticación requerida (MVP)

**Para producción, implementar:**
- Autenticación con Supabase Auth
- Políticas RLS por usuario
- Rate limiting
- Validación de inputs

## 🚀 Próximos Pasos

### Features Sugeridas

1. **Chat en tiempo real**
   - Usar Supabase Realtime
   - Solo entre usuarios conectados

2. **Notificaciones**
   - Push notifications cuando hay match mutuo
   - Email digest diario

3. **Analytics**
   - Dashboard de matches por tipo
   - Tasa de conversión (views → connects)
   - Heatmap de intereses más populares

4. **Gamificación**
   - Badges por número de conexiones
   - Leaderboard de networkers
   - Recompensas por completar perfil

5. **Mejoras al Algoritmo**
   - Machine Learning para predecir matches exitosos
   - Clustering de usuarios similares
   - Recomendaciones basadas en grafo social

## 🐛 Troubleshooting

### Error: "get_best_matches is not a function"
- Verifica que ejecutaste `supabase-matching-schema.sql`
- Revisa en SQL Editor que las funciones existen

### No aparecen matches
- Verifica que hay otros perfiles en el mismo evento
- Revisa que el score mínimo (20%) se cumple
- Comprueba que no has descartado a todos

### Error de CORS
- Verifica que la URL de Supabase es correcta
- Comprueba que las políticas RLS permiten SELECT público

## 📝 Licencia

MIT

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -am 'Añadir nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Crea un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**¡Feliz networking! 🤝**
