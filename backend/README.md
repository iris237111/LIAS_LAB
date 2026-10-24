# LIAS Lab Manager — Backend Only Starter

This package contains only the Spring Boot backend and PostgreSQL setup for the LIAS laboratory management project.

It intentionally does **not** include:

- the final React frontend
- scraped website content
- public PDFs or images
- real LIAS members/publications/events/partners
- custom final design assets

It is a clean backend starter based on the project requirements: authentication, users, members, teams, mandates, events, publications, documents, material, meetings, conventions, notifications, messages, audit log and annual reports.

## Tech stack

- Java 17
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Apache PDFBox
- Docker Compose

## Run with Docker

From this folder:

```bash
docker compose up --build
```

Backend API:

```text
http://localhost:8080/api
```

Default technical account:

```text
Email: admin@lias.local
Password: Admin123!
Role: ADMIN
```

Change this password before any real use.

## Run manually

Start PostgreSQL, then:

```bash
cd backend
mvn spring-boot:run
```

Default DB values:

```text
Database: lias_lab
User: lias
Password: lias
```

## Main API groups

```text
/api/auth
/api/public
/api/admin
/api/members
/api/teams
/api/mandates
/api/team-chiefs
/api/roles-history
/api/membership-requests
/api/events
/api/publications
/api/documents
/api/material
/api/material-distributions
/api/material-requests
/api/meetings
/api/messages
/api/notifications
/api/conventions
/api/annual-reports
/api/settings
/api/dashboard
```

## Notes for frontend developers

A frontend can be built in React, Angular, Vue, Thymeleaf or JSP. Configure CORS in `.env` or `application.yml` so the backend accepts the frontend URL.

Use `/api/auth/login` to obtain the access token. Send it in requests as:

```text
Authorization: Bearer <token>
```

The refresh token is stored as an httpOnly cookie by the backend.

## Reset database

To delete local Docker data:

```bash
docker compose down -v
```

Then run again:

```bash
docker compose up --build
```
