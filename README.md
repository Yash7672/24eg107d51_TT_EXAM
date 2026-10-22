# 24eg107d51_TT_EXAM — Full Stack Development Lab Exam Starter

Reusable starter for the **B.Tech Full Stack Development lab external examination**.

During the exam you receive two problem statements, pick one, and build a small CRUD
application on top of this starter. Everything that is *not* part of the problem
(React + Vite setup, Spring Boot setup, database connection, Axios client, deployment)
is already prepared here, so you only write the code that the question asks for.

> **Notation used in this README**
> `<like_this>` = a **placeholder**. Replace it with a real value before deploying.
> Real secrets (database password) are **never** written in this file or in the code.

### Current deployment of this repository

| Part              | Value                                                            | State |
| ----------------- | ---------------------------------------------------------------- | ----- |
| GitHub repository | `https://github.com/Yash7672/24eg107d51_TT_EXAM` (branch `main`)  | connected |
| Backend on Render | `https://lab-exam-backend-yhmk.onrender.com`                      | live |
| Frontend on Netlify | `https://24eg107d51ttexamm.netlify.app`                         | live |
| Database on Aiven | `mysql-6f49d52-ttexam.c.aivencloud.com:23292/defaultdb`          | running |
| Aiven CA certificate | `backend/certs/ca.crt` (public, committed)                    | installed |

The database password lives **only** in the Render environment variables — it is never
written into this repository.

---

## 1. Technology stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Frontend  | React 19 + Vite (JavaScript, not TypeScript)         |
| Backend   | Java 17 + Spring Boot 3.5 + Maven                    |
| Database  | MySQL 8 on Aiven                                    |
| API       | REST (GET / POST / PUT / DELETE) with Axios          |
| Backend hosting | Render (Docker runtime)                     |
| Frontend hosting | Netlify                                  |
| Version control | GitHub, branch `main`                      |

---

## 2. Project structure

```
24eg107d51_TT_EXAM/
├── backend/                                   # Spring Boot API
│   ├── Dockerfile                             # multi stage build (Maven -> JRE 17)
│   ├── .dockerignore
│   ├── .env.example                          # placeholders for the backend variables
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd                       # Maven Wrapper (no Maven install needed)
│   ├── .mvn/wrapper/maven-wrapper.properties
│   ├── certs/
│   │   ├── README.md                          # how to add the Aiven CA certificate
│   │   └── ca.crt                             # Aiven project CA certificate (public)
│   ├── src/main/
│   │   ├── java/com/labexam/app/
│   │   │   ├── LabExamApplication.java        # entry point
│   │   │   ├── config/CorsConfig.java         # CORS for the frontend origin
│   │   │   ├── controller/HealthController.java
│   │   │   ├── dto/                           # request/response objects
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   └── HealthResponse.java
│   │   │   ├── entity/                        # <- your JPA entities go here
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── SafeMessage.java
│   │   │   ├── repository/                    # <- your Spring Data repositories go here
│   │   │   └── service/HealthService.java
│   │   └── resources/
│   │       ├── application.properties         # main configuration (env variables)
│   │       └── application-local.properties   # local development profile
│   └── src/test/                              # automatic test of the health endpoint
│       ├── java/com/labexam/app/HealthControllerTest.java
│       └── resources/application.properties   # uses an in-memory H2 database
├── frontend/                                  # React application
│   ├── public/
│   │   ├── _redirects                         # Netlify SPA fallback
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/api.js                         # Axios client (reads VITE_API_BASE_URL)
│   │   ├── components/                        # small reusable components
│   │   │   ├── BackendStatus.jsx
│   │   │   ├── ConnectionCard.jsx             # one card of the status dashboard
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx                       # welcome page + backend status
│   │   │   ├── NotFound.jsx
│   │   │   └── StatusDashboard.jsx            # connection status dashboard
│   │   ├── App.jsx                            # routes
│   │   ├── main.jsx                           # React root
│   │   └── index.css                          # plain CSS, no framework
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .dockerignore
├── .gitignore
├── netlify.toml
└── README.md
```

---

## 3. Required software

