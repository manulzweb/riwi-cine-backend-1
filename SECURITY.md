# Security Policy

## Supported Versions

The project is under active development. Only the latest version on the default branch receives security fixes.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| < latest | ❌       |

---

## Reporting a Vulnerability

We take the security of Riwi Cine API seriously. If you discover a security vulnerability, please **do not open a public issue**.

### How to report

1. Use GitHub's private vulnerability reporting:
   - Go to the repository → **Security** tab → **Report a vulnerability**.

### What to include

- A clear description of the vulnerability and its impact.
- Step-by-step instructions or a proof of concept to reproduce it.
- Affected endpoints, files, or dependencies.
- Any potential mitigations you have identified.

### What to expect

- **Acknowledgment** within 48 hours.
- An initial assessment and estimated fix timeline within 7 days.
- Credit given to reporters in the release notes (unless anonymity is requested).

Please allow a reasonable time for a fix before any public disclosure.

---

## Security Scope

Areas of particular interest in this project:

- JWT access/refresh token handling and rotation (`auth-token.service.ts`)
- Password hashing and validation (`password.service.ts`, `utils/password.util.ts`)
- Email verification and password reset token flows
- CAPTCHA verification (`services/captcha/`)
- SQL injection via Sequelize queries
- Secrets leaked through logs, responses, or the repository

---

## General Recommendations for Deployments

- Never commit `.env` files or secrets.
- Rotate `JWT_SECRET` and database credentials if they are ever exposed.
- Keep dependencies up to date (`npm audit` / Dependabot).
