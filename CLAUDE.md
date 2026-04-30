CLI Application
You must build a CLI tool that interacts with the APIs.

Installation Requirement
The CLI must be installable and usable globally.
After installation:
insighta login

must work from any directory.

Commands
Auth
insighta login
insighta logout
insighta whoami

Profiles
insighta profiles list
insighta profiles list --gender male
insighta profiles list --country NG --age-group adult
insighta profiles list --min-age 25 --max-age 40
insighta profiles list --sort-by age --order desc
insighta profiles list --page 2 --limit 20

insighta profiles get <id>

insighta profiles search "young males from nigeria"

insighta profiles create --name "Harriet Tubman"

insighta profiles export --format csv
insighta profiles export --format csv --gender male --country NG


CLI Expectations
Uses authentication tokens on every request
Stores credentials at ~/.insighta/credentials.json
Handles token expiry — auto-refresh if possible, prompt re-login if not
Displays results as a structured table with a loader while fetching
Provides feedback during operations (loading states)
Handles errors clearly
Saves exported CSV to the current working directory


API docs
{
  "openapi": "3.0.0",
  "paths": {
    "/api": {
      "get": {
        "description": "Returns a hello world message.",
        "operationId": "AppController_getHello",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Service is running.",
            "content": {
              "application/json": {
                "schema": {
                  "example": "Hello World!"
                }
              }
            }
          }
        },
        "summary": "Health check",
        "tags": [
          "Classification"
        ]
      }
    },
    "/api/profiles": {
      "post": {
        "description": "Creates a new profile by predicting gender, age, and nationality from the given name via external APIs. Requires Admin role.",
        "operationId": "ProfileController_create",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateProfileDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Profile already existed — returned wrapped under data with a message.\n\nNew profile created — profile fields are spread at the root.",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "properties": {
                        "status": {
                          "type": "string",
                          "example": "success"
                        }
                      }
                    },
                    {
                      "$ref": "#/components/schemas/ProfileEntity"
                    }
                  ]
                }
              }
            }
          },
          "400": {
            "description": "Invalid name or no prediction available for the provided name."
          },
          "403": {
            "description": "Forbidden — Admin role required."
          },
          "502": {
            "description": "An upstream API (Genderize / Agify / Nationalize) returned an error."
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Create a profile (Admin only)",
        "tags": [
          "Profiles"
        ]
      },
      "get": {
        "description": "Returns paginated profiles with optional filters for gender, age, country, and gender/country probability. Response includes pagination links (self, next, prev).",
        "operationId": "ProfileController_findAll",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          },
          {
            "name": "gender",
            "required": false,
            "in": "query",
            "schema": {
              "example": "male",
              "type": "string",
              "enum": [
                "male",
                "female"
              ]
            }
          },
          {
            "name": "age_group",
            "required": false,
            "in": "query",
            "schema": {
              "example": "adult",
              "type": "string",
              "enum": [
                "child",
                "teenager",
                "adult",
                "senior"
              ]
            }
          },
          {
            "name": "country_id",
            "required": false,
            "in": "query",
            "description": "ISO 3166-1 alpha-2 country code",
            "schema": {
              "example": "NG",
              "type": "string"
            }
          },
          {
            "name": "min_age",
            "required": false,
            "in": "query",
            "description": "Minimum predicted age (inclusive)",
            "schema": {
              "example": 16,
              "type": "number"
            }
          },
          {
            "name": "max_age",
            "required": false,
            "in": "query",
            "description": "Maximum predicted age (inclusive)",
            "schema": {
              "example": 24,
              "type": "number"
            }
          },
          {
            "name": "min_gender_probability",
            "required": false,
            "in": "query",
            "description": "Minimum gender prediction confidence (0–1)",
            "schema": {
              "example": 0.8,
              "type": "number"
            }
          },
          {
            "name": "min_country_probability",
            "required": false,
            "in": "query",
            "description": "Minimum country prediction confidence (0–1)",
            "schema": {
              "example": 0.8,
              "type": "number"
            }
          },
          {
            "name": "sort_by",
            "required": false,
            "in": "query",
            "description": "Field to sort results by",
            "schema": {
              "example": "age",
              "type": "string",
              "enum": [
                "age",
                "created_at",
                "gender_probability"
              ]
            }
          },
          {
            "name": "order",
            "required": false,
            "in": "query",
            "description": "Sort direction",
            "schema": {
              "example": "desc",
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "description": "Page number (1-indexed)",
            "schema": {
              "example": 1,
              "type": "number"
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "description": "Results per page (max 50)",
            "schema": {
              "example": 10,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Profiles retrieved successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "success"
                    },
                    "page": {
                      "type": "number",
                      "example": 1
                    },
                    "limit": {
                      "type": "number",
                      "example": 10
                    },
                    "total": {
                      "type": "number",
                      "example": 100
                    },
                    "total_pages": {
                      "type": "number",
                      "example": 10
                    },
                    "links": {
                      "type": "object",
                      "properties": {
                        "self": {
                          "type": "string",
                          "example": "/profiles?page=1"
                        },
                        "next": {
                          "type": "string",
                          "nullable": true,
                          "example": "/profiles?page=2"
                        },
                        "prev": {
                          "type": "string",
                          "nullable": true,
                          "example": null
                        }
                      }
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/ProfileEntity"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Get all profiles",
        "tags": [
          "Profiles"
        ]
      }
    },
    "/api/profiles/search": {
      "get": {
        "description": "Parses a natural-language query (e.g. \"young males from nigeria\") and returns matching profiles.",
        "operationId": "ProfileController_search",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          },
          {
            "name": "q",
            "required": true,
            "in": "query",
            "description": "Natural-language search string",
            "schema": {
              "example": "young males from nigeria",
              "type": "string"
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "schema": {
              "example": 1,
              "type": "number"
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "description": "Results per page (max 50)",
            "schema": {
              "example": 10,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Matching profiles returned.",
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "success"
                    },
                    "page": {
                      "type": "number",
                      "example": 1
                    },
                    "limit": {
                      "type": "number",
                      "example": 10
                    },
                    "total": {
                      "type": "number",
                      "example": 100
                    },
                    "total_pages": {
                      "type": "number",
                      "example": 10
                    },
                    "links": {
                      "type": "object",
                      "properties": {
                        "self": {
                          "type": "string",
                          "example": "/profiles/search?q=young+males&page=1"
                        },
                        "next": {
                          "type": "string",
                          "nullable": true,
                          "example": "/profiles/search?q=young+males&page=2"
                        },
                        "prev": {
                          "type": "string",
                          "nullable": true,
                          "example": null
                        }
                      }
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/ProfileEntity"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Query could not be interpreted."
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Natural-language profile search",
        "tags": [
          "Profiles"
        ]
      }
    },
    "/api/profiles/export": {
      "get": {
        "description": "Applies the same filters as GET /profiles. Returns a CSV file with all matching profiles.",
        "operationId": "ProfileController_exportCsv",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          },
          {
            "name": "format",
            "required": true,
            "in": "query",
            "schema": {
              "default": "csv"
            },
            "description": "Must be csv"
          },
          {
            "name": "gender",
            "required": false,
            "in": "query",
            "schema": {
              "example": "male",
              "type": "string",
              "enum": [
                "male",
                "female"
              ]
            }
          },
          {
            "name": "age_group",
            "required": false,
            "in": "query",
            "schema": {
              "example": "adult",
              "type": "string",
              "enum": [
                "child",
                "teenager",
                "adult",
                "senior"
              ]
            }
          },
          {
            "name": "country_id",
            "required": false,
            "in": "query",
            "description": "ISO 3166-1 alpha-2 country code",
            "schema": {
              "example": "NG",
              "type": "string"
            }
          },
          {
            "name": "min_age",
            "required": false,
            "in": "query",
            "description": "Minimum predicted age (inclusive)",
            "schema": {
              "example": 16,
              "type": "number"
            }
          },
          {
            "name": "max_age",
            "required": false,
            "in": "query",
            "description": "Maximum predicted age (inclusive)",
            "schema": {
              "example": 24,
              "type": "number"
            }
          },
          {
            "name": "min_gender_probability",
            "required": false,
            "in": "query",
            "description": "Minimum gender prediction confidence (0–1)",
            "schema": {
              "example": 0.8,
              "type": "number"
            }
          },
          {
            "name": "min_country_probability",
            "required": false,
            "in": "query",
            "description": "Minimum country prediction confidence (0–1)",
            "schema": {
              "example": 0.8,
              "type": "number"
            }
          },
          {
            "name": "sort_by",
            "required": false,
            "in": "query",
            "description": "Field to sort results by",
            "schema": {
              "example": "age",
              "type": "string",
              "enum": [
                "age",
                "created_at",
                "gender_probability"
              ]
            }
          },
          {
            "name": "order",
            "required": false,
            "in": "query",
            "description": "Sort direction",
            "schema": {
              "example": "desc",
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          },
          {
            "name": "page",
            "required": false,
            "in": "query",
            "description": "Page number (1-indexed)",
            "schema": {
              "example": 1,
              "type": "number"
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "description": "Results per page (max 50)",
            "schema": {
              "example": 10,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "CSV file. Content-Type: text/csv, Content-Disposition: attachment."
          },
          "400": {
            "description": "Unsupported format."
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Export profiles as CSV",
        "tags": [
          "Profiles"
        ]
      }
    },
    "/api/profiles/{id}": {
      "get": {
        "operationId": "ProfileController_findOne",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          },
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "UUID of the profile",
            "schema": {
              "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Profile retrieved successfully — fields spread at the root.",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "properties": {
                        "status": {
                          "type": "string",
                          "example": "success"
                        }
                      }
                    },
                    {
                      "$ref": "#/components/schemas/ProfileEntity"
                    }
                  ]
                }
              }
            }
          },
          "400": {
            "description": "Profile does not exist."
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Get a profile by ID",
        "tags": [
          "Profiles"
        ]
      },
      "delete": {
        "operationId": "ProfileController_remove",
        "parameters": [
          {
            "name": "X-API-Version",
            "in": "header",
            "description": "Must be 1",
            "required": true,
            "schema": {
              "type": "string",
              "default": "1"
            }
          },
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "UUID of the profile",
            "schema": {
              "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Profile deleted successfully."
          },
          "400": {
            "description": "Profile does not exist."
          },
          "403": {
            "description": "Forbidden — Admin role required."
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Delete a profile by ID",
        "tags": [
          "Profiles"
        ]
      }
    },
    "/api/auth/github": {
      "get": {
        "description": "Redirects the browser to GitHub's authorization page. Pass `is_cli=true` for CLI flow.",
        "operationId": "AuthController_githubRedirect",
        "parameters": [
          {
            "name": "is_cli",
            "required": false,
            "in": "query",
            "description": "Set true for CLI flow",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "302": {
            "description": "Redirect to GitHub OAuth"
          }
        },
        "summary": "Initiate GitHub OAuth",
        "tags": [
          "Auth"
        ]
      }
    },
    "/api/auth/github/callback": {
      "get": {
        "description": "GitHub redirects here after authorization. Routes to CLI local server if `is_cli=true`, otherwise redirects to the frontend callback URL.",
        "operationId": "AuthController_githubCallback",
        "parameters": [],
        "responses": {
          "302": {
            "description": "Redirect to frontend or CLI local server with code"
          }
        },
        "summary": "GitHub OAuth callback",
        "tags": [
          "Auth"
        ]
      }
    },
    "/api/auth/github/exchange": {
      "get": {
        "description": "Exchanges the GitHub authorization code for access and refresh tokens. CLI requests must include `code_verifier` and `is_cli=true` for PKCE verification.",
        "operationId": "AuthController_githubExchange",
        "parameters": [
          {
            "name": "state",
            "required": false,
            "in": "query",
            "description": "OAuth state (required if is_cli=true for PKCE)",
            "schema": {}
          },
          {
            "name": "code_verifier",
            "required": false,
            "in": "query",
            "description": "PKCE code verifier (required if is_cli=true)",
            "schema": {}
          },
          {
            "name": "is_cli",
            "required": false,
            "in": "query",
            "description": "Set true for CLI flow (enables PKCE)",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "code",
            "required": true,
            "in": "query",
            "description": "GitHub authorization code",
            "schema": {}
          }
        ],
        "responses": {
          "200": {
            "description": "Returns access_token and refresh_token"
          },
          "401": {
            "description": "Invalid or expired GitHub code"
          }
        },
        "summary": "Exchange GitHub code for JWT tokens",
        "tags": [
          "Auth"
        ]
      }
    },
    "/api/auth/refresh": {
      "post": {
        "description": "Issues a new access and refresh token pair. Invalidates the old refresh token.",
        "operationId": "AuthController_refreshToken",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "properties": {
                  "refresh_token": {
                    "type": "string"
                  }
                },
                "required": [
                  "refresh_token"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "New access_token and refresh_token"
          },
          "401": {
            "description": "The refresh token is invalid, expired, or revoked"
          }
        },
        "summary": "Refresh access token",
        "tags": [
          "Auth"
        ]
      }
    },
    "/api/auth/logout": {
      "post": {
        "description": "Revokes the refresh token. The access token remains valid until it expires.",
        "operationId": "AuthController_logout",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Logged out successfully"
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Logout",
        "tags": [
          "Auth"
        ]
      }
    },
    "/api/users/me": {
      "get": {
        "description": "Returns the authenticated user's profile.",
        "operationId": "UserController_getMe",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Current user profile"
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "access-token": []
          }
        ],
        "summary": "Get current user",
        "tags": [
          "Users"
        ]
      }
    }
  },
  "info": {
    "title": "HNG Stage 3 — Insighta Labs+: Secure Access & Multi-Interface Integration",
    "description": "Enriches a name with predicted gender, age, and nationality by querying Genderize.io, Agify.io, and Nationalize.io, persists the result in PostgreSQL, and exposes a natural-language search interface over the stored profiles. Authentication is via GitHub OAuth. All profile endpoints require the X-API-Version: 1 header.",
    "version": "2.0",
    "contact": {}
  },
  "tags": [],
  "servers": [],
  "components": {
    "securitySchemes": {
      "access-token": {
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "type": "http"
      }
    },
    "schemas": {
      "ProfileEntity": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
          },
          "name": {
            "type": "string",
            "example": "Adeola"
          },
          "gender": {
            "type": "string",
            "enum": [
              "male",
              "female"
            ],
            "example": "male"
          },
          "gender_probability": {
            "type": "number",
            "example": 0.7,
            "description": "Probability of the predicted gender (0-1)"
          },
          "sample_size": {
            "type": "number",
            "example": 10195,
            "description": "Number of records used for the gender prediction"
          },
          "age": {
            "type": "number",
            "example": 28,
            "description": "Predicted age"
          },
          "age_group": {
            "type": "string",
            "enum": [
              "child",
              "teenager",
              "adult",
              "senior"
            ],
            "example": "adult"
          },
          "country_id": {
            "type": "string",
            "example": "NG",
            "description": "ISO 3166-1 alpha-2 country code"
          },
          "country_name": {
            "type": "string",
            "example": "Nigeria",
            "description": "Full country name resolved from country_id"
          },
          "country_probability": {
            "type": "number",
            "example": 0.4,
            "description": "Probability of the predicted country (0-1)"
          },
          "created_at": {
            "format": "date-time",
            "type": "string",
            "example": "2026-04-17T19:22:00.473Z"
          }
        },
        "required": [
          "id",
          "name",
          "gender",
          "gender_probability",
          "sample_size",
          "age",
          "age_group",
          "country_id",
          "country_name",
          "country_probability",
          "created_at"
        ]
      },
      "CreateProfileDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "example": "Adeola"
          }
        },
        "required": [
          "name"
        ]
      }
    }
  }
}

