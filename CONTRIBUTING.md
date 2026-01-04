# Contributing to UniFreelance

Thank you for your interest in contributing to UniFreelance! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/UniFreelance.git
   cd UniFreelance
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/Mo7amed7osam/UniFreelance.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+
- Docker and Docker Compose (optional)
- Git

### Local Development Environment

#### Option 1: Using Docker Compose (Recommended)

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your local MongoDB connection
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Making Changes

### Branch Naming Convention

Use descriptive branch names:

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding tests

Example:
```bash
git checkout -b feature/add-user-notifications
```

### Commit Message Guidelines

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add user notification system

Implements real-time notifications for users when they receive
new messages or job applications.

Closes #123
```

```
fix(frontend): resolve login form validation issue

The login form was not properly validating email format.
Added regex validation for email input.

Fixes #456
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** locally:
   ```bash
   # Backend tests
   cd backend
   npm test

   # Frontend build
   cd frontend
   npm run build
   ```

3. **Ensure no linting errors**:
   ```bash
   # Check your code
   npm run lint
   ```

### Submitting a Pull Request

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template

3. **PR Title**: Use a clear, descriptive title
   ```
   feat: Add user notification system
   fix: Resolve login validation issue
   docs: Update deployment documentation
   ```

4. **PR Description**: Include:
   - What changes were made
   - Why these changes are necessary
   - How to test the changes
   - Screenshots (for UI changes)
   - Related issue numbers

### PR Review Process

1. **Automated Checks**: CI/CD pipeline will automatically run:
   - Code builds (Node 18.x and 20.x)
   - Tests
   - Linting
   - Security scans
   - PR size validation

2. **Code Review**: 
   - At least one maintainer will review your PR
   - Address any requested changes
   - Respond to comments and questions

3. **Merge**:
   - Once approved and all checks pass, a maintainer will merge your PR
   - Your branch can be deleted after merging

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use async/await over callbacks
- Add JSDoc comments for public functions
- Use meaningful variable names

### Backend (Node.js/Express)

- Follow RESTful API conventions
- Use middleware for common functionality
- Validate all user inputs
- Handle errors properly
- Use try-catch blocks for async operations
- Log important events and errors

### Frontend (React/TypeScript)

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript types properly
- Follow React best practices
- Use proper state management
- Optimize performance (memo, useMemo, useCallback)

### File Structure

```
backend/
  ├── src/
  │   ├── config/       # Configuration files
  │   ├── controllers/  # Request handlers
  │   ├── middleware/   # Express middleware
  │   ├── models/       # Database models
  │   ├── routes/       # API routes
  │   ├── services/     # Business logic
  │   └── utils/        # Utility functions

frontend/
  ├── src/
  │   ├── components/   # React components
  │   ├── pages/        # Page components
  │   ├── hooks/        # Custom hooks
  │   ├── utils/        # Utility functions
  │   ├── services/     # API services
  │   └── types/        # TypeScript types
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Write tests for:
- API endpoints
- Business logic
- Utility functions
- Database operations

### Frontend Tests

```bash
cd frontend
npm test
```

Write tests for:
- Components
- Hooks
- Utility functions
- Integration tests

### Test Coverage

Aim for:
- 80%+ code coverage
- All critical paths tested
- Edge cases covered

## CI/CD Pipeline

Our CI/CD pipeline automatically runs on all pull requests:

### Automated Checks

1. **Build Verification**:
   - Backend builds on Node 18.x and 20.x
   - Frontend builds production bundle

2. **Testing**:
   - All backend tests must pass
   - Frontend must build successfully

3. **Security**:
   - npm audit checks for vulnerabilities
   - Trivy scans for security issues

4. **Code Quality**:
   - Linting checks
   - Code style validation

5. **PR Validation**:
   - Checks for sensitive files
   - Validates PR size
   - Auto-labels based on changes

### Pipeline Status

You can view the status of your PR checks in the GitHub PR interface. All checks must pass before your PR can be merged.

### If Checks Fail

1. Review the error messages in the GitHub Actions logs
2. Fix the issues locally
3. Push the fixes to your branch
4. The checks will automatically re-run

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for solutions
3. **Try the latest version** to see if the issue persists

### Creating an Issue

Include the following information:

1. **Clear title**: Summarize the issue in one line
2. **Description**: Detailed explanation of the issue
3. **Steps to reproduce**: How to recreate the issue
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Environment**:
   - OS and version
   - Node.js version
   - Browser (for frontend issues)
7. **Screenshots**: If applicable
8. **Error messages**: Complete error logs

### Issue Types

Use appropriate labels:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `question` - Questions about the project
- `help wanted` - Extra attention needed
- `good first issue` - Good for newcomers

## Additional Resources

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [JavaScript Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Questions?

If you have questions:
1. Check the [documentation](README.md)
2. Search [existing issues](https://github.com/Mo7amed7osam/UniFreelance/issues)
3. Create a new issue with the `question` label
4. Reach out to maintainers

Thank you for contributing to UniFreelance! 🎉
