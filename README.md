# CL14 · Logística — Sika Chile

Aplicación web estática para el centro de operaciones logísticas CL14: ingreso de despachos, planificación de rutas por peso bruto (objetivo 14.400 kg / máx. 15.000 kg), control de flota, retornos de IBC, catálogo de materiales SAP y datos maestros de choferes.

No tiene backend ni dependencias de ejecución: es HTML + CSS + JavaScript y funciona sin Internet.

> **Estado: prototipo local.** Los datos se guardan en el `localStorage` del navegador de cada usuario. No hay sincronización entre usuarios (ver *Siguientes pasos*).

## Uso rápido

```bash
git clone <URL-del-repositorio>
cd cl14-sika-logistica
npm start            # sirve en http://localhost:8080  (usa python3)
```

También puedes abrir `index.html` directamente en el navegador (doble clic).

### Publicar con GitHub Pages
*Settings → Pages → Deploy from a branch → `main` / `(root)`*.
Nota: en repositorios privados Pages requiere un plan de GitHub que lo permita.

## Estructura

```
index.html                  # estructura de la interfaz
css/styles.css              # estilos
js/app.js                   # lógica de la aplicación
js/data/drivers.js          # choferes (EJEMPLO anonimizado)
js/data/clients-products.js # listas de autocompletado
js/data/materials.js        # catálogo SAP base (761 materiales)
assets/sika-logo.png        # logo
tools/check-data.mjs        # validación de los datos semilla
.github/workflows/ci.yml    # lint + validación en cada push
```

## Datos sensibles — leer antes de publicar

- `js/data/drivers.js` contiene **datos de ejemplo anonimizados**. Los choferes y patentes reales **no deben subirse a un repositorio público** (datos personales).
  Para usar los reales en tu equipo, reemplaza el contenido de ese archivo y evita commitearlo:
  `git update-index --skip-worktree js/data/drivers.js`
- `js/data/clients-products.js` y `js/data/materials.js` incluyen nombres de clientes y el catálogo SAP: información comercial interna. **Recomendado: repositorio privado.**
- Los respaldos `CL14_respaldo_*.json` pueden contener datos reales; ya están en `.gitignore`.
- El logo y la marca Sika son propiedad de Sika. Confirma que puedes publicarlos antes de hacer el repositorio público.

## Desarrollo

```bash
npm install
npm test             # eslint + validación de datos
npm run format       # prettier
```

Los scripts se cargan como scripts clásicos (no módulos) para que la app siga funcionando con doble clic (`file://`).
La clave de almacenamiento sigue siendo `CL14_SIKA_V7_2026` para no perder los datos de quienes ya usaban la v7/v8 en su navegador.

## Respaldo y restauración

*Datos maestros → Exportar respaldo JSON / Restaurar respaldo.* Haz un respaldo antes de limpiar datos del navegador: es la única copia mientras no exista sincronización.

## Siguientes pasos sugeridos

1. Persistencia compartida (API + base de datos, o Supabase/Firebase) para trabajar entre varios usuarios.
2. Dividir `js/app.js` en módulos (`state`, `planning`, `fleet`, `materials`, `ui`) con ES modules y un bundler (Vite).
3. Tests de lógica de planificación (`routeWeight`, `suggestGroups`, `adminCheck`).
4. Cargar datos maestros desde archivos (JSON/CSV) en vez de `<script>` para no versionar datos.

## Cambios respecto a v8 (archivo único)

- Separado en `index.html` + CSS + JS + datos; logo extraído a `assets/`.
- Choferes anonimizados en el repositorio; Content-Security-Policy y metadatos añadidos.
- Eliminado código sin uso y un cálculo redundante al importar pedidos.
- Aviso al usuario si el navegador no puede guardar (almacenamiento lleno/bloqueado).
- Accesibilidad: `aria-current` en el menú, `aria-live` en avisos, `prefers-reduced-motion`.
- Respaldo marcado como `version: 8` (los respaldos anteriores se siguen pudiendo restaurar).
