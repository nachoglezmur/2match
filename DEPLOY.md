# 🚀 Comandos Rápidos de Despliegue

## Frontend (GitHub Pages)

```bash
# Construir y desplegar en un solo comando
npm run deploy
```

O paso a paso:
```bash
# 1. Construir
npm run build

# 2. Desplegar
gh-pages -d dist
```

## Backend (Render)

El backend se despliega automáticamente cuando haces push a GitHub:

```bash
git add .
git commit -m "Update: production ready with WhatsApp integration"
git push origin main
```

Render detectará los cambios y redesplegará automáticamente.

## Verificar Despliegue

### Frontend
- URL: https://nachoglezmur.github.io/2match
- Verificar: Login con Google funciona
- Verificar: No hay errores 404 en la consola

### Backend
- URL: https://backend-7g2c.onrender.com
- Health check: https://backend-7g2c.onrender.com/health
- Verificar: Estado "healthy" y database "connected"

## Variables de Entorno en Render

Asegúrate de configurar estas variables en el dashboard de Render:

```
DATABASE_URL=postgresql://postgres.xdrlsucphzxgazngsnqg:ratillavoladora01@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
SECRET_KEY=ratillavoladora01-dev-secret-key
GOOGLE_CLIENT_ID=1057318608587-9usao3mkp12elmh3ae9h2makpaenjso8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://backend-7g2c.onrender.com/api/login/google/callback
FLASK_ENV=production
FRONTEND_URL=https://nachoglezmur.github.io/2match
CORS_ORIGINS=https://nachoglezmur.github.io
```

## Troubleshooting

### Error 404 en API
- Verificar que VITE_API_BASE_URL en .env apunta a: `https://backend-7g2c.onrender.com/api`
- Reconstruir frontend: `npm run build`
- Redesplegar: `npm run deploy`

### Login no funciona
- Verificar Google OAuth redirect URIs en Google Cloud Console
- Verificar GOOGLE_REDIRECT_URI en variables de entorno de Render
- Verificar CORS_ORIGINS incluye el dominio del frontend

### WhatsApp no abre
- Verificar que el número de teléfono tiene formato internacional
- Ejemplo correcto: +34600000000
- El código limpia automáticamente caracteres no numéricos

## 🎯 Checklist Pre-Despliegue

- [ ] `.env` tiene URLs de producción
- [ ] `npm run build` ejecuta sin errores
- [ ] Variables de entorno configuradas en Render
- [ ] Google OAuth configurado correctamente
- [ ] Código commiteado y pusheado a GitHub

## 📝 Notas Importantes

1. **Primera vez desplegando**: Ejecuta `npm install gh-pages --save-dev` si no está instalado
2. **Base path**: El frontend usa `/2match/` como base path (configurado en vite.config.js)
3. **CORS**: El backend permite requests desde `https://nachoglezmur.github.io`
4. **Session cookies**: Configuradas como Secure en producción (HTTPS only)
