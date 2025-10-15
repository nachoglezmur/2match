# 🚀 Deployment a GitHub Pages

## ✅ Estado Actual

- ✅ Código subido a GitHub: https://github.com/nachoglezmur/2match
- ✅ Workflow de GitHub Actions configurado
- ✅ `.gitignore` protegiendo credenciales

---

## 📋 Pasos para Activar GitHub Pages

### **1. Habilitar GitHub Pages**

1. Ve a tu repositorio: https://github.com/nachoglezmur/2match
2. Click en **Settings** (⚙️ arriba a la derecha)
3. En el menú izquierdo, click en **Pages**
4. En **Source**, selecciona **"GitHub Actions"**
5. Guarda los cambios

### **2. El Workflow se Ejecutará Automáticamente**

- El workflow ya está configurado en `.github/workflows/deploy.yml`
- Se ejecutará automáticamente con cada push a `main`
- Puedes ver el progreso en la pestaña **Actions**

### **3. Verificar el Deployment**

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Espera a que termine (tarda ~2-3 minutos)
4. Cuando veas el ✅ verde, tu app estará lista

### **4. Acceder a tu App**

Tu aplicación estará disponible en:

🌐 **https://nachoglezmur.github.io/2match/**

---

## ⚠️ IMPORTANTE: Variables de Entorno

El archivo `.env` con tus credenciales de Supabase **NO se sube a GitHub** por seguridad.

### Opción 1: Usar GitHub Secrets (Recomendado)

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Añade estos secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xdrlsucphzxgazngsnqg.supabase.co`

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Tu anon key de Supabase

4. Actualiza `.github/workflows/deploy.yml` para usar los secrets:

```yaml
- name: Build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npm run build
```

### Opción 2: Hardcodear en el Código (Solo para Demos)

Si es solo una demo pública, puedes hardcodear las credenciales:

1. Crea `src/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xdrlsucphzxgazngsnqg.supabase.co'
const supabaseKey = 'tu_anon_key_aqui' // La anon key es pública, no es secreto crítico

export const supabase = createClient(supabaseUrl, supabaseKey)
```

2. Actualiza `src/AppMatching.jsx` para importar desde ahí:

```javascript
import { supabase } from './supabaseClient'
```

⚠️ **Nota:** La anon key de Supabase es relativamente segura de exponer porque:
- Solo permite operaciones que tú defines en las políticas RLS
- No da acceso a datos sensibles
- Es la forma estándar de usar Supabase en frontend

---

## 🔄 Actualizar el Sitio

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

GitHub Actions desplegará automáticamente la nueva versión.

---

## 🐛 Troubleshooting

### El workflow falla

1. Ve a **Actions** → Click en el workflow fallido
2. Lee el error en los logs
3. Errores comunes:
   - Falta configurar GitHub Pages (paso 1)
   - Error en el build (revisa `npm run build` localmente)
   - Permisos insuficientes (verifica Settings → Actions → General → Workflow permissions)

### La página muestra error 404

- Espera unos minutos después del primer deployment
- Verifica que la URL sea correcta: `https://nachoglezmur.github.io/2match/`
- Asegúrate de que `base: '/2match/'` esté en `vite.config.js`

### La app no conecta con Supabase

- Verifica que hayas configurado las variables de entorno (Opción 1 o 2)
- Abre la consola del navegador (F12) para ver errores
- Verifica que las credenciales de Supabase sean correctas

---

## 📊 Monitorear el Sitio

- **GitHub Actions**: Ver historial de deployments
- **GitHub Pages**: Settings → Pages → Ver URL y estado
- **Supabase**: Table Editor → Ver datos de usuarios

---

## ✨ ¡Listo!

Tu app de matching estará disponible públicamente en:

🌐 **https://nachoglezmur.github.io/2match/**

Comparte el link y empieza a conectar personas! 🎉
