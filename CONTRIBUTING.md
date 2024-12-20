Here's a comprehensive CONTRIBUTING.md file for your repository:

```markdown
# Contributing to RegNxt

👍 First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to RegNxt. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Styleguides](#styleguides)
  - [Git Commit Messages](#git-commit-messages)
  - [TypeScript Styleguide](#typescript-styleguide)
  - [Documentation Styleguide](#documentation-styleguide)

## Code of Conduct

This project and everyone participating in it are governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [Abdullah Mujahid](mailto:abdullahmujahidali1@gmail.com).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide the following information:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some other applications where this enhancement exists, if applicable**

### Pull Requests

Please follow these steps when creating pull requests:

1. Follow the [styleguides](#styleguides)
2. Reference any relevant issues
3. Include screenshots and animated GIFs in your pull request whenever possible
4. Document new code
5. End all files with a newline

## Development Setup

1. Fork the repo
2. Clone your fork
3. Create a new branch:
   ```bash
   git checkout -b my-branch-name
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow the existing TypeScript configuration
* Use types whenever possible instead of `any`
* Document complex types
* Use interfaces for object definitions
* Use type for unions and intersections

```typescript
// Right
interface User {
  name: string;
  age: number;
}

// Wrong
type User = {
  name: string;
  age: number;
}
```

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference methods and classes in markdown with the custom `{}` notation:
    * Reference classes with `{ClassName}`
    * Reference instance methods with `{ClassName.methodName}`
    * Reference class methods with `{ClassName.methodName}`

## Testing

We use Jest and React Testing Library for testing. Please make sure to include tests with your changes:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## Additional Notes

### Issue and Pull Request Labels

Labels help us track and manage issues and pull requests. Please refer to the full list of labels and their descriptions in our documentation for guidance on using labels.

### Recognition

We believe in recognizing contributors for their hard work. All contributors will be added to our Contributors list and we regularly feature significant contributions in our release notes.

## Questions?

If you have any questions, please feel free to contact the project maintainers or create a discussion on GitHub.

Thank you for contributing to RegNxt! 🎉
```
