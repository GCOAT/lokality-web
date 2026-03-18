# Lokality Web

> Landing page and backend for [Lokality](https://lokality.co) — a location-based digital archive and interactive tour guide platform.

Lokality enables users to explore destinations through curated tours, historical archives, and educational content. It combines real-world navigation, multimedia storytelling, and gamified learning to create immersive destination experiences — preserving and sharing the cultural heritage, history, and stories of the places that matter most.

Based in **St. Croix, USVI**.

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS (GitHub Pages)
- **Backend:** Python 3.13 Lambda · API Gateway HTTP API · DynamoDB · S3 · SES

---

## Local Development

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| AWS CLI | 2.x |
| AWS SAM CLI | 1.x |
| Python | 3.13+ |
| Docker | 20+ |

### Backend (SAM Local)

```bash
cd backend/local
./up.sh          # Start DynamoDB Local (Docker)
./run-api.sh     # Start SAM Local API
```

### Tests

```bash
cd backend
pip3 install -r requirements-test.txt
python3 -m pytest tests/ -v
```

---

## License

See [LICENSE](LICENSE).

## Testing

```bash
pip install -r backend/requirements-test.txt   # pytest + pytest-cov
python3 -m pytest backend/tests/ -v --cov=backend.src --cov-report=term-missing
```

Target: **80% coverage minimum**. All AWS calls are mocked — no credentials or network needed.

---

## Documentation

Full standards and runbooks live in `docs/`:

- [What We're Building](docs/kore-what-we-are-building.md) — vision & architecture
- [Folder Structure](docs/kore-architecture-folder-structure.md) — file placement rules
- [Naming Conventions](docs/kore-standards-naming.md) — identifiers, files, resources
- [Backend Standards](docs/kore-standards-backend.md) — Python, SAM, API patterns
- [Frontend Standards](docs/kore-standards-frontend.md) — HTML, CSS, JS, accessibility
- [Security Tier 1](docs/kore-standards-security-tier1.md) — auth, validation, CORS
- [Local Dev Runbook](docs/kore-runbook-local-dev.md) — setup & troubleshooting
- [Deploy Runbook](docs/kore-runbook-deploy.md) — deployment workflow

For AI coding assistants, see [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md).

---

## License

[MIT](LICENSE)