| Software                | Version           | Check with              |
| ----------------------- | ----------------- | ----------------------- |
| Node.js                 | 20.19+ or 22.12+  | `node -v`               |
| npm                     | 10+               | `npm -v`                |
| Java (JDK)              | 17                | `java -version`         |
| Maven                   | 3.9+ *(optional)*  | `mvn -v`                |
| Docker Desktop          | any recent        | `docker -v`             |
| Git                     | any               | `git -v`                |
| Aiven account           | free tier is fine | -                       |

> Maven is optional: the project contains the **Maven Wrapper** (`backend/mvnw` and
> `backend/mvnw.cmd`). Use `./mvnw clean package` (Windows: `mvnw.cmd clean package`)
> and it downloads the right Maven version by itself.

> The backend compiles with `--release 17`, so a newer JDK (21/25) can also be used
> locally — the produced jar still runs on Java 17.

---

## 4. Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The page shows the title, the backend connection badge and
the welcome text.

To use your own backend address, create a local env file first:

```bash
cd frontend
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Then edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Production build (this is what Netlify runs):

```bash
cd frontend
npm run build       # output goes to frontend/dist
npm run preview     # optional: serve the production build locally
```

---

## 5. Run the backend locally

### 5.1 Without a database (to check that the app starts)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile does not create tables and does not fail when no MySQL is running.
`GET /api/health` then answers with `"database": "DOWN"` — that is expected.

### 5.2 With your Aiven database

Set the environment variables, then start the app. The four variables below are
enough in production (the truststore path is already the default inside the Docker
image):

```bash
# PowerShell example
$env:SPRING_DATASOURCE_URL       = "jdbc:mysql://<aiven-host>:<aiven-port>/<database>?serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME  = "<aiven-username>"
$env:SPRING_DATASOURCE_PASSWORD  = "<aiven-password>"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "update"

cd backend
mvn spring-boot:run
```

```bash
# macOS / Linux example
export SPRING_DATASOURCE_URL='jdbc:mysql://<aiven-host>:<aiven-port>/<database>?serverTimezone=UTC&allowPublicKeyRetrieval=true'
export SPRING_DATASOURCE_USERNAME='<aiven-username>'
export SPRING_DATASOURCE_PASSWORD='<aiven-password>'
export SPRING_JPA_HIBERNATE_DDL_AUTO='update'

cd backend
mvn spring-boot:run
```

When you run the backend **outside Docker** and want to reach Aiven, add the
truststore of section 7 as well:

```bash
export SPRING_DATASOURCE_TRUSTSTORE_URL="file:/<absolute-path>/truststore.p12"
export SPRING_DATASOURCE_TRUSTSTORE_TYPE=PKCS12
export SPRING_DATASOURCE_TRUSTSTORE_PASSWORD=changeit
```

> Every `mvn` command below can be replaced with the Maven Wrapper:
> `./mvnw` (macOS/Linux) or `mvnw.cmd` (Windows). It downloads Maven by itself.
>
> Do not combine the `local` profile with Aiven without also setting
> `SPRING_DATASOURCE_SSL_MODE=VERIFY_IDENTITY` — the `local` profile switches the
> certificate check off, because a local MySQL has no Aiven certificate.

Build a jar instead of running:

```bash
cd backend
mvn clean package
java -jar target/lab-exam-backend-0.0.1-SNAPSHOT.jar
```

---

## 6. Environment variables

### 6.1 Frontend (`.env` in `frontend/`, build time, public!)

| Variable            | Meaning                              | Local value            |
| ------------------- | ------------------------------------ | ---------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend API          | `http://localhost:8080` |

Production value (the value that is set in Netlify for this repository):

```
VITE_API_BASE_URL=https://lab-exam-backend-yhmk.onrender.com
```

> The value is **baked into the JavaScript bundle at build time**. A change in Netlify
> only takes effect after a new build. A local `frontend/.env` never influences Netlify.
>
> Only variables starting with `VITE_` reach the browser. **Never** put the database
> password here — everything in the browser is readable by the user.

### 6.2 Backend (runtime, secret)

