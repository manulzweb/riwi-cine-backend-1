# TOOLING — Husky, ESLint, commitlint, lint‑staged y Prettier

> Guía práctica (español LATAM) para developers junior — todo está automatizado. No tenés que configurar nada extra: al editar, hacer `git add` y `git commit` las herramientas se ejecutan por vos.

---

## Resumen rápido
- Propósito: asegurar calidad y formato consistente del código antes de los commits, sin que vos debas preocuparte.
- Herramientas cubiertas: Husky (hooks de Git), lint‑staged (aplica linters solo a archivos staged), ESLint (análisis estático), Prettier (formateo) y commitlint (convención de mensajes).
- Estado: la configuración está dentro de la carpeta `app/` y el flujo de pre-commit está automatizado. Si todo funciona bien, NO TENÉS QUE HACER NADA.

---

## Archivos importantes (rutas reales)
- `app/.husky/pre-commit` — hook pre-commit que ejecuta `npx lint-staged`.
- `app/package.json` — scripts npm y la sección `lint-staged`:
  - `*.{ts,js}` → `eslint --fix`, `prettier --write`
  - `*.{json,md,yml,yaml}` → `prettier --write`
- `app/eslint.config.mjs` — configuración de ESLint (reglas y exclusiones).
- `app/.prettierrc` — configuración de Prettier.
- `app/.prettierignore` — reglas de exclusión para Prettier.
- `app/commitlint.config.cjs` — configuración de commitlint (conv conventional commits).

---

## Qué ocurre automáticamente cuando commiteás
1. Editás archivos (por ejemplo `app/src/...`).
2. `git add archivo.ts`
3. `git commit -m "mensaje"`
4. Husky ejecuta el hook `app/.husky/pre-commit` y corre `npx lint-staged`.
5. lint‑staged aplica, SOLO sobre los archivos staged:
   - `eslint --fix` (intenta arreglar problemas de lint)
   - `prettier --write` (formatea el archivo)
6. Si alguno de estos cambios modifica los archivos staged, el commit puede pausarse para que revises, luego volves a `git add` y reintentás `git commit`.
7. commitlint está configurado y validará el formato del mensaje si el hook `commit-msg` está activo en tu entorno.

> Resultado: código formateado y chequeado automáticamente antes de que el commit quede en el historial.

---

## Comandos que podés usar (desde `app/`)
- `npm install` — instalar dependencias (primera vez).
- `npm run lint` — ejecutar ESLint sobre todo el proyecto.
- `npm run lint:fix` — ESLint con `--fix` para aplicar arreglos automáticos.
- `npm run format` — `prettier --write .` (formatea todo).
- `npm run format:check` — `prettier --check .` (verifica si hay archivos sin formatear).
- `npx lint-staged --debug` — debug de lint‑staged (si algo raro pasa).
- `npx husky install app/.husky` — instalar hooks Husky manualmente (ver sección de solución si algo falla).

---

## Casos de uso (ejemplos prácticos para junior)

Caso A — Cambios pequeños (ej: arreglar un typo)
1. Editás `app/src/controllers/ejemplo.ts`.
2. `git add app/src/controllers/ejemplo.ts`
3. `git commit -m "fix: corregir typo en controlador"`

Qué pasa: lint‑staged formatea y aplica fixes. Si todo está OK, el commit se completa.

Caso B — Cambios que generan correcciones automáticas (ej: ordenar imports o arreglar indentación)
1. Hacés cambios y `git add`.
2. Al `git commit`, Prettier y ESLint pueden modificar los archivos staged.
3. Revisás `git status` — verás archivos modificados por las herramientas.
4. Volvés a `git add` y `git commit` de nuevo.

Caso C — Mensaje de commit inválido (si commitlint está activo)
1. Intentás `git commit -m "arreglo"`.
2. El hook de `commit-msg` (si está instalado) puede rechazarlo y mostrar por qué no cumple la convención (ej.: falta tipo `feat:`, `fix:`, `chore:`).
3. Rehacés el commit con un mensaje válido, por ejemplo: `git commit -m "fix(auth): corregir token expirado"`.

---

## Qué NO tenés que hacer
- No tenés que ejecutar `eslint` o `prettier` antes de cada commit — el pre-commit lo hace.
- No tenés que instalar Husky manualmente en condiciones normales: al ejecutar `npm install` (en `app/`) el script `prepare` debería encargarse — aunque si algo falla, ver sección siguiente.

---

## Si algo no funciona (solución mínima y rápida)
1. Los hooks no corren cuando hacés `git commit`:
   - `cd app`
   - `npm install`
   - `npx husky install app/.husky`
   - Probar `git commit` de nuevo.

2. lint-staged no aplica nada:
   - Confirmá que hiciste `git add` antes del commit.
   - Ejecutá para ver detalles: `cd app && npx lint-staged --debug`.

3. Queres formatear todo manualmente:
   - `cd app && npm run format`

4. Querés comprobar lint en todo el proyecto:
   - `cd app && npm run lint`

---

## Recomendaciones prácticas (para principiantes)
- Trabajá normalmente: editar → `git add` → `git commit`. El resto es automático.
- Si el commit se queda en pausa por cambios hechos por Prettier/ESLint: revisá los cambios, `git add` y volvé a `git commit`.
- Usá mensajes de commit claros y, preferiblemente, con prefijo tipo `feat:`, `fix:` cuando aplique.

---

## Estado actual
- Husky: hook `pre-commit` presente y configurado para ejecutar `lint-staged`.
- lint-staged: configurado en `app/package.json` y listo.
- ESLint: configuración `app/eslint.config.mjs` presente.
- Prettier: configuración `app/.prettierrc` y `.prettierignore` presente.
- commitlint: configuración presente en `app/commitlint.config.cjs`. Si tenés el hook `commit-msg` instalado en tu entorno, validará mensajes automáticamente.

---

Si querés, puedo:
- Añadir una sección corta con ejemplos de mensajes aceptados por commitlint.
- Incluir un pequeño checklist para PRs (ej.: correr `npm run format`, `npm run lint`, `npm run test` antes de abrir PR).

---

_Creado automáticamente y agregado al repositorio para que cualquier dev junior pueda consultarlo rápidamente._
