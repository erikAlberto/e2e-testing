# E2E Framework — Local Env & CI Secrets

This repository supports local `.env` files for development and GitHub Secrets for CI.

Local setup
- Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

- Edit `.env` and set `BASE_URL`, `TEST_USER`, and `TEST_PASSWORD` as needed.

Running locally
- Install deps:

```bash
npm install
```

- Run tests:

```bash
npm run test
```

CI / GitHub Actions
- Add these repository `Secrets` in GitHub Settings → Secrets:
  - `BASE_URL`
  - `TEST_USER`
  - `TEST_PASSWORD`