| Variable                             | Meaning                                                | Example / placeholder                       |
| ------------------------------------ | ------------------------------------------------------ | ------------------------------------------- |
| `SPRING_DATASOURCE_URL`              | JDBC URL of the Aiven MySQL service                    | see section 7                               |
| `SPRING_DATASOURCE_USERNAME`         | database user                                          | `<aiven-username>`                          |
| `SPRING_DATASOURCE_PASSWORD`         | database password                                      | `<aiven-password>`                          |
| `SPRING_JPA_HIBERNATE_DDL_AUTO`      | schema strategy, use `update`                          | `update`                                    |
| `SPRING_DATASOURCE_SSL_MODE`         | `VERIFY_IDENTITY` = encrypt **and** check the cert      | `VERIFY_IDENTITY`                           |
| `SPRING_DATASOURCE_TRUSTSTORE_URL`   | path of the truststore with the Aiven CA certificate   | `file:/app/certs/truststore.p12`            |
| `SPRING_DATASOURCE_TRUSTSTORE_TYPE`  | truststore format                                      | `PKCS12`                                    |
| `SPRING_DATASOURCE_TRUSTSTORE_PASSWORD` | password of the truststore (public certificates only) | `changeit`                                  |
| `APP_CORS_ALLOWED_ORIGINS`           | comma separated frontend origins allowed to call us   | `https://24eg107d51ttexamm.netlify.app` |
| `APP_CORS_ALLOWED_ORIGIN_PATTERNS`   | optional origins with wildcards (local network only)    | *(empty in production)*        |
| `PORT`                               | port the server listens on (Render sets it)            | `8080`                                      |

Spring Boot reads `SPRING_DATASOURCE_URL` automatically and it always wins over the
values in `application.properties`, so no file has to be edited for production.

The four SSL variables have safe defaults in the Docker image
(`VERIFY_IDENTITY` + the truststore at `/app/certs/truststore.p12`), so in production
you normally only set the URL, the user, the password and the schema strategy.

> The SSL settings are applied as **JDBC connection properties**. A connection
> property always wins over the same parameter inside the JDBC URL — that is why
> the URL only contains the host, the port and the database name.

**Schema strategy:** `update` creates missing tables/columns and never deletes data.
Never use `create-drop` or `drop` on a real database.

---

## 7. Connect Aiven MySQL

1. Log in to Aiven, create a **MySQL** service and wait until the status is *running*.
2. Open the service → **Connection** tab. Copy the **host**, **port**, **database name**,
   **user** and **password**. (If the password is hidden, use *Reset password* to set a
   new one — this is your own password, put it into the environment variables, never
   into a file that is committed.)
3. The CA certificate of your Aiven project is **already in the repository**:
   `backend/certs/ca.crt` (it is a *public* certificate — no password, no private
   key — so it is safe to commit, and the Docker build imports it into the
   truststore automatically).
   If you use a different Aiven project, or if the connection suddenly fails with
   `PKIX path building failed` (Aiven rotates the certificate from time to time),
   download the current **ca.crt** from *Connection information* and overwrite
   `backend/certs/ca.crt`. See `backend/certs/README.md` for the details.
4. Build the JDBC URL. The SSL part is configured with the environment variables
   of section 6.2, so the URL only needs the host, the port and the database name:

```
jdbc:mysql://<aiven-host>:<aiven-port>/<database>?serverTimezone=UTC&allowPublicKeyRetrieval=true
```

   `sslMode=VERIFY_IDENTITY` (the default) both **encrypts** the connection and
   **validates** the Aiven server certificate. `sslMode=REQUIRED` would only
   encrypt the traffic without checking who it comes from — that is not enough.

5. Put the URL, the user and the password into the environment variables
   (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).

### Truststore outside Docker (local run)

Create the same truststore on your machine (one time):

```bash
# the path must point to the Aiven ca.crt in backend/certs
keytool -importcert -noprompt -alias aiven-ca -file backend/certs/ca.crt \
        -keystore truststore.p12 -storetype PKCS12 -storepass changeit
```

Then point the application to it:

```bash
export SPRING_DATASOURCE_TRUSTSTORE_URL="file:/<absolute-path>/truststore.p12"
export SPRING_DATASOURCE_TRUSTSTORE_TYPE=PKCS12
export SPRING_DATASOURCE_TRUSTSTORE_PASSWORD=changeit
```

