# Quick Start Guide

Get UniFreelance up and running in minutes!

## Prerequisites Check

Before you begin, ensure you have:

- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] 2GB+ free disk space
- [ ] Internet connection

Don't have Docker? [Install Docker Desktop](https://www.docker.com/products/docker-desktop)

## 3-Step Quick Start

### Step 1: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/Mo7amed7osam/UniFreelance.git
cd UniFreelance

# Create environment file
cp .env.example .env
```

### Step 2: Start the Application

```bash
# Start all services (MongoDB, Backend, Frontend)
docker compose up -d

# This will:
# - Pull required Docker images
# - Start MongoDB database
# - Start backend API server
# - Start frontend web server
```

### Step 3: Access the Application

Open your browser and navigate to:

- **Frontend Application**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

That's it! 🎉 UniFreelance is now running!

## Verify Installation

Check that all services are running:

```bash
docker compose ps
```

You should see:
```
NAME                        STATUS
unifreelance-backend        Up
unifreelance-frontend       Up
unifreelance-mongodb        Up (healthy)
```

### Test the Health Endpoints

```bash
# Test backend health
curl http://localhost:5000/health

# Test frontend health
curl http://localhost/health
```

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose up -d --build
```

## Default Credentials

The application starts with these default values (from `.env` file):

- **MongoDB Username**: admin
- **MongoDB Password**: password
- **JWT Secret**: your-secret-key-change-this

⚠️ **Security Warning**: Change these values in production!

## Next Steps

### For Users

1. **Register an account** at http://localhost
2. **Choose your role**: Student or Client
3. **Complete your profile**
4. **Start exploring!**

### For Developers

1. **Read the [Contributing Guide](CONTRIBUTING.md)**
2. **Check out the [CI/CD Documentation](CICD.md)**
3. **Review the [Deployment Guide](DEPLOYMENT.md)**
4. **Explore the codebase**:
   - Backend: `./backend/src/`
   - Frontend: `./frontend/src/`

## Development Mode

For development with hot-reload:

### Backend Development

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000 with auto-reload

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173 with hot-reload

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :80    # Frontend
lsof -i :5000  # Backend
lsof -i :27017 # MongoDB

# Kill the process or change the port in docker-compose.yml
```

### Services Won't Start

```bash
# Check Docker is running
docker ps

# View detailed logs
docker compose logs

# Reset everything
docker compose down -v
docker compose up -d
```

### Cannot Connect to Backend

1. Check backend is running: `docker compose ps`
2. Check backend logs: `docker compose logs backend`
3. Verify MongoDB is healthy: `docker compose ps mongodb`
4. Test health endpoint: `curl http://localhost:5000/health`

### Database Connection Errors

```bash
# Restart MongoDB
docker compose restart mongodb

# Check MongoDB logs
docker compose logs mongodb

# Verify MongoDB is healthy
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## Resource Usage

Expected resource usage:

- **RAM**: ~500MB - 1GB
- **Disk**: ~500MB for images + data
- **CPU**: Minimal when idle

## Uninstall

To completely remove UniFreelance:

```bash
# Stop and remove containers, volumes, and networks
cd UniFreelance
docker compose down -v

# Remove Docker images (optional)
docker rmi unifreelance-backend unifreelance-frontend

# Remove cloned repository
cd ..
rm -rf UniFreelance
```

## Getting Help

- **Documentation Issues**: Check [README.md](README.md)
- **Deployment Help**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Bug Reports**: [Open an issue](https://github.com/Mo7amed7osam/UniFreelance/issues)
- **Questions**: Check [existing issues](https://github.com/Mo7amed7osam/UniFreelance/issues)

## Success Checklist

- [x] Cloned repository
- [x] Created `.env` file
- [x] Started services with `docker compose up -d`
- [x] Verified services are running
- [x] Accessed frontend at http://localhost
- [x] Tested backend API at http://localhost:5000

Congratulations! You're ready to use UniFreelance! 🚀
