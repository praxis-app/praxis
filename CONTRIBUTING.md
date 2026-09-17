# Contributing to Praxis

Praxis is open to contributions, whether that means reporting a bug, discussing
the state of the code, submitting a fix, or proposing a feature.

## Getting set up

The [README](README.md) covers installation and running the app. In short, you
need the Rust and Node versions pinned in `rust-toolchain.toml` and `.nvmrc`,
PostgreSQL 16, and Redis 8.4. Docker with Compose and Buildx is required for
end-to-end tests and artifact builds.

## Pull requests

Changes happen through pull requests, following
[GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. Fork the repo and create your branch from `main`.
2. Add tests for code that should be tested.
3. Update documentation when behavior or APIs change.
4. Run the checks below.
5. Open the pull request.

## Checks

Run what your change touches. Everything must pass before a pull request is
ready:

```bash
# Frontend and shared TypeScript
npm run check
npm run test

# Rust
cargo fmt --all --check
cargo clippy --workspace --all-targets
npm run test:rust

# End-to-end, Docker backed and slower
npm run test:e2e
```

`npm run check` runs TypeScript, ESLint, and `npm audit`. `npm run test-all`
runs the frontend, Rust, and end-to-end suites in sequence. The API integration
tests create temporary databases on your local PostgreSQL, so they need `psql`
and permission to create and drop databases.

## Code style

ESLint and Prettier cover TypeScript, configured in `eslint.config.js` and
`.prettierrc`. Rust formatting follows `rustfmt.toml` through `cargo fmt`. Note
that `npm run lint` reports problems rather than fixing them; run Prettier from
your editor or with `npx prettier --write <paths>`.

`CLAUDE.md` and `AGENTS.md` at the repo root describe the conventions this
codebase follows, including backend module layout, frontend component
structure, and when comments are wanted.

## Commit messages

Commits use a short type prefix, such as `feat:`, `fix:`, `chore:`, `docs:`,
`refactor:`, `perf:`, `style:`, or `test:`, followed by a concise description
written in the imperative mood.

## Reporting bugs

Bugs are tracked in [GitHub issues](https://github.com/praxis-app/praxis/issues).
[Open a new issue](https://github.com/praxis-app/praxis/issues/new) with:

- A quick summary and any relevant background
- Specific steps to reproduce, with sample code where it helps
- What you expected to happen, and what happened instead
- Your environment: operating system, Rust and Node versions, and whether you
  were running through Docker
- Anything you already tried, and what you suspect is going on

## License

Praxis is licensed under the
[GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).
By contributing, you agree that your contributions are licensed under it as
well.
