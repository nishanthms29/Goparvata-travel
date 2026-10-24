# GOPARVATA — Find Your Wild. Follow Your Wonder.

The public site is a Next.js travel-planning website backed by XAMPP MariaDB. Visitors can browse published destinations and packages without signing in, then request a quotation or callback. There is no customer account or instant-payment flow. Administrator access is private and is checked in both the page and API handlers.

The legacy PHP/XAMPP source remains available for compatibility with the existing `travel_agency` tables. The Next.js app adds its own tables to that same database; it does not rename, drop, import over, or update the existing `travel_destinations`, `travel_enquiries`, `travel_settings`, or `email` tables.

## Requirements

- Node.js 22.12 or newer and npm.
- A MySQL/MariaDB database reachable from the Next.js application and the migration runner. XAMPP MariaDB is suitable for local development; production needs a managed or otherwise publicly reachable/privately networked database host supported by your deployment setup.
- A dedicated database application user. Do not run the website with the database root account.

## Production environment

Set these variables in the Vercel project's Production environment (and in Preview if previews should use a separate database). Keep credentials in Vercel's encrypted environment settings; never commit them or paste their values into source control or chat.

| Variable | Required | Expected format |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma MySQL URL: `mysql://USER:URL_ENCODED_PASSWORD@HOST:3306/DATABASE`. Use the actual database host, port, name, and a least-privilege app user. Percent-encode reserved characters in the username/password. Add provider-specific TLS/connection parameters only as required by the database host. |
| `AUTH_SECRET` | Yes | Unique, unpredictable secret with at least 32 random bytes. For example, generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` and set it only in the deployment environment. |
| `APP_URL` | Yes | Canonical public site origin including `https://`, for example `https://www.example.com`, without a trailing slash. |

The following settings are optional; configure them for the corresponding feature:

| Variable(s) | Expected format / purpose |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` | SMTP server hostname, port number, `true`/`false` TLS mode, account username and private password/App Password. |
| `EMAIL_FROM`, `ENQUIRY_TO_EMAIL` | Valid sender display address and destination email address for enquiry notices. |
| `NEXT_PUBLIC_MAPS_API_KEY` | Optional browser-visible maps API key; restrict it to the production website origin and required APIs. |
| `BUSINESS_EMAIL` | Public-facing valid email address. |
| `BUSINESS_PHONE` | Public-facing phone number, preferably E.164 (for example, `+14155552671`). |
| `WHATSAPP_BUSINESS_NUMBER` | International country code and number using digits only, with no `+`, spaces, or punctuation. |

`ADMIN_SETUP_EMAIL`, `ADMIN_SETUP_NAME`, and `ADMIN_SETUP_PASSWORD` are one-time process environment inputs for `npm run admin:create`, not site runtime settings. Use a valid email, administrator display name, and unique password of at least 16 characters; provide them privately to the setup command.

`.env.example` contains format placeholders only. Replace them in a private local `.env` or deployment settings; it is not a source of working credentials.

## Deploy schema changes

The Prisma datasource remains `provider = "mysql"` and the app uses MySQL/MariaDB in both local and production deployments. The checked-in migrations create the Next.js application's tables and apply the follow-up changes to those application tables; they do not reset the database or target the legacy PHP tables. Back up the production database and apply pending migrations to a staging copy first, especially before the first production rollout.

Run migrations as a release step from a runner that can reach the production database, using the exact production `DATABASE_URL` supplied through a protected environment:

```powershell
npm run db:deploy
```

This runs Prisma's `prisma migrate deploy` command and applies only pending checked-in migrations. The regular build runs `prisma generate` and `next build`; it intentionally does not mutate the production schema. Do not use `prisma migrate dev`, `prisma migrate reset`, or `db:seed` against production. Keep the deployment database reachable by both the running Vercel application and the migration runner, allow the required network access, and grant the migration identity the DDL privileges needed by the reviewed migrations. Use a separate, short-lived migration identity with DDL privileges where the database host supports it; the Vercel runtime `DATABASE_URL` should use an application identity with only the privileges needed at runtime.

The sitemap and database-backed public routes render at request time rather than querying the production database during `next build`. A production database error is surfaced; development-only sample fallbacks are not used to mask production database failures. Published catalogue content continues to come from the database.

## Configure local XAMPP MariaDB

1. Start MariaDB in the XAMPP Control Panel. Back up the `travel_agency` database before applying schema changes.
2. Ensure the existing application user can access `travel_agency`. In the XAMPP MySQL shell, use the actual user/host shown by `SHOW GRANTS`; do not change or reset its password:

   ```sql
   GRANT ALL PRIVILEGES ON `travel_agency`.* TO '<existing-app-user>'@'<existing-host>';
   FLUSH PRIVILEGES;
   ```

   If that account is registered under another host, grant the same database-level privileges to that existing account instead.

3. Copy `.env.example` to `.env`, retain the existing application's database username/password, and point `DATABASE_URL` to the `travel_agency` database. URL-encode special characters in the password. `.env` is private and must not be committed.
4. Generate an Auth.js secret in PowerShell and set it as `AUTH_SECRET` in `.env`:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

5. Install dependencies, apply only the checked-in Prisma migrations, and seed the Next.js application's sample destinations and packages:

   ```powershell
   npm install
   npm run db:deploy
   npm run db:seed
   ```

   Do not run `prisma migrate reset`, drop/recreate the database, or edit the existing PHP application's rows to complete this setup.

## Create the two authorized administrators

Run `npm run admin:create` once per administrator, using each person's own email and a unique password of at least 16 characters. Enter the credentials only in the local PowerShell prompt/environment; do not send passwords in chat or save them in source code. The script creates or resets only the specified account. Credentials are not supplied by the project.

```powershell
$env:ADMIN_SETUP_EMAIL = "first-admin@example.com"
$env:ADMIN_SETUP_NAME = "Travel Administrator"
$securePassword = Read-Host "Enter a unique admin password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $env:ADMIN_SETUP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  npm run admin:create
} finally {
  Remove-Item Env:ADMIN_SETUP_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  $securePassword.Dispose()
}
```

Repeat with the business partner's distinct email and a different password. Only users with the `ADMIN` database role can authenticate. The sign-in endpoint is rate-limited.

## Run and verify

```powershell
npm run dev
```

Open `http://localhost:3000/`. Apache can remain available for other XAMPP services; MariaDB is the database service used by this app.

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Public package enquiries, custom trip enquiries, contact messages, and newsletter signups validate input, require consent where applicable, use a honeypot and rate limiting, and do not require an account. Admin pages redirect anonymous visitors to `/admin/login`; admin APIs return `401` or `403` unless the session belongs to an authorized administrator. Package removal is a soft archive so past trip requests remain intact.

## Email and WhatsApp

Gmail SMTP is configured through `.env`; provide the account's App Password locally in `SMTP_PASSWORD`. The app stores a valid enquiry even if SMTP is unavailable and reports whether a notification was sent. Keep the App Password private.

An administrator can add or change the WhatsApp number at `/admin/settings`. Enter the international country code and number (digits only); leaving it blank hides the public WhatsApp links. Until an administrator saves a number, no contact number is fabricated.

## Brand and business readiness

`brand.config.json` is the shared source for the official brand name, exact tagline, and palette. The Next.js experience imports it directly; the PHP source reads the same JSON. Verify contact details, business/legal identity, supplier availability, pricing, cancellation terms, and privacy disclosures before publishing live offers.
