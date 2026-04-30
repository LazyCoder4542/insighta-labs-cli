# insighta

> CLI for the Insighta Labs+ API — enrich any name with predicted gender, age, and nationality. Search profiles in plain English. Export to CSV. Fully authenticated via GitHub OAuth.

[![CI](https://github.com/<your-org>/learning-commander/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-org>/learning-commander/actions/workflows/ci.yml)

---

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment setup](#environment-setup)
- [Usage](#usage)
  - [Auth](#auth)
  - [Profiles](#profiles)
- [Filters reference](#filters-reference)
- [Development](#development)
- [How auth works](#how-auth-works)

---

## Requirements

- Node.js 20+
- npm

---

## Installation

```bash
# 1. Clone
git clone <repo-url>
cd learning-commander

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Install globally
npm install -g .
```

The `insighta` command is now available from any directory.

---

## Environment setup

Create a `.env` file in the project root:

```env
INSIGHTA_API_URL=http://localhost:3000
GITHUB_OAUTH_CLIENTID=your_github_oauth_app_client_id
```

| Variable | Required | Description |
|---|---|---|
| `INSIGHTA_API_URL` | No | API base URL. Defaults to `http://localhost:3000` |
| `GITHUB_OAUTH_CLIENTID` | Yes | GitHub OAuth App client ID |

Credentials (access + refresh tokens) are stored at `~/.insighta/credentials.json` after login.

---

## Usage

### Auth

```bash
# Log in via GitHub OAuth — opens browser, captures callback automatically
insighta login

# Show the currently authenticated user
insighta whoami

# Log out and revoke tokens
insighta logout
```

### Profiles

```bash
# List all profiles
insighta profiles list

# Filter by gender
insighta profiles list --gender male

# Filter by country and age group
insighta profiles list --country NG --age-group adult

# Filter by age range
insighta profiles list --min-age 25 --max-age 40

# Sort and paginate
insighta profiles list --sort-by age --order desc --page 2 --limit 20

# Get a single profile by UUID
insighta profiles get <id>

# Natural-language search
insighta profiles search "young males from nigeria"

# Create a profile  (Admin only)
insighta profiles create --name "Harriet Tubman"

# Export to CSV — saved to the current working directory
insighta profiles export --format csv

# Export with filters
insighta profiles export --format csv --gender male --country NG
```

---

## Filters reference

Applies to `profiles list` and `profiles export`.

| Flag | Values | Description |
|---|---|---|
| `--gender` | `male` \| `female` | Predicted gender |
| `--country` | ISO 3166-1 alpha-2 (e.g. `NG`) | Predicted nationality |
| `--age-group` | `child` \| `teenager` \| `adult` \| `senior` | Predicted age group |
| `--min-age` | number | Minimum predicted age (inclusive) |
| `--max-age` | number | Maximum predicted age (inclusive) |
| `--sort-by` | `age` \| `created_at` \| `gender_probability` | Sort field |
| `--order` | `asc` \| `desc` | Sort direction |
| `--page` | number | Page number (1-indexed) |
| `--limit` | number (max 50) | Results per page |

---

## Development

Run commands directly from the compiled output without a global install:

```bash
npm run build
node dist/main.js login
node dist/main.js profiles list --gender female
node dist/main.js profiles search "young nigerians"
```

Watch mode (rebuilds on file change):

```bash
npm run cli:dev
```

Lint:

```bash
npm run lint
```

---

## How auth works

`insighta login` implements the **OAuth 2.0 PKCE** flow:

1. Generates a `state`, `code_verifier`, and `code_challenge` (SHA-256)
2. Starts a temporary HTTP server on `localhost:9004`
3. Opens `https://github.com/login/oauth/authorize` in the browser with `redirect_uri` pointing to the API callback
4. GitHub redirects to the API callback → API forwards the code to `localhost:9004`
5. CLI validates `state`, then calls the API to exchange the code + `code_verifier` for tokens
6. Tokens are saved to `~/.insighta/credentials.json` and the process exits

Every subsequent request automatically attaches the access token. On a `401` the CLI silently refreshes the token and retries once — if the refresh also fails, it prompts you to run `insighta login` again.