---

## 8. Docker

Build from the **repository root** (the build context is the repository root, which is
what Render uses). The `-f` points to the Dockerfile inside `backend/`:

```bash
docker build -t lab-exam-backend -f backend/Dockerfile .
```

Run it locally:

```bash
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://<aiven-host>:<aiven-port>/<database>?serverTimezone=UTC&allowPublicKeyRetrieval=true" \
  -e SPRING_DATASOURCE_USERNAME="<aiven-username>" \
  -e SPRING_DATASOURCE_PASSWORD="<aiven-password>" \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO="update" \
  -e APP_CORS_ALLOWED_ORIGINS="http://localhost:5173" \
  lab-exam-backend
```

The image is built in two stages: Maven + Java 17 builds the jar, a small
`eclipse-temurin:17-jre-alpine` image runs it as the non-root user `spring` on the port
given by `PORT` (default `8080`).

The Aiven CA certificate from `backend/certs/ca.crt` is imported into
`/app/certs/truststore.p12` during the build. You can check that it worked:

```bash
docker run --rm --entrypoint sh lab-exam-backend -c \
  "keytool -list -keystore /app/certs/truststore.p12 -storepass changeit -storetype PKCS12 | grep aiven-ca"
```

If the certificate is missing, the build only prints a warning — it never fails. The
backend then starts normally and the health endpoint reports `"database": "DOWN"`.

> The backend stays alive even when the database is unreachable
> (`initialization-fail-timeout=-1`). That is why the status dashboard can show
> *"backend CONNECTED / database DISCONNECTED"* instead of the whole service
> disappearing.

---

## 9. Deploy the backend to Render (manual steps)

1. Push the project to GitHub (branch `main`) and open
   <https://dashboard.render.com> → **New +** → **Web Service** → connect the repository.
2. Fill in the settings:

   | Setting                | Value                    |
   | ---------------------- | ------------------------ |
   | Name                   | e.g. `lab-exam-backend`  |
   | Region                 | closest to your Aiven service |
   | Branch                 | `main`                   |
   | Runtime / Root directory | **Docker** / repository root |
   | Dockerfile path        | `backend/Dockerfile`     |
   | Health check path      | `/api/health`            |
   | Instance type          | Free (or any paid plan)  |

3. Open **Environment** and add the variables (mark the password as *Secret*):

   ```
   SPRING_DATASOURCE_URL      = jdbc:mysql://mysql-6f49d52-ttexam.c.aivencloud.com:23292/defaultdb?serverTimezone=UTC&allowPublicKeyRetrieval=true
   SPRING_DATASOURCE_USERNAME = avnadmin
   SPRING_DATASOURCE_PASSWORD = <aiven-password>          <- Secret
   SPRING_JPA_HIBERNATE_DDL_AUTO = update
   APP_CORS_ALLOWED_ORIGINS   = https://24eg107d51ttexamm.netlify.app
   ```

   The SSL settings (`SPRING_DATASOURCE_SSL_MODE`, `SPRING_DATASOURCE_TRUSTSTORE_*`)
   already have working defaults inside the Docker image, so they are usually not
   needed here.

   > `APP_CORS_ALLOWED_ORIGINS` must contain the **exact** origin of the frontend
   > (without a trailing slash). A trailing slash is removed automatically, a
   > wildcard (`*`) is not needed and should not be used.

4. Click **Create Web Service**. Render builds the Docker image and starts the service.
   The first build takes a few minutes because Maven downloads the dependencies.
5. When it is green, copy the public URL, e.g. `https://lab-exam-backend.onrender.com`
   and test `https://lab-exam-backend.onrender.com/api/health`.

> The free Render plan sleeps after some minutes of inactivity, so the first request
> can take ~30 seconds. The frontend shows a "checking" state during that time.

---

## 10. Deploy the frontend to Netlify (manual steps)

1. Open <https://app.netlify.com> → **Add new site** → **Import an existing project**
   → choose the GitHub repository.
2. Fill in the build settings:

   | Setting            | Value        |
   | ------------------ | ------------ |
   | Base directory     | `frontend`   |
   | Build command      | `npm run build` |
   | Publish directory  | `dist`       |

   These values are already stored in `netlify.toml` at the repository root, so the
   form can usually be left as it is.

