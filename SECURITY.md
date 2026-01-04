# Security Guide

This document outlines security practices, policies, and guidelines for UniFreelance.

## Table of Contents

- [Security Policy](#security-policy)
- [Reporting Security Issues](#reporting-security-issues)
- [Security Features](#security-features)
- [Best Practices](#best-practices)
- [Security Scanning](#security-scanning)
- [Common Vulnerabilities](#common-vulnerabilities)

## Security Policy

### Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Security Updates

- Security patches are released as soon as possible
- Critical vulnerabilities are addressed within 24-48 hours
- Users are notified via GitHub Security Advisories

## Reporting Security Issues

**⚠️ DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly:

1. **Email**: Send details to the repository maintainers (check GitHub profile)
2. **GitHub Security**: Use GitHub's private security advisory feature
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Updates**: Regular status updates
- **Resolution**: Fix timeline based on severity
- **Credit**: Public acknowledgment (if desired)

## Security Features

### Authentication & Authorization

#### JWT-based Authentication

```javascript
// JWT tokens with expiration
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);
```

**Best Practices:**
- Use strong, unique JWT secrets (32+ characters)
- Set appropriate token expiration times
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies for web)

#### Role-Based Access Control (RBAC)

```javascript
// Middleware for role checking
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }
    next();
  };
};

// Usage
router.post('/admin/users', 
  authenticate, 
  authorize('admin'), 
  createUser
);
```

### Password Security

#### Password Hashing

```javascript
// Using bcrypt with appropriate cost factor
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Password Validation

```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
  throw new Error('Password does not meet requirements');
}
```

### Input Validation & Sanitization

#### Express Validator

```javascript
const { body, validationResult } = require('express-validator');

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process registration
  }
);
```

#### XSS Prevention

```javascript
// Sanitize HTML input
const sanitizeHtml = require('sanitize-html');

const cleanContent = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href']
  }
});
```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

### Security Headers

#### Helmet.js

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### Custom Headers (nginx)

```nginx
# In nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Best Practices

### Environment Variables

**❌ Never commit:**
```bash
# .env (DO NOT COMMIT)
JWT_SECRET=my-secret-key
DATABASE_URL=mongodb://user:pass@localhost:27017/db
API_KEY=1234567890
```

**✅ Use .env.example:**
```bash
# .env.example (Safe to commit)
JWT_SECRET=change-this-to-a-secure-random-string
DATABASE_URL=mongodb://localhost:27017/mydb
API_KEY=your-api-key-here
```

### Secrets Management

**Development:**
- Use `.env` files (gitignored)
- Never share secrets in chat/email
- Rotate secrets regularly

**Production:**
- Use environment variables
- Use cloud secret managers:
  - AWS Secrets Manager
  - Azure Key Vault
  - Google Cloud Secret Manager
  - HashiCorp Vault

### Database Security

#### MongoDB

```javascript
// Use connection string with authentication
const mongoUri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

// Mongoose schema with sanitization
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'client', 'admin'],
    default: 'student'
  }
});
```

#### Query Injection Prevention

```javascript
// ❌ Vulnerable to injection
const user = await User.findOne({ email: req.body.email });

// ✅ Use parameterized queries
const user = await User.findOne({ 
  email: req.body.email 
}).select('-password'); // Exclude sensitive fields
```

### File Upload Security

```javascript
const multer = require('multer');
const path = require('path');

// Whitelist file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Limit file size
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});
```

### API Security

#### Request Validation

```javascript
// Validate all inputs
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};
```

#### Error Handling

```javascript
// ❌ Don't expose internal errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message); // Exposes details
});

// ✅ Generic error messages
app.use((err, req, res, next) => {
  console.error(err); // Log internally
  res.status(500).json({
    error: 'An error occurred processing your request'
  });
});
```

### Logging Security

```javascript
// ❌ Don't log sensitive data
logger.info(`User login: ${email}, password: ${password}`);

// ✅ Log safely
logger.info(`User login attempt: ${email}`);
logger.debug(`Login successful: userId=${userId}`);
```

## Security Scanning

### Automated Security Checks

Our CI/CD pipeline includes:

1. **npm audit**: Checks for known vulnerabilities in dependencies
2. **Trivy**: Scans for vulnerabilities in code and Docker images
3. **CodeQL**: Analyzes code for security issues
4. **Dependency Review**: Weekly checks for outdated packages

### Running Security Scans Locally

```bash
# Backend security audit
cd backend
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force

# Frontend security audit
cd frontend
npm audit
npm audit fix
```

### Trivy Scanning

```bash
# Scan Docker image
docker build -t unifreelance-backend .
trivy image unifreelance-backend

# Scan filesystem
trivy fs .
```

## Common Vulnerabilities

### SQL/NoSQL Injection

**Vulnerable Code:**
```javascript
// ❌ String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**Secure Code:**
```javascript
// ✅ Parameterized queries
const user = await User.findOne({ email });
```

### Cross-Site Scripting (XSS)

**Vulnerable Code:**
```javascript
// ❌ Directly rendering user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Secure Code:**
```javascript
// ✅ React automatically escapes
<div>{userInput}</div>

// Or sanitize HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

### Cross-Site Request Forgery (CSRF)

**Protection:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### Insecure Direct Object References (IDOR)

**Vulnerable Code:**
```javascript
// ❌ No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

**Secure Code:**
```javascript
// ✅ Verify ownership
app.get('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

## Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Validate and sanitize all user inputs
- [ ] Use parameterized queries
- [ ] Implement proper authentication
- [ ] Use HTTPS in production
- [ ] Set security headers
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Handle errors securely
- [ ] Keep dependencies updated

### Deployment

- [ ] Change default credentials
- [ ] Use strong passwords
- [ ] Enable firewall
- [ ] Restrict database access
- [ ] Use SSL/TLS certificates
- [ ] Implement monitoring
- [ ] Set up backups
- [ ] Configure CORS properly
- [ ] Disable debug mode
- [ ] Remove development tools

### Maintenance

- [ ] Regular security updates
- [ ] Monitor security advisories
- [ ] Audit access logs
- [ ] Review user permissions
- [ ] Test backups regularly
- [ ] Conduct security reviews
- [ ] Update documentation

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Contact

For security concerns, please contact the maintainers through:
- GitHub Security Advisories
- Direct message to repository owner

**Remember: Security is everyone's responsibility!** 🔒
