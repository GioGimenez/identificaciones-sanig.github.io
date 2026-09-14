# Plan de despliegue en Vercel

## Estado actual

- GitHub CLI y Vercel CLI están autenticadas.
- El repositorio está publicado en `main`.
- El proyecto quedó conectado a Vercel: `gyg-creaciones/identificaciones-sanig.github.io`.
- Deployment de producción listo: https://identificaciones-saniggithubio.vercel.app
- Las variables de Turso, Supabase y `SITE_URL` están configuradas en Production y Preview.
- `ADMIN_PASSWORD` no se configuró en Vercel.

## Estado de las herramientas

- El repositorio remoto está configurado en GitHub:
  https://github.com/GioGimenez/identificaciones-sanig.github.io
- Vercel CLI está instalado localmente.
- GitHub CLI está instalado localmente.
- La autenticación de GitHub CLI fue confirmada con `gh auth status`.
- La autenticación de Vercel fue confirmada con `vercel whoami`.

## Opción recomendada: Vercel conectado a GitHub

1. Iniciar sesión en Vercel.
2. Importar el repositorio de GitHub.
3. Seleccionar el framework Next.js.
4. Usar estos valores:

   - Build command: npm run build
   - Install command: npm install
   - Output directory: dejar el valor automático de Next.js

5. Configurar las variables de entorno en Vercel.
6. Crear el primer deployment.
7. Configurar el dominio definitivo y actualizar SITE_URL.
8. Hacer push a main para activar deployments automáticos.

## Variables de producción

Agregar en Vercel para Production:

- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- SUPABASE_BUCKET_URL
- BUCKET_NAME
- BUCKET_REGION
- BUCKET_ACCESS_KEY_ID
- BUCKET_SECRET_ACCESS_KEY
- SITE_URL

No agregar ADMIN_PASSWORD a Vercel. El usuario administrador ya fue creado en Turso y la contraseña solamente se necesita para el comando inicial admin:create.

Todas las claves deben estar disponibles únicamente en el servidor. No deben comenzar con NEXT_PUBLIC_.

## Opción alternativa: Vercel CLI

Desde la carpeta del proyecto:

1. Autenticarse:

   vercel login

2. Vincular el proyecto:

   vercel link

3. Agregar cada variable de entorno de forma interactiva:

   vercel env add TURSO_DATABASE_URL production
   vercel env add TURSO_AUTH_TOKEN production
   vercel env add SUPABASE_BUCKET_URL production
   vercel env add BUCKET_NAME production
   vercel env add BUCKET_REGION production
   vercel env add BUCKET_ACCESS_KEY_ID production
   vercel env add BUCKET_SECRET_ACCESS_KEY production
   vercel env add SITE_URL production

4. Crear un deployment de prueba:

   vercel

5. Verificar login, panel, carga de imagen y publicación.

6. Crear el deployment de producción:

   vercel --prod

## GitHub CLI

Para habilitar el flujo automático:

1. Autenticarse:

   gh auth login

2. Verificar el repositorio:

   git remote -v

3. Confirmar los cambios:

   git status
   git add .
   git commit -m "Preparar blog para producción"

4. Publicar en GitHub:

   git push origin main

## Verificación posterior al deploy

- Abrir la portada.
- Ingresar en /admin/login.
- Crear un borrador.
- Subir una imagen al bucket images.
- Publicar el artículo.
- Verificar /blog.
- Abrir el detalle por slug.
- Confirmar /sitemap.xml y /robots.txt.
- Confirmar que los borradores no sean públicos.
- Revisar los logs de Vercel.

## Migraciones

Las migraciones de Turso deben ejecutarse antes del deployment final:

   npm run db:migrate

La migración no se ejecuta automáticamente durante cada build para evitar cambios inesperados en producción.
