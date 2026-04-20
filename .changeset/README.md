# Changesets

This directory holds Changeset-managed release notes for the workspace packages under `packages/*`.

The root `twing` package is listed under `ignore` in `config.json` — it has its own existing release flow. Changesets manages versioning only for the new scoped packages.

To add a release note: `pnpm changeset`. To version packages from pending notes: `pnpm changeset version`. To publish: `pnpm -r publish`.
