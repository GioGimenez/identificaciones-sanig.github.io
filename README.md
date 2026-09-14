# Identificaciones San Ignacio

Portal de la Oficina Regional del Departamento de Identificaciones de San Ignacio, Misiones, construido con Next.js.

## Desarrollo local

Requisitos: Node.js 20.9 o superior.

1. Instalar dependencias:

   npm install

2. Crear el archivo de entorno:

   Copy-Item .env.example .env

3. Completar las variables de Turso y Supabase en .env.

4. Iniciar el servidor:

   npm run dev

## Base de datos

Las migraciones de Turso se encuentran en db/migrations. Para aplicarlas:

   npm run db:migrate

La configuración inicial de la tabla de noticias existente se conserva en db/schema.sql y db/seed.sql mediante:

   npm run db:setup

Las variables privadas nunca deben comenzar con NEXT_PUBLIC_ ni subirse al repositorio.

El procedimiento de despliegue en Vercel está documentado en DEPLOY_VERCEL.md.

## Comandos

   npm run dev
   npm run typecheck
   npm run build
   npm run start
   npm run db:migrate
   npm run db:setup
