# Contributing to Riwi Cine API

First off, thank you for considering contributing! This document describes how to set up the project, our conventions, and the process for submitting changes.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs and Suggesting Features](#reporting-bugs-and-suggesting-features)

---

## Getting Started

1. **Fork** the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/riwi-cine-backend-1.git
   cd riwi-cine-backend-1
   ```

2. **Install dependencies** (the app lives inside `app/`):

   ```bash
   cd app
   npm install
   ```

   Husky hooks and Commitlint are installed automatically via the `prepare` script.

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Fill in the required values
   ```

4. **Start the development environment:**

   ```bash
   # From the repository root, with Docker
   docker-compose up -d

   # Or run only the API locally
   cd app && npm run dev
   ```

---

## Project Structure

All application code lives under `app/src/`, organized in layers:

```
app/src/
├── controllers/   # HTTP request handlers
├── services/      # Business logic
├── repositories/  # Data access layer (only place touching Sequelize)
├── models/        # Sequelize models
├── dto/           # Request/response data transfer objects
├── routes/        # Express routers
├── middleware/    # Custom middlewares
├── errors/        # Domain errors
└── utils/         # Shared helpers
```

Keep responsibilities separated.

---

## Branching Strategy

Create descriptive branches from the latest default branch:

| Type     | Pattern                  | Example                          |
| -------- | ------------------------ | -------------------------------- |
| Feature  | `feature/<short-name>`   | `feature/movie-filters`          |
| Bug fix  | `fix/<short-name>`       | `fix/login-lockout`              |
| Docs     | `docs/<short-name>`      | `docs/contributing-guide`        |
| Refactor | `refactor/<short-name>`  | `refactor/email-token-model`     |

---

## Commit Conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via **Commitlint** (a Husky hook will reject non-compliant messages):

```
<type>(<optional scope>): <description>
```

Allowed types include:

| Type       | Use for                                    |
| ---------- | ------------------------------------------ |
| `feat`     | New functionality                           |
| `fix`      | Bug fixes                                   |
| `docs`     | Documentation only                          |
| `style`    | Formatting, no logic change                 |
| `refactor` | Code change neither fixing nor adding       |
| `test`     | Adding or correcting tests                  |
| `chore`    | Tooling, dependencies, CI                   |

Examples:

```
feat(auth): add refresh token rotation
fix(membership): prevent duplicate membership creation
docs(readme): update installation steps
```

---

## Code Style

Formatting and linting are automated with **ESLint**, **Prettier**, and **lint-staged**:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix auto-fixable issues
npm run format      # Format all files
```

Lint-staged runs automatically on every commit, so staged files are always formatted and linted.

Additional conventions:

- Comments and JSDoc are written in **Spanish**.
- Every file starts with a route comment, e.g. `// app/src/services/auth.service.ts`.
- Services and controllers use exhaustive JSDoc blocks (see `auth.service.ts` as reference).

---

## Testing

Run the test suite before pushing:

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage
```

Tests live next to the source in `app/src/__tests__/`. If you add or modify functionality, add or update the corresponding tests.

---

## Submitting a Pull Request

1. Make sure your branch is up to date with the default branch.
2. Verify that lint and tests pass locally.
3. Push your branch and open a Pull Request using the [pull request template](.github/pull_request_template.md).
4. Link any related issues (`Closes #123`).
5. Wait for review. A CODEOWNERS-assigned reviewer will be requested automatically.

---

## Reporting Bugs and Suggesting Features

Please use the GitHub issue templates:

- 🐛 [Bug report](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Feature request](.github/ISSUE_TEMPLATE/feature_request.md)

For security vulnerabilities, do **not** open a public issue. Follow the instructions in [SECURITY.md](SECURITY.md).

---

<p align="center">Thanks for contributing!</p>
