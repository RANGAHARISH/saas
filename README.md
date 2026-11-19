# SaaSFlock

A SaaS product discovery and launch platform maintained by [Ranga Harish](https://github.com/RANGAHARISH).

## Development

    git clone https://github.com/RANGAHARISH/saas.git
    cd saas
    bun install
    cp .env.example .env

Configure PostgreSQL and authentication in .env, then run bun run dev. Use bun run build for a production build.

## Vercel

Import RANGAHARISH/saas into Vercel. Set DATABASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_URL and BETTER_AUTH_URL for your deployment. Configure OAuth, uploads, payments and email credentials for the integrations you enable. RESEND_FROM_EMAIL must use a verified sending domain.

### Fixing a server error after deployment

`ECONNREFUSED 127.0.0.1:5432` (error digest `3393308094`) means the deployment is trying to use a local PostgreSQL server. Vercel does not run PostgreSQL alongside your app. A successful build does not verify the database connection.

1. In Vercel → Project → Settings → Environment Variables, set `DATABASE_URL` to your hosted PostgreSQL connection string. Do not use the localhost example from `.env.example`. For serverless hosting, use your database provider's pooled connection URL when available.
2. Set `BETTER_AUTH_SECRET` to a securely generated random secret of at least 32 characters. Generate it locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and store it only in Vercel's environment settings.
3. Set both `NEXT_PUBLIC_URL` and `BETTER_AUTH_URL` to your actual HTTPS deployment origin, without a trailing slash.
4. Apply the database migrations with `bun run db:migrate` from a trusted environment configured with the hosted `DATABASE_URL`.
5. Redeploy after updating environment variables. Check the homepage and sign-in, then inspect Vercel runtime logs for connection or missing-table errors.

The homepage shows a temporary-unavailability message if its database queries fail; it does not substitute demo projects for production data. Database-backed features require the configuration above.

## Credits and license

Derived from [Open-Launch](https://github.com/drdruide/open-launch). Original contributors and commit history are preserved. The [Open-Launch License](LICENSE) requires its visible linked attribution badge on every page.

## Support

[Report an issue](https://github.com/RANGAHARISH/saas/issues).
