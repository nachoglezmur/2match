# 📖 Instrucciones Rápidas para 2match

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Configurar Supabase (2 minutos)

1. **Crear cuenta en Supabase**
   - Ve a https://supabase.com
   - Haz clic en "Start your project"
   - Crea una cuenta gratuita

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Nombre: `2match`
   - Database Password: (guarda esta contraseña)
   - Region: Elige la más cercana a ti
   - Haz clic en "Create new project"
   - Espera 1-2 minutos a que se cree

3. **Crear la tabla**
   - En el menú lateral, ve a "SQL Editor"
   - Haz clic en "New query"
   - Copia y pega el contenido del archivo `supabase-setup.sql`
   - Haz clic en "Run" (o presiona Ctrl+Enter)
   - Deberías ver "Success. No rows returned"

4. **Obtener credenciales**
   - Ve a "Settings" → "API"
   - Copia:
     - **Project URL** (algo como: https://xxxxx.supabase.co)
     - **anon public key** (una clave larga)

### Paso 2: Configurar la aplicación (1 minuto)

1. **Crear archivo .env**
   ```bash
   copy .env.example .env
   ```

2. **Editar .env**
   - Abre el archivo `.env` con un editor de texto
   - Reemplaza:
     ```
     VITE_SUPABASE_URL=tu_url_aqui
     VITE_SUPABASE_ANON_KEY=tu_clave_aqui
     ```
   - Con tus credenciales de Supabase

### Paso 3: Probar localmente (2 minutos)

```bash
# Ejecutar la aplicación
npm run dev
```

- Abre tu navegador en http://localhost:5173
- Prueba el formulario
- Verifica en Supabase (Table Editor → participants) que se guardó

## 🌐 Desplegar en GitHub Pages

### Opción A: Desde la terminal

```bash
# 1. Inicializar git
git init
git add .
git commit -m "Initial commit"

# 2. Crear repositorio en GitHub
# Ve a github.com y crea un nuevo repositorio llamado "2match-app"

# 3. Conectar y subir
git remote add origin https://github.com/TU_USUARIO/2match-app.git
git branch -M main
git push -u origin main

# 4. Desplegar
npm run deploy
```

### Opción B: Usando GitHub Desktop

1. Abre GitHub Desktop
2. File → Add Local Repository
3. Selecciona la carpeta `2match-app`
4. Publish repository
5. En la terminal: `npm run deploy`

### Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `gh-pages` → `/root`
5. Save

**Tu app estará en:** `https://TU_USUARIO.github.io/2match-app/`

## 📊 Ver los Datos

1. Ve a Supabase
2. Table Editor → `participants`
3. Verás todos los registros

Para exportar:
- Haz clic en los tres puntos (...)
- "Export to CSV"

## 🎯 Usar en tu Evento

### Antes del evento:

1. Imprime un QR code con la URL de tu app
2. Crea un cartel: "🤝 Conecta con personas - Escanea el QR"
3. Prepara tu laptop/tablet con la app abierta

### Durante el evento:

1. Coloca el cartel en un lugar visible
2. Invita a la gente a registrarse
3. Observa cómo interactúan con el formulario
4. Toma notas de feedback espontáneo

### Después del evento:

1. Exporta los datos de Supabase
2. Analiza:
   - ¿Cuántas personas se registraron?
   - ¿Qué intereses son más comunes?
   - ¿Hay clusters de intereses?
3. Contacta a las personas para hacer matching manual
4. Pregunta si les gustaría recibir contactos

## 🔧 Solución de Problemas

### Error: "Failed to fetch"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que la tabla existe en Supabase

### Error: "relation participants does not exist"
- Ejecuta el SQL en Supabase (`supabase-setup.sql`)

### La app no se ve en GitHub Pages
- Espera 2-3 minutos después del deploy
- Verifica que la rama `gh-pages` existe
- Revisa Settings → Pages en GitHub

### No puedo ver los datos en Supabase
- Verifica que estás autenticado en Supabase
- Las políticas RLS solo permiten lecturas autenticadas

## 💡 Tips para Validación

### Preguntas a observar (no preguntar directamente):

- ¿La gente completa el formulario?
- ¿Se detienen en algún campo específico?
- ¿Preguntan qué poner en algún campo?
- ¿Cuánto tiempo tardan en completarlo?

### Métricas importantes:

- **Tasa de conversión**: Personas que ven el QR vs. se registran
- **Tasa de completado**: Personas que empiezan vs. terminan
- **Calidad de datos**: ¿La información es útil para matching?
- **Interés post-evento**: ¿Quieren saber con quién conectaron?

### Siguiente iteración:

Basándote en los datos:
1. Simplifica campos que nadie completa
2. Añade opciones para intereses comunes
3. Mejora la UX donde la gente se detiene
4. Considera añadir matching automático

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica el README.md
3. Revisa la consola del navegador (F12)
4. Revisa los logs de Supabase

---

**¡Éxito con tu validación! 🚀**
