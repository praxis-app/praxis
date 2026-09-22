# Contributing to Praxis

Praxis is open to contributions of all kinds. Because the project is still
taking shape, contributors can help shape both the codebase and the app itself.
That might mean reporting a bug, discussing the state of the code, improving
documentation or design, submitting a fix, or proposing a feature.

This guide covers how to get involved, where help is needed, and what to expect
when preparing and reviewing a contribution.

## Getting involved

The goal is to give each contributor a clear, useful piece of work without
duplicating someone else's effort. These steps offer a starting point, but you
can ask a maintainer for help at any point:

1. Choose a contribution area that matches your interests or something you
   want to learn.

2. Review the open issues. If the work is not represented, open an issue that
   explains the problem, the desired outcome, and any relevant context.

3. Comment before starting substantial work. A maintainer can confirm the
   scope, identify dependencies, and make sure someone is available to review
   it. Small fixes can usually move directly to a pull request.

4. Agree on a manageable first step. New contributors should start with a
   focused issue or one part of a larger feature, with a clear result and a way
   to verify it.

5. Create a branch, make the change, and run the checks relevant to it. Ask for
   help early if the task grows beyond the agreed scope.

6. Open a pull request that links the issue and explains the change, how it was
   tested, and anything still unresolved.

7. Address feedback with the maintainers. Ask questions when anything is
   unclear, and work together on any agreed upon changes.

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

- **Security and privacy:** authentication, authorization, permissions, threat
  modeling, encrypted content, and secure file handling

- **UI and UX:** interaction design, user research, accessibility, information
  architecture, visual design, and interface copy

- **Testing and quality:** Playwright, Vitest, Rust integration tests,
  exploratory testing, bug reproduction, and regression analysis

- **Infrastructure and operations:** Docker, Redis, LiveKit, deployment,
  observability, and release workflows

- **Documentation and community:** setup guides, feature documentation, issue
  triage, contributor support, and translating technical decisions for users

- **Collaborative decision-making:** facilitation, community governance, group
  decision processes, and feedback on how proposals and voting work in practice

Domain knowledge, careful testing, clear writing, and useful bug reports are as
valuable as writing production code.

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
