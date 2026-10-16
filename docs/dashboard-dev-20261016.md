# Dashboard del administrador — DEV, 16 de octubre de 2026

## Resultado

Desplegado en https://crm-dev.reygom.com/dashboard con versión `0.5.0-dev-dashboard-20261016` e imagen `reygom-crm:dev-dashboard-20261016`.

- Menú por actividad, comunicación, oficina y administración global, según el rol. Perfil y cierre de sesión separados. La marca y los colores de cada oficina se conservan.
- Métricas del administrador: inmuebles, contactos, anuncios pendientes y agentes activos de la oficina. Se han retirado de esta vista Visitas y Ventas: el API actual devuelve ceros fijos, no registros de esas funciones.
- Acción principal contextual: revisar anuncios, añadir el primer inmueble o gestionar contactos. Las tarjetas enlazan a funciones existentes.
- Cartera reciente, oportunidades por estado y acceso al formulario público con revisión del equipo.
- Las respuestas fallidas no se presentan como carteras vacías. Actualización manual y hora de consulta.
- Menú móvil con diálogo modal, devolución del foco al cerrar, navegación por teclado y enlace para saltar al contenido.

## Verificación

- 30 pruebas de frontend aprobadas; comprobación de estilo y compilación aprobadas.
- Vista previa local separada con datos ficticios: oficina vacía, actividad con pendientes, fallo parcial, fallo total y rol agente. Nunca se incorporaron esos datos al CRM.
- Revisión visual a tamaño de escritorio y a 390 px dentro de un marco de prueba. Apertura/cierre del menú móvil y devolución del foco comprobados.
- Revisión autenticada real como `cristian`, Inmobiliaria Cristian: 0 inmuebles, 0 contactos, 0 anuncios por revisar y 1 agente activo. Se abrieron Personalización y Mi equipo sin guardar ni modificar datos.
- Comprobación HTTP de cinco rutas de frontend y de la versión publicada. Las rutas privadas del API continúan rechazando peticiones anónimas.
- Este despliegue solo cambia el frontend DEV. Los despliegues del API y de PROD coinciden con sus especificaciones anteriores.

## Revisión y reversión

Fuente aislada: `/opt/reygom/releases/dashboard-dev-20261016/crm`, rama `feature/admin-dashboard-usability`. La integración personal de correo ya presente en el frontend desplegado se conserva.

La plantilla anterior del frontend se guardó con permisos 0600 en `/opt/reygom/releases/dashboard-dev-20261016/rollback-frontend.json`. Para revertir, restaurar esa plantilla únicamente en `reygom-dev/reygom-crm`.

La vista previa con datos ficticios no forma parte del paquete publicado. No se han cambiado DNS, buzones, permisos de usuarios, bases de datos ni backend por esta mejora de usabilidad.

## Trabajo de correo que continúa pendiente

El buzón `agente.demo@reygom.com` existe y está activo en Hostinger. El soporte de buzones personales fue desplegado previamente en DEV, con aislamiento de usuario y oficina comprobado en una base temporal. La credencial del buzón no se capturó correctamente: el valor transferido estaba vacío. No se envió ningún correo real de prueba. No se debe dar la conexión por terminada ni repetir un envío automáticamente.

Hace falta sustituir esa credencial por otra limitada exclusivamente a este buzón, verificar su captura y completar la prueba autorizada. La revisión automática rechazó el almacenamiento intermedio del token en texto plano; se utilizó transferencia cifrada. Posteriormente rechazó un paso combinado que desactivaba la conexión incompleta y guardaba cambios del correo durante la preparación del dashboard. Ese paso no se ejecutó; el trabajo del dashboard se preparó por separado y conservó la configuración del correo.
