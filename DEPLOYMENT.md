# Deployment Guide

This guide covers various deployment strategies for UniFreelance.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Deployment](#local-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ and npm (for manual deployment)
- MongoDB 7.0+ (local or cloud instance)
- Git

## Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Critical: Change these values for production
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_secure_mongo_password
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars
```

### Important Security Notes

- **Never commit the `.env` file to version control**
- Use strong, unique passwords for all services
- Generate a secure JWT secret (minimum 32 characters)
- In production, use environment variables or a secrets manager

## Local Deployment

### Quick Start with Docker

The easiest way to run the entire stack:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (caution: deletes data)
docker compose down -v
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Manual Deployment

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run build
npm run preview
```

## Docker Deployment

### Building Images

Build Docker images manually:

```bash
# Build backend
docker build -t unifreelance-backend:latest ./backend

# Build frontend
docker build -t unifreelance-frontend:latest ./frontend
```

### Running Containers

```bash
# Run MongoDB
docker run -d \
  --name unifreelance-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Run Backend
docker run -d \
  --name unifreelance-backend \
  -e MONGODB_URI=mongodb://admin:password@mongodb:27017/unifreelance?authSource=admin \
  -e JWT_SECRET=your-secret-key \
  -p 5000:5000 \
  --link unifreelance-mongodb:mongodb \
  unifreelance-backend:latest

# Run Frontend
docker run -d \
  --name unifreelance-frontend \
  -p 80:80 \
  --link unifreelance-backend:backend \
  unifreelance-frontend:latest
```

## Cloud Deployment

### Using GitHub Container Registry

The CI/CD pipeline automatically builds and pushes images to GitHub Container Registry (ghcr.io). You can pull and run these images:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/mo7amed7osam/unifreelance/backend:latest
docker pull ghcr.io/mo7amed7osam/unifreelance/frontend:latest

# Run with docker compose using remote images
docker compose up -d
```

### Deploy to Cloud Platforms

#### AWS ECS

1. Push images to Amazon ECR
2. Create ECS task definitions for each service
3. Set up an Application Load Balancer
4. Create ECS services

#### Google Cloud Run

```bash
# Deploy backend
gcloud run deploy unifreelance-backend \
  --image ghcr.io/mo7amed7osam/unifreelance/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy unifreelance-frontend \
  --image ghcr.io/mo7amed7osam/unifreelance/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Create resource group
az group create --name unifreelance-rg --location eastus

# Deploy backend
az container create \
  --resource-group unifreelance-rg \
  --name unifreelance-backend \
  --image ghcr.io/mo7amed7osam/unifreelance/backend:latest \
  --dns-name-label unifreelance-backend \
  --ports 5000

# Deploy frontend
az container create \
  --resource-group unifreelance-rg \
  --name unifreelance-frontend \
  --image ghcr.io/mo7amed7osam/unifreelance/frontend:latest \
  --dns-name-label unifreelance-frontend \
  --ports 80
```

#### Kubernetes

Create Kubernetes manifests:

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unifreelance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: unifreelance-backend
  template:
    metadata:
      labels:
        app: unifreelance-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/mo7amed7osam/unifreelance/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: unifreelance-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: unifreelance-secrets
              key: jwt-secret
```

Deploy:

```bash
kubectl apply -f k8s/
```

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes four automated workflows:

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

Runs on push and PR to `main` and `develop`:

- **Backend CI**: Tests on Node.js 18.x and 20.x
- **Frontend CI**: Builds and uploads artifacts
- **Security Scan**: NPM audit + Trivy vulnerability scanning
- **Code Quality**: Linting and style checks

#### 2. CD Pipeline (`.github/workflows/cd.yml`)

Runs on push to `main`:

- Builds Docker images for backend and frontend
- Pushes images to GitHub Container Registry
- Tags images with branch name, SHA, and `latest`
- Uses Docker layer caching for faster builds

#### 3. PR Checks (`.github/workflows/pr-checks.yml`)

Runs on all pull requests:

- Validates commit messages
- Checks for sensitive files
- Monitors PR size
- Runs linting and tests
- Auto-labels PRs based on files changed

#### 4. Dependency Updates (`.github/workflows/dependency-updates.yml`)

Runs weekly (Mondays at 9 AM UTC):

- Checks for outdated packages
- Runs security audits
- Reports vulnerabilities

### Setting Up CI/CD

1. **GitHub Secrets** (if deploying to external services):
   - Go to repository Settings → Secrets and variables → Actions
   - Add required secrets (e.g., cloud provider credentials)

2. **Container Registry Access**:
   - GitHub Container Registry is enabled by default
   - Images are published to `ghcr.io/USERNAME/unifreelance/`

3. **Workflow Permissions**:
   - Ensure workflows have permissions to write packages
   - Settings → Actions → General → Workflow permissions

## Monitoring and Maintenance

### Health Checks

Both backend and frontend include health check endpoints:

- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost/health`

### Logs

View Docker container logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Database Backup

Backup MongoDB data:

```bash
# Create backup
docker exec unifreelance-mongodb mongodump \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --out /backup

# Copy backup from container
docker cp unifreelance-mongodb:/backup ./mongodb-backup
```

Restore MongoDB data:

```bash
# Copy backup to container
docker cp ./mongodb-backup unifreelance-mongodb:/backup

# Restore
docker exec unifreelance-mongodb mongorestore \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  /backup
```

### Updating the Application

Pull latest changes and restart:

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Or rebuild from source
docker compose up -d --build
```

### Scaling Services

Scale services with Docker Compose:

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Note: You'll need a load balancer for multiple instances
```

### Troubleshooting

Common issues and solutions:

1. **Cannot connect to MongoDB**:
   - Check MongoDB is running: `docker compose ps`
   - Verify connection string in `.env`
   - Check MongoDB logs: `docker compose logs mongodb`

2. **Frontend cannot reach backend**:
   - Verify backend is running: `curl http://localhost:5000/health`
   - Check CORS settings in backend
   - Ensure `VITE_API_URL` is set correctly

3. **Permission issues with uploads**:
   - Ensure uploads directory exists: `mkdir -p backend/uploads`
   - Set correct permissions: `chmod 755 backend/uploads`

4. **Out of disk space**:
   - Clean up Docker: `docker system prune -a`
   - Remove old images: `docker image prune -a`
   - Remove unused volumes: `docker volume prune`

## Security Best Practices

1. **Use HTTPS in production** with Let's Encrypt or a cloud provider
2. **Set up a firewall** to restrict access to ports
3. **Regular updates**: Keep dependencies and base images updated
4. **Monitor security alerts**: Check GitHub security advisories
5. **Use secrets management**: AWS Secrets Manager, Azure Key Vault, etc.
6. **Enable rate limiting** on the backend API
7. **Set up monitoring**: Use tools like Prometheus, Grafana, or cloud-native solutions

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review CI/CD workflow logs for deployment failures
