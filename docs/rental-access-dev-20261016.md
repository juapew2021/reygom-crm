# Búsqueda de alquileres: desactivación temporal para administradores de oficina

Aplicado únicamente en DEV el 16 de octubre de 2026. Versión `0.5.0-dev-rental-access-20261016`, imagen `reygom-crm:dev-rental-access-20261016`.

- El rol `admin` ya no ve Búsqueda de alquileres en el menú.
- La ruta `/alquileres` consulta la identidad verificada en `/me` antes de montar la página. Para administradores redirige a `/dashboard`; mientras no se conoce la identidad, no monta el formulario ni inicia su carga de datos.
- `superadmin` y `agent` conservan acceso. Los roles desconocidos no lo habilitan.
- No se han cambiado el API, el servicio crawler, los datos ni PROD. Esta es una restricción de navegación y ruta del CRM; no introduce una nueva política de autenticación en el servicio crawler independiente.

Validación: comprobación de estilo, compilación y 33 pruebas de frontend aprobadas. Prueba real en navegador como `cristian`, administrador de Inmobiliaria Cristian: menú sin el enlace; navegar directamente a `/alquileres` acaba en `/dashboard`. No se ejecutaron búsquedas reales ni se cambiaron registros.

Fuente: `/opt/reygom/releases/rental-access-dev-20261016/crm`, rama `feature/disable-admin-rental-search`. La plantilla anterior del frontend se guarda con permisos 0600 en `rollback-frontend.json` dentro de la misma carpeta de release. Se verificó que los demás despliegues de DEV y todos los de PROD conservan sus especificaciones anteriores.
