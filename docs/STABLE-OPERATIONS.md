# Stable Development Operations

This project follows the resilient development path below.

## Normal path

1. Read GitHub `main`.
2. Make the code change.
3. Update `main`.
4. Verify the public production health endpoint.
5. Verify the customer-facing route only when the change affects that route.

Normal development must not begin with Opera / Browser Connector or Vercel dashboard authentication.

## Production health

Default endpoint:

`https://home-buying-decision-guide.vercel.app/api/health`

Local check:

`node scripts/verify-production-health.mjs`

The endpoint reports only service readiness metadata and does not expose secrets.

## When Vercel authentication is actually required

Use Vercel authentication only for platform-management work such as environment variables, domains, rollback, deployment metadata, or project configuration.

A Vercel management API 403 is not, by itself, evidence that the production application is down.

## Source of truth

GitHub `main` is the code source of truth. Preview URLs are not used to decide which version is current.
