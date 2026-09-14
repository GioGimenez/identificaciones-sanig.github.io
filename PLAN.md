# Plan de evolución del proyecto a blog

## Decisiones de arquitectura

- Next.js y TypeScript serán la aplicación principal.
- Turso almacenará usuarios, sesiones y publicaciones.
- Supabase se utilizará únicamente para el bucket de imágenes.
- No se utilizará Supabase Auth ni la base de datos de Supabase.
- El panel administrativo no tendrá registro público de usuarios.

## Fases

- [x] Fase 0: migración inicial del sitio a Next.js.
- [x] Fase 1: crear la estructura de datos base en Turso.
- [x] Fase 2: implementar autenticación propia con usuarios y sesiones en Turso.
- [x] Fase 3: integrar carga de imágenes al bucket images de Supabase.
- [x] Fase 4: crear el panel administrativo para gestionar publicaciones.
- [x] Fase 5: crear el blog público con listado y detalle por slug.
- [ ] Fase 6: agregar validaciones, seguridad, pruebas y preparación para producción.

## Fase 1: estructura de datos en Turso

Tablas creadas:

- users: usuarios administradores y sus contraseñas almacenadas como hash.
- sessions: sesiones activas con tokens almacenados como hash.
- posts: publicaciones, contenido, estado, autor e imagen asociada.
- _migrations: registro de migraciones aplicadas.

Criterios de finalización:

- La migración está versionada dentro del repositorio.
- La base remota de Turso tiene las tablas creadas.
- La migración puede ejecutarse nuevamente sin duplicar tablas.
- El usuario administrador se creó durante la Fase 2.

Estado: completada. La migración 001_blog_base.sql fue aplicada a la base remota y su segunda ejecución confirmó que es idempotente.

## Fase 2: autenticación

- Crear el usuario administrador inicial mediante un comando seguro.
- Guardar contraseñas usando un algoritmo de hash resistente.
- Implementar login, logout y expiración de sesiones.
- Proteger todas las rutas administrativas.
- Impedir el registro público de usuarios.

Estado: completada. La autenticación funciona y el usuario administrador inicial fue creado en Turso.

## Fase 3: imágenes

- Usar el bucket images de Supabase.
- Validar tipo, tamaño y extensión.
- Generar rutas únicas por publicación.
- Guardar en Turso la ruta y URL de cada imagen.
- Eliminar la imagen anterior al reemplazarla o borrar el artículo.
- Mantener las claves de Supabase solamente en el servidor.

Estado: completada. La carga y eliminación fueron probadas contra el bucket images con una sesión administrativa temporal.

## Fase 4: panel administrativo

- Crear, editar, publicar y eliminar artículos.
- Guardar artículos como borrador.
- Subir y reemplazar imagen principal.
- Agregar título, resumen, contenido, slug y texto alternativo.

Estado: completada. El panel permite listar, crear, editar, publicar y eliminar publicaciones.

## Fase 5: blog público

- Listado de publicaciones publicadas.
- Página individual por slug.
- Diseño responsive.
- Metadatos para buscadores y redes sociales.
- Ocultar borradores al público.

Estado: completada. Se agregaron el listado, detalle por slug, metadatos, sitemap y robots.

## Fase 6: seguridad y entrega

- Validar todas las entradas.
- Proteger operaciones de escritura.
- Limitar intentos de login.
- Revisar exposición de secretos.
- Probar el flujo completo en local y producción.
- Documentar despliegue y mantenimiento.

Estado: en progreso. Ya se agregaron validaciones de publicaciones, protección de rutas, limitación de intentos de login, cabeceras de seguridad, metadatos, sitemap y robots. El procedimiento de Vercel quedó documentado en DEPLOY_VERCEL.md. Falta ejecutar la autenticación de las CLIs y desplegar cuando se confirme la publicación.
