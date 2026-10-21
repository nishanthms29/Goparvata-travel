# GOPARVATA — Find Your Wild. Follow Your Wonder.

The public site is a Next.js travel-planning website backed by XAMPP MariaDB. Visitors can browse published destinations and packages without signing in, then request a quotation or callback. There is no customer account or instant-payment flow. Administrator access is private and is checked in both the page and API handlers.

The legacy PHP/XAMPP source remains available for compatibility with the existing `travel_agency` tables. The Next.js app adds its own tables to that same database; it does not rename, drop, import over, or update the existing `travel_destinations`, `travel_enquiries`, `travel_settings`, or `email` tables.

## Requirements

- Node.js 22.12 or newer and npm.
- XAMPP Apache and MariaDB running locally.
- A dedicated MariaDB application user. Do not run the website with the MariaDB root account.

## Configure XAMPP MariaDB

1. Start MariaDB in the XAMPP Control Panel. Back up the `travel_agency` database before applying schema changes.
2. Ensure the existing application user can access `travel_agency`. In the XAMPP MySQL shell, use the actual user/host shown by `SHOW GRANTS`; do not change or reset its password:

   ```sql
   GRANT ALL PRIVILEGES ON `travel_agency`.* TO 'tern_compass_app'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```

   If that account is registered under another host, grant the same database-level privileges to that existing account instead.

3. Copy `.env.example` to `.env`, retain the existing application's database username/password, and point `DATABASE_URL` to the `travel_agency` database. URL-encode special characters in the password. `.env` is private and must not be committed.
4. Generate an Auth.js secret in PowerShell and set it as `AUTH_SECRET` in `.env`:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

5. Install dependencies, apply only the checked-in additive Prisma migrations, and seed the Next.js application's own sample destinations and packages:

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
