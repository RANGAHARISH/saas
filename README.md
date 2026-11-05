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

## Credits and license

Derived from [Open-Launch](https://github.com/drdruide/open-launch). Original contributors and commit history are preserved. The [Open-Launch License](LICENSE) requires its visible linked attribution badge on every page.

## Support

[Report an issue](https://github.com/RANGAHARISH/saas/issues).
