# 🚀 Instrucciones para Configurar Supabase

## ⚠️ IMPORTANTE: Ejecuta en este orden

Ya que tienes errores de políticas duplicadas, usa estos archivos **NUEVOS** que evitan conflictos:

---

## 📋 Paso 1: Migración Limpia (Tablas + Campos)

### Archivo: `supabase-clean-migration.sql`

**Qué hace:**
- ✅ Crea tablas solo si no existen
- ✅ Añade campos nuevos a `event_profiles`
- ✅ Crea índices
- ✅ Configura RLS y políticas (sin duplicar)
- ✅ Inserta evento de ejemplo

**Cómo ejecutar:**
1. Abre **Supabase** → Tu proyecto → **SQL Editor**
2. Copia **TODO** el contenido de `supabase-clean-migration.sql`
3. Pega en el editor
4. Click en **RUN** (o Ctrl+Enter)
5. Verifica que dice "Success" sin errores

---

## 📋 Paso 2: Funciones de Matching

### Archivo: `supabase-functions.sql`

**Qué hace:**
- ✅ Elimina funciones antiguas si existen
- ✅ Crea funciones nuevas:
  - `match_affinity()` - Matching por intereses
  - `match_specific()` - Matching busco/ofrezco
  - `match_explore()` - Matching serendipia
  - `calculate_contextual_match()` - Función principal
  - `get_best_matches()` - Obtener matches
  - `record_interaction()` - Registrar acciones

**Cómo ejecutar:**
1. En **SQL Editor** de Supabase
2. Copia **TODO** el contenido de `supabase-functions.sql`
3. Pega en el editor
4. Click en **RUN**
5. Verifica que dice "Success"

---

## ✅ Verificación

Después de ejecutar ambos archivos, ejecuta esto para verificar:

```sql
-- 1. Verificar tablas
SELECT table_name 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY table_name;

-- Deberías ver: events, users, event_profiles, matches, match_interactions

-- 2. Verificar columnas de event_profiles
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'event_profiles'
ORDER BY ordinal_position;

-- Deberías ver los nuevos campos: skills, current_project, has_active_project, commitment_level, availability

-- 3. Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Deberías ver: calculate_contextual_match, get_best_matches, match_affinity, match_explore, match_specific, record_interaction
```

---

## 🎯 Resumen

**Solo necesitas 2 archivos en este orden:**

1. ✅ `supabase-clean-migration.sql` - Tablas, campos, índices, políticas
2. ✅ `supabase-functions.sql` - Funciones de matching

**NO uses estos archivos antiguos:**
- ❌ `supabase-matching-schema.sql` (tiene políticas duplicadas)
- ❌ `supabase-migration-extended-fields.sql` (tiene error de índice GIN)
- ❌ `supabase-setup.sql` (obsoleto)

---

## 🐛 Si Sigues Teniendo Errores

### Error: "policy already exists"
**Solución:** Ya está resuelto en `supabase-clean-migration.sql` con `IF NOT EXISTS`

### Error: "text has no default operator class for gin"
**Solución:** Ya está resuelto, no creamos índice GIN en campos TEXT

### Error: "function already exists"
**Solución:** Ya está resuelto en `supabase-functions.sql` con `DROP FUNCTION IF EXISTS`

### Error: "table already exists"
**Solución:** Ya está resuelto con `IF NOT EXISTS`

---

## 🚀 Después de Configurar Supabase

1. **Verifica tu `.env`:**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

2. **Ejecuta la app:**
   ```bash
   npm run dev
   ```

3. **Prueba creando un perfil:**
   - Elige un modo (Affinity o Specific)
   - Usa el buscador de tags
   - Ajusta el nivel de compromiso
   - Envía el formulario

4. **Verifica en Supabase:**
   - Ve a **Table Editor** → `event_profiles`
   - Deberías ver tu perfil con todos los campos

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Copia el error completo** que aparece en Supabase
2. **Verifica qué archivo ejecutaste** y en qué orden
3. **Comprueba que copiaste TODO el archivo** (no solo una parte)

---

**¡Listo! Tu base de datos está configurada correctamente 🎉**
