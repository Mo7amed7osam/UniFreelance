# Testing Guide

This guide covers testing strategies and practices for UniFreelance.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Test Coverage](#test-coverage)

## Testing Philosophy

Our testing approach follows the testing pyramid:

```
        /\
       /  \  E2E Tests (Few)
      /____\
     /      \
    / Integr \  Integration Tests (Some)
   /  ation   \
  /____________\
 /              \
/  Unit  Tests  \  Unit Tests (Many)
/________________\
```

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together
- **E2E Tests**: Test complete user workflows (future enhancement)

## Test Structure

### Backend Tests

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── __tests__/
│   │       └── authController.test.js
│   ├── services/
│   │   ├── userService.js
│   │   └── __tests__/
│   │       └── userService.test.js
│   ├── models/
│   │   ├── User.js
│   │   └── __tests__/
│   │       └── User.test.js
│   └── utils/
│       ├── validators.js
│       └── __tests__/
│           └── validators.test.js
└── jest.config.js
```

### Frontend Tests

```
frontend/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuth.test.ts
│   └── utils/
│       ├── formatters.ts
│       └── formatters.test.ts
└── vite.config.ts
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- authController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run tests in UI mode (if using Vitest)
npm test -- --ui
```

## Writing Tests

### Backend Unit Tests

Example: Testing an authentication controller

```javascript
// authController.test.js
const { login, register } = require('../authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');
      
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      
      // Act
      await login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: expect.any(Object)
      });
    });
    
    it('should return 401 for invalid credentials', async () => {
      // Test implementation
    });
  });
  
  describe('register', () => {
    it('should create new user with valid data', async () => {
      // Test implementation
    });
    
    it('should return 400 if email already exists', async () => {
      // Test implementation
    });
  });
});
```

### Frontend Component Tests

Example: Testing a React component

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
  
  it('should apply correct variant styles', () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    expect(container.firstChild).toHaveClass('btn-primary');
  });
});
```

### Frontend Hook Tests

Example: Testing a custom hook

```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useAuth from './useAuth';

describe('useAuth', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
  
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });
  
  it('should handle login errors', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrong');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Integration Tests

Example: Testing API endpoints

```javascript
// authRoutes.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { setupTestDB, teardownTestDB } = require('../testUtils');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDB();
  });
  
  afterAll(async () => {
    await teardownTestDB();
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: 'student'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });
    
    it('should not register duplicate email', async () => {
      await User.create({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      });
      
      await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User'
        })
        .expect(400);
    });
  });
  
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

## CI/CD Integration

### Automated Testing in CI

Tests run automatically in GitHub Actions:

1. **On Pull Requests**: All tests must pass before merging
2. **On Push to main/develop**: Ensures main branch is always passing
3. **Scheduled**: Weekly dependency checks

### CI Test Configuration

```yaml
# From .github/workflows/ci.yml
- name: Run backend tests
  working-directory: ./backend
  run: npm test
  
- name: Build frontend
  working-directory: ./frontend
  run: npm run build
```

### Test Requirements for PR Approval

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Build succeeds
- ✅ No linting errors
- ✅ Security audit passes

## Test Coverage

### Current Coverage Goals

- **Backend**: 70%+ coverage
- **Frontend**: 60%+ coverage
- **Critical paths**: 90%+ coverage

### Viewing Coverage Reports

```bash
# Backend coverage
cd backend
npm test -- --coverage

# Open coverage report
open coverage/lcov-report/index.html
```

```bash
# Frontend coverage
cd frontend
npm test -- --coverage

# Open coverage report
open coverage/index.html
```

### What to Test

#### High Priority (Must Test)
- Authentication and authorization
- Data validation and sanitization
- Payment processing (if applicable)
- User data operations (CRUD)
- Security-critical functions
- API endpoints

#### Medium Priority (Should Test)
- Business logic
- Data transformations
- Form validations
- Error handling
- UI components with logic

#### Low Priority (Nice to Test)
- Simple utility functions
- Pure presentational components
- Static content

### What Not to Test

- Third-party libraries
- Framework internals
- Simple getters/setters
- Configuration files
- Constants

## Test Best Practices

### General Principles

1. **AAA Pattern**: Arrange, Act, Assert
   ```javascript
   it('should do something', () => {
     // Arrange - Set up test data
     const input = { ... };
     
     // Act - Execute the function
     const result = myFunction(input);
     
     // Assert - Verify the result
     expect(result).toBe(expected);
   });
   ```

2. **Test One Thing**: Each test should verify one behavior
3. **Clear Names**: Test names should describe what they test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep tests fast to encourage frequent running

### Naming Conventions

```javascript
describe('ComponentName or FunctionName', () => {
  describe('methodName or scenario', () => {
    it('should behave in specific way when condition', () => {
      // Test implementation
    });
  });
});
```

Examples:
- ✅ `it('should return 401 when password is incorrect')`
- ✅ `it('should create user when all fields are valid')`
- ❌ `it('test login')` (too vague)
- ❌ `it('works')` (not descriptive)

### Mocking

Use mocks for:
- External APIs
- Database calls
- File system operations
- Time-dependent code

```javascript
// Mock external service
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

// Mock date
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));
```

## Troubleshooting Tests

### Common Issues

#### Tests Timeout

```javascript
// Increase timeout for slow tests
it('should complete slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

#### Database Connection Issues

```javascript
// Ensure proper setup/teardown
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});
```

#### Flaky Tests

- Avoid race conditions
- Use proper async/await
- Don't rely on timing
- Mock external dependencies

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Future Testing Enhancements

- [ ] Add E2E tests with Playwright
- [ ] Set up visual regression testing
- [ ] Add performance testing
- [ ] Implement contract testing for APIs
- [ ] Add mutation testing
- [ ] Set up code coverage reporting in CI
- [ ] Add load testing
