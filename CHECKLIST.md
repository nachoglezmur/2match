# ✅ Checklist de Configuración - 2match

Sigue estos pasos en orden para tener tu aplicación funcionando.

## 📋 Antes de Empezar

- [x] Node.js instalado
- [x] npm instalado
- [x] Aplicación React creada
- [x] Dependencias instaladas

## 🔧 Configuración de Supabase

### Paso 1: Crear Cuenta y Proyecto
- [ ] Ir a https://supabase.com
- [ ] Crear cuenta gratuita
- [ ] Crear nuevo proyecto llamado "2match"
- [ ] Guardar la contraseña del proyecto
- [ ] Esperar a que el proyecto se cree (1-2 min)

### Paso 2: Crear Base de Datos
- [ ] Ir a "SQL Editor" en el menú lateral
- [ ] Hacer clic en "New query"
- [ ] Copiar el contenido de `supabase-setup.sql`
- [ ] Pegar en el editor
- [ ] Hacer clic en "Run" (o Ctrl+Enter)
- [ ] Verificar mensaje: "Success. No rows returned"

### Paso 3: Obtener Credenciales
- [ ] Ir a "Settings" → "API"
- [ ] Copiar "Project URL"
- [ ] Copiar "anon public key"

### Paso 4: Configurar Variables de Entorno
- [ ] Ejecutar: `copy .env.example .env`
- [ ] Abrir archivo `.env`
- [ ] Pegar Project URL en `VITE_SUPABASE_URL`
- [ ] Pegar anon key en `VITE_SUPABASE_ANON_KEY`
- [ ] Guardar el archivo

## 🧪 Prueba Local

- [ ] Ejecutar: `npm run dev`
- [ ] Abrir http://localhost:5173
- [ ] Completar el formulario de prueba
- [ ] Ir a Supabase → Table Editor → participants
- [ ] Verificar que el registro aparece

## 🌐 Configuración de GitHub

### Paso 1: Crear Repositorio
- [ ] Ir a https://github.com
- [ ] Hacer clic en "New repository"
- [ ] Nombre: `2match-app`
- [ ] Dejar como público
- [ ] NO añadir README, .gitignore, ni licencia
- [ ] Crear repositorio

### Paso 2: Subir Código
- [ ] Ejecutar: `git init`
- [ ] Ejecutar: `git add .`
- [ ] Ejecutar: `git commit -m "Initial commit"`
- [ ] Copiar el comando de GitHub: `git remote add origin ...`
- [ ] Ejecutar: `git branch -M main`
- [ ] Ejecutar: `git push -u origin main`

### Paso 3: Configurar GitHub Pages
- [ ] Ir a tu repositorio en GitHub
- [ ] Hacer clic en "Settings"
- [ ] Hacer clic en "Pages" en el menú lateral
- [ ] En "Source", seleccionar "Deploy from a branch"
- [ ] En "Branch", seleccionar `gh-pages` y `/root`
- [ ] Hacer clic en "Save"

### Paso 4: Desplegar
- [ ] Ejecutar: `npm run deploy`
- [ ] Esperar a que termine (puede tardar 1-2 min)
- [ ] Ir a: `https://TU_USUARIO.github.io/2match-app/`
- [ ] Verificar que la app funciona

## 🎯 Preparación para el Evento

### Antes del Evento
- [ ] Probar la app en diferentes dispositivos
- [ ] Crear QR code con la URL de tu app
- [ ] Imprimir cartel con el QR
- [ ] Preparar laptop/tablet como backup
- [ ] Verificar conexión a internet del lugar

### Durante el Evento
- [ ] Colocar cartel en lugar visible
- [ ] Probar que la app funciona en el lugar
- [ ] Observar cómo la gente usa el formulario
- [ ] Tomar notas de comportamiento (no opiniones)
- [ ] No interrumpir mientras completan el formulario

### Después del Evento
- [ ] Ir a Supabase → Table Editor → participants
- [ ] Exportar datos a CSV
- [ ] Analizar patrones de intereses
- [ ] Identificar clusters de personas similares
- [ ] Contactar participantes para hacer matching
- [ ] Preguntar si quieren recibir contactos

## 📊 Análisis de Resultados

- [ ] Calcular tasa de conversión (vieron QR vs. registrados)
- [ ] Calcular tasa de completado (empezaron vs. terminaron)
- [ ] Identificar intereses más comunes
- [ ] Identificar campos que causan fricción
- [ ] Documentar feedback espontáneo
- [ ] Decidir siguiente iteración

## 🔍 Validación de la Idea

### Preguntas Clave a Responder
- [ ] ¿La gente completa el formulario sin ayuda?
- [ ] ¿Los intereses son lo suficientemente específicos?
- [ ] ¿Las biografías son útiles para matching?
- [ ] ¿La gente pregunta por resultados después?
- [ ] ¿Hay suficientes personas con intereses similares?
- [ ] ¿El matching manual es viable?
- [ ] ¿La gente estaría dispuesta a pagar por esto?

### Métricas de Éxito
- [ ] Al menos 20 registros en el primer evento
- [ ] Tasa de completado > 70%
- [ ] Al menos 3 clusters de intereses
- [ ] Al menos 5 personas preguntan por resultados
- [ ] Al menos 2 conexiones exitosas

## 🚀 Próximos Pasos

Si la validación es exitosa:
- [ ] Automatizar el matching con algoritmo
- [ ] Añadir notificaciones por email/SMS
- [ ] Crear dashboard para organizadores
- [ ] Añadir chat entre matches
- [ ] Implementar sistema de feedback
- [ ] Buscar eventos para pilotos

Si la validación falla:
- [ ] Analizar por qué (datos, no opiniones)
- [ ] Identificar el problema real
- [ ] Pivotar o iterar
- [ ] Probar en otro tipo de evento
- [ ] Considerar otro enfoque

## 📞 Soporte

Si algo no funciona:
- [ ] Revisar este checklist
- [ ] Leer `INSTRUCCIONES.md`
- [ ] Leer `README.md`
- [ ] Verificar consola del navegador (F12)
- [ ] Verificar logs de Supabase

---

## ✨ ¡Listo para Validar!

Cuando todos los checkboxes estén marcados, estarás listo para validar tu startup en un evento real.

**Recuerda:** Observa comportamiento, no pidas opiniones. Los datos te dirán si la idea funciona.

**¡Mucha suerte! 🚀**
