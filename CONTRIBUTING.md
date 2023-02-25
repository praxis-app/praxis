# Contributing to Social API

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase (we use [Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the GNU General Public License

In short, when you submit code changes, your submissions are understood to be under the same [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html) that covers the project.

## Report bugs using Github's [issues](https://github.com/forrestwilkins/social-api/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/forrestwilkins/social-api/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

[This is an example](http://stackoverflow.com/q/12488905/180626) of a bug report. Here's [another example from Craig Hockenberry](http://www.openradar.me/11905408), a well respected app developer.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can. [This stackoverflow question](http://stackoverflow.com/q/12488905/180626) includes sample code that _anyone_ with a base R setup can run to reproduce what they were seeing
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Adding Unit Tests

We use a combination of Jest and React Testing Library to test our components. The idea behind RTL is that we want to test behavior and not implementation, or returned results instead of internal variables.

For instance, we might do the following:

```
it('should add a user to database', () => {
  userManager.addUser('james', 'password');
  expect(userManager.login('james', 'password')).toBe(true);
});
```

Here's a [tutorial by Robin Wieruch](https://www.robinwieruch.de/react-testing-library) to help you get started. We also recommend taking a look at [John Au-Yeung's article](https://javascript.plainenglish.io/javascript-unit-test-best-practices-testing-behavior-4d1fd46ae03d) on unit test best practices.

## Use a Consistent Coding Style

We're currently using ESlint and Prettier which you can find configuration files for in the project's root directory (`.eslintrc` and `.prettierrc`).

- You can try running `yarn lint` for style unification
- Use Visual Studio Code with the Prettier extension installed (optional)

## License

By contributing, you agree that your contributions will be licensed under its GNU General Public License.