Auth
CLI opens GitHub OAuth URL in browser with is_cli=true in state
GitHub redirects to /auth/github/callback?code=...&state=...
/auth/github/callback sees is_cli=true → forwards code to CLI local server (http://localhost:PORT?code=...)
CLI exchanges the code separately

Expected behavior:
User runs:
insighta login
CLI:
Generates:
state (request validation)
code_verifier (PKCE secret)
code_challenge (derived value)
Starts a temporary local callback server
Opens the GitHub OAuth page in the browser
User authenticates via GitHub
GitHub redirects to api/auth/github/callback and that redirects to:
http://<server>:<port>/callback
PORT is 9004
CLI:
Captures the callback
Validates the state
Sends code + code_verifier to your backend
Backend:
Exchanges the code with GitHub
Retrieves user information
Creates or updates the user


NOTE
Global install via npm (npm install -g) with a bin entry in package.json
Auth flow — insighta login triggers the GitHub OAuth PKCE flow (opens browser, starts local server, exchanges code)
Credentials stored at ~/.insighta/credentials.json (access token + refresh token)
Auto-refresh on every request — if 401, try refresh, retry once, then prompt re-login
All requests need Authorization: Bearer <token> and X-API-Version: 1 headers
Table output with a loader/spinner while fetching
CSV export saves to process.cwd()
Commands map directly to existing API endpoints