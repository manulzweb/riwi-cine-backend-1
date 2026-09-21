<!-- Title & Cover -->
<h1 align="center">  
   Riwi CIne API  
</h1>

<!-- Badges -->
<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v20.11.30-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.4.5-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-v4.19.2-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v8.11.5-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Tests](https://img.shields.io/badge/Tests-Jest%20Configured-red?logo=jest)

</div>

---

##  Table of Contents

- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Key Features](#-key-features)
- [Documentation](#-documentation)
- [Installation](#-installation)
- [Docker](#-docker)
- [Contributors And Authors](#-contributors-and-authors)

---

## Project Description

**Riwi Cine API** is a **RESTful enterprise API** for managing a sports movies platform:  
products, orders, users, authentication, roles, and more.

Built with **Node.js**, **TypeScript**, and **PostgreSQL** under a modular and scalable architecture.  
Its goal is to serve as a reliable backend for web or mobile applications.

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

## Technologies Used

| Category           | Technologies            |
| ------------------ | ----------------------- |
| **Language**       | TypeScript              |
| **Runtime**        | Node.js                 |
| **Framework**      | Express                 |
| **Database**       | PostgreSQL + Sequelize  |
| **Authentication** | JWT + bcrypt            |
| **Documentation**  | Swagger / OpenAPI       |
| **Testing**        | Jest                    |
| **Containers**     | Docker / Docker Compose |

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

## Architecture

```
app/src/
├── controllers/   # HTTP request handlers
├── repositories/  # Data access layer
├── dto/           # Data validation objects
├── models/        # Database models
├── routes/        # API endpoints
├── services/      # Business logic
├── middleware/    # Custom middlewares
└── seeders/       # Database seeders
```

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

##  Key Features

- **Modular Architecture**: REPOSITORIES/DTO patterns with service layer
- **Security**: JWT authentication + RBAC authorization
- **Validation**: Automatic request validation with class-validator
- **Documentation**: Auto-generated Swagger docs
- **Database**: Automated migrations and seeders
- **Testing**: Jest configuration for unit tests

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

##  Documentation

- **Public Postman Documentation**: [MultiCine Riwi Backend API Docs](https://documenter.getpostman.com/view/57233881/2sBYB2q6qE)
- **Active Mock Server**: `https://c9ae4de7-f186-405e-a663-f9040d3c74a4.mock.pstmn.io`
- **Interactive Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI 3.0 Contract**: [`docs/openapi.json`](docs/openapi.json)
- **Postman Collection (v2.1)**: [`riwi_cine_api.postman_collection.json`](riwi_cine_api.postman_collection.json)
- **Postman Mock Environment**: [`riwi_cine_mock.postman_environment.json`](riwi_cine_mock.postman_environment.json)

Detailed technical specifications and business rules are also available in `/docs`:
- [HU-003: Cartelera Semanal](docs/HU-003-cartelera-semanal.md)
- [HU-007: Autenticación Segura](docs/HU-007-autenticacion-segura.md)
- [HU-008: Perfil y Membresía](docs/HU-008-perfil-beneficios-membresia.md)



<div align=right>

[Back to top](#-table-of-contents)

</div>

---

##  Installation

```bash
# Clone repository
git clone <repository-url>
cd workdir

# Install dependencies
cd app && npm install

# Configure environment
cp .env.example .env

# Start with Docker
docker-compose up -d

# Or start in development mode
npm run dev
```

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

##  Deploy all the project in Docker

### Linux/macOS
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

```

### Windows (Command Prompt)
```cmd
REM Start all services
docker-compose up -d

REM alternative
docker-compose up --build

REM View logs
docker-compose logs -f

REM Stop services
docker-compose down

```

### Windows (PowerShell)
```powershell
# Start all services
docker-compose up -d

# alternative
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

```

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

## 👥 Contributors And Authors

| Author          | Role               | Path |
| --------------- | ------------------ | ---- |
| **Riwi Coders** | Backend Developers | Node |

<div align=right>

[Back to top](#-table-of-contents)

</div>

---

<p align="center">
  Made with by <strong>Riwi Developers</strong> 
</p>