3. Open **Site configuration → Environment variables** and add:

   ```
   VITE_API_BASE_URL = https://lab-exam-backend-yhmk.onrender.com
   ```

   > The value is read **only** at build time. After adding it, start a new deploy
   > (*Deploys → Trigger deploy → Clear build cache*) so that the new bundle is built
   > with the correct URL.

4. Click **Deploy site**. Netlify runs `npm install && npm run build` in `frontend/`
   and publishes `frontend/dist`.
5. The SPA redirect (`/*` → `/index.html`) is configured in `netlify.toml` and in
   `frontend/public/_redirects`, so refreshing a client side route keeps working.
6. The Netlify URL is `https://24eg107d51ttexamm.netlify.app`. It is already allowed
   on Render: `APP_CORS_ALLOWED_ORIGINS=https://24eg107d51ttexamm.netlify.app`
   (a Render restart is triggered automatically).

> Rebuild the frontend after you change `VITE_API_BASE_URL` — the value is baked into
> the JavaScript bundle at build time.

---

## 11. Test the health endpoint

```bash
# local backend
curl http://localhost:8080/api/health

# deployed backend
curl https://lab-exam-backend-yhmk.onrender.com/api/health
```

Answer when everything is fine:

```json
{
  "application": "lab-exam-backend",
  "status": "UP",
  "database": "UP",
  "message": "The application is running and the database answered in 118 ms.",
  "timestamp": "2026-01-31T10:15:30Z",
  "databaseLatencyMs": 118
}
```

The endpoint always returns HTTP `200` as long as the application itself is running.
The database state is reported in the `"database"` field, so a short database outage
does not crash the service.

* `"status"` describes **the application** — it is `UP` as long as Spring Boot answers.
* `"database"` is the result of a **real** database check (`Connection.isValid()`).
  It is `UP` only when MySQL really answered, `DOWN` otherwise.
* `"databaseLatencyMs"` is the time the database check needed.

You can also test it in the browser: open `http://localhost:8080/api/health`.

### 11.1 Connection status page

The frontend has a page with three buttons that shows the three connections separately:
<https://24eg107d51ttexamm.netlify.app/status> (local: `/status`).

| Row and button         | What it really does                                                      | Badge |
| ---------------------- | ------------------------------------------------------------------------- | ----- |
| **1. Check website**   | checks in the browser that the page is really running (JavaScript executed, timers work) | green **WORKING** / red **NOT WORKING** |
| **2. Check backend**   | real `GET /api/health` call through the Axios client (with the round trip time) | green **WORKING** / red **NOT WORKING** |
| **3. Check database**  | the same real call — only the `"database"` field of the answer is used    | green **WORKING** / red **NOT WORKING** |

* Every check runs **automatically** when the page is opened or refreshed, so the page
  always shows WORKING / NOT WORKING without any interaction.
* The raw JSON of the health endpoint is shown below the rows.
* The browser **never** talks to MySQL. If the backend cannot be reached, the database
  row shows amber **UNKNOWN** — the state is not guessed.
* If `VITE_API_BASE_URL` is missing in the build, the page shows a yellow warning
  that names the URL which is actually called.

---

## 12. Common errors and fixes

