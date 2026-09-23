# Contributing to Praxis

Praxis is open to contributions of all kinds. Because the project is still
taking shape, contributors can help shape both the codebase and the app itself.
That might mean reporting a bug, providing feedback on the codebase, improving
documentation or design, submitting a fix, or proposing a feature.

This guide covers how to get involved, where help is needed, and what to expect
when preparing and reviewing a contribution.

## Getting involved

The goal is to give each contributor a clear, useful piece of work without
duplicating someone else's effort. These steps are a good place to start, and
you can ask a maintainer for help in the relevant issue at any point:

1. Find an open issue that matches your interests or something you want to
   learn. If you're new to the project, a small, focused issue is usually the
   best place to start. If an issue is already assigned or someone has said
   they're working on it, check in before starting overlapping work.

2. If the work is not already represented, open an issue describing the
   problem or idea and the desired outcome. Before starting substantial work,
   note in the issue that you'd like to work on it so a maintainer can confirm
   the scope and help avoid duplicated effort. Small fixes can usually go
   directly to a pull request.

3. Keep the work focused on the agreed scope, and ask for help if it grows
   beyond it.

## Getting set up

The [README](README.md) covers installation and running the app. In short, you
need the Rust and Node versions pinned in `rust-toolchain.toml` and `.nvmrc`,
PostgreSQL 16, and Redis 8.4. Docker with Compose and Buildx is required for
running E2E tests and artifact builds.

## Skills and contribution areas

You do not need experience in every part of the project to contribute. Praxis
can use help in several areas:

- **Frontend development:** React, TypeScript, responsive interfaces, state and
  data fetching, accessibility, and browser behavior

- **Backend development:** Rust, Axum, SeaORM, PostgreSQL, API design,
  concurrency, and background tasks

- **Security:** authentication, authorization, permissions, threat
  modeling, encrypted content, secure file handling, and security testing

- **UI/UX:** interaction design, user research, accessibility, information
  architecture, visual design, and interface copy

- **Testing and quality:** Playwright, Vitest, Rust integration tests,
  exploratory testing, bug reproduction, and regression analysis

- **Infrastructure and operations:** Docker, Redis, LiveKit, deployment,
  observability, and release workflows

- **Documentation and community:** setup guides, feature documentation, issue
  triage, contributor support, and translating technical decisions for users

- **Collaborative decision-making:** facilitation, community governance, group
  decision processes, and feedback on how proposals and voting should work
  in practice

Domain knowledge, careful testing, clear writing, and useful bug reports are as
valuable as writing production code.

## Pull requests

Changes happen through pull requests, following
[GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. Fork the repo, or create a branch if you have write access, starting from
   `main`.
2. Add tests for code that should be tested.
3. Update documentation when behavior or APIs change.
4. Run the checks below.
5. Open a pull request that links the issue and explains what changed, how it
   was tested, and anything still unresolved.
6. Work with the maintainers to address review feedback. Ask questions when
   anything is unclear, and update the pull request as needed.

## Checks

Run the checks relevant to your change. Those checks should pass before a
pull request is ready for review:

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

`npm run check` runs TypeScript, ESLint, Prettier, and `npm audit`.
`npm run test-all` runs the frontend, Rust, and end-to-end suites in sequence.
The API integration tests create temporary databases on your local PostgreSQL,
so they need `psql` and permission to create and drop databases.

## Code style

ESLint and Prettier cover TypeScript, configured in `eslint.config.js` and
`.prettierrc`. Rust formatting follows `rustfmt.toml` through `cargo fmt`.
Both `npm run lint` and `npm run format:check` report problems without changing
files. To apply Prettier formatting, use your editor or run
`npx prettier --write <paths>`.

## Commit messages

Commits use a short type prefix, such as `feat:`, `fix:`, `chore:`, `docs:`,
`refactor:`, `perf:`, `style:`, or `test:`, followed by a concise description
written in the imperative mood.

## Reporting bugs

Bugs are tracked in [GitHub issues](https://github.com/praxis-app/praxis/issues).

If you believe you've found a security vulnerability, please do not open a
public issue. Follow the reporting instructions in [SECURITY.md](SECURITY.md)
instead.

[Open a new issue](https://github.com/praxis-app/praxis/issues/new) with:

- A quick summary and any relevant background
- Specific steps to reproduce, with sample code where it helps
- What you expected to happen, and what happened instead
- Your environment: operating system, browser and version, Rust and Node
  versions, and whether you were running through Docker
- Anything you've already tried, and any suspected cause

## Code of conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Praxis is licensed under the [GNU General Public License v3](LICENSE).
By contributing, you agree that your contributions are licensed under it as
well.
