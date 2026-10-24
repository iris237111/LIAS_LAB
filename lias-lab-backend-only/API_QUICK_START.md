# API Quick Start

## 1. Login

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lias.local","password":"Admin123!"}'
```

Copy the `accessToken` from the JSON response.

## 2. Call a protected endpoint

```bash
TOKEN="paste_access_token_here"

curl http://localhost:8080/api/teams \
  -H "Authorization: Bearer $TOKEN"
```

## 3. Create sample data manually

The backend is delivered without real data. Add data through API calls or through the frontend your team builds.

Example team:

```bash
curl -X POST http://localhost:8080/api/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Equipe 1","description":"Description de test"}'
```