| Symptom (in the browser)                              | Cause                                                      | Fix                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `Cannot reach the backend at http://localhost:8080`    | backend not started, or `VITE_API_BASE_URL` wrong          | start the backend, check `.env`, restart `npm run dev`              |
| `The request timed out`                               | Render free plan is sleeping, or the DB is slow            | wait and retry, use the "Try again" button                            |
| `CORS policy: No 'Access-Control-Allow-Origin'`       | frontend origin missing in `APP_CORS_ALLOWED_ORIGINS`       | add the exact frontend URL (with `https://`) and redeploy the backend  |
| `404` on `http://localhost:8080/api/health`            | wrong path / old version of the backend running            | the path is exactly `/api/health`                                     |
| Health says `database: DOWN`, log says `PKIX path building failed` | Aiven `ca.crt` is missing or not in the truststore | download `ca.crt` into `backend/certs/` and rebuild the Docker image  |
| `database: DOWN` on Render, but the same code works locally | the deployed image was built **before** `backend/certs/ca.crt` was committed | commit and push `backend/certs/ca.crt`, then let Render rebuild the image |
| Log says `Unable to load truststore`                     | `SPRING_DATASOURCE_TRUSTSTORE_URL` points to a file that does not exist | local run: create the truststore (section 7) and point the variable to it |
| `sslMode` in the JDBC URL has no effect                  | the SSL variables are applied as connection properties and always win | use `SPRING_DATASOURCE_SSL_MODE` instead of putting `sslMode` into the URL |
| `Access denied for user`                              | wrong Aiven user / password                                | reset the password in Aiven and update the environment variables      |
| `Unknown database 'labexam'`                          | wrong database name in the JDBC URL                        | copy the database name from the Aiven connection tab                  |
| `Table ... doesn't exist`                              | `ddl-auto` is `none` or `validate`                         | set `SPRING_JPA_HIBERNATE_DDL_AUTO=update`                            |
| `Port 8080 was already in use`                         | another Spring Boot app is running                         | stop the other app or change `PORT`                                   |
| Netlify: `npm run build` fails with "command not found" | dependencies were not installed                          | the build command must be `npm run build` and the base directory `frontend` |
| Render: build fails in Docker                          | wrong root directory / Dockerfile path                     | root directory = repository root, Dockerfile path = `backend/Dockerfile` |
| `failed to read dockerfile: open Dockerfile`            | `docker build` was run without `-f`                      | `docker build -t lab-exam-backend -f backend/Dockerfile .` from the repository root |
| App connects to `localhost:3306` instead of Aiven | `SPRING_DATASOURCE_URL` was not set              | set the variable (Render → Environment, or in your shell)             |
| Dashboard on Netlify shows the backend as **DISCONNECTED**, but `curl` on the Render URL works | `VITE_API_BASE_URL` is missing in Netlify (the bundle then calls `http://localhost:8080`) | add the variable in Netlify and rebuild the site |

---

## 13. Adding your CRUD module during the exam

A short cheat sheet — one layer per folder:

**Backend**

1. `entity/Student.java` — `@Entity` class with `@Id @GeneratedValue` and your fields.
2. `repository/StudentRepository.java` — `extends JpaRepository<Student, Long>`.
3. `dto/StudentRequest.java` / `dto/StudentResponse.java` — request/response DTOs with
   Bean Validation annotations (`@NotBlank`, `@Min`, `@Max`).
4. `service/StudentService.java` — business logic, uses the repository.
5. `controller/StudentController.java` — `@RestController` with
   `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` under `/api/students`.
6. Throw `new ResourceNotFoundException("Student not found: " + id)` when an id does not
   exist — the global handler already maps it to HTTP 404.

**Frontend**

7. `frontend/src/api/api.js` — add your calls, for example
   `export const studentApi = { list: () => api.get('/api/students') };`
8. `frontend/src/pages/Students.jsx` — the page with a table, a form and the delete button.
9. `frontend/src/App.jsx` — add `<Route path="/students" element={<Students />} />`.

**Finally**

10. `git add .`, `git commit -m "..."`, `git push` — Render and Netlify redeploy by
    themselves.

---

## 14. Git commands (commit and push yourself)

```bash
git status                     # see what changed
git add .                      # stage everything (secrets are excluded by .gitignore)
git commit -m "Add full stack lab exam starter"
git push origin main           # triggers the automatic deployments
```

Before you commit, check that no secret is included:

```bash
git status --ignored           # shows the ignored files as well
```

`frontend/.env`, `backend/.env` and the truststores are ignored by `.gitignore`.
Only the `*.example` files with placeholders are committed.

---

## 15. Security checklist

* Database credentials exist **only** as environment variables (Render → Environment).
* `frontend/.env` is committed? It must **not** be — only `frontend/.env.example`.
* The frontend never talks to the database directly, only to the backend API.
* The Aiven certificate `backend/certs/ca.crt` is public and safe to commit.
* The truststore password (`changeit`) protects only public certificates, it is not a
  database secret.
* The health endpoint never returns passwords, host names or stack traces.
