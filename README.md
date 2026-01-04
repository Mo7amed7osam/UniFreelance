# UniFreelance

[![CI Pipeline](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/ci.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/cd.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/cd.yml)
[![PR Checks](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/Mo7amed7osam/UniFreelance/actions/workflows/pr-checks.yml)

UniFreelance is a student-focused freelancing marketplace that connects students with clients looking for freelance work. The platform features skill-based video interviews to verify student skills, ensuring that clients can find qualified candidates for their job postings.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Quick Start with Docker](#quick-start-with-docker)
  - [Manual Setup](#manual-setup)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Role-based access for Students, Clients, and Admins.
- **Student Dashboard**: Students can create profiles, browse jobs, and submit proposals.
- **Skill Verification**: Students can verify their skills through mandatory video interviews.
- **Admin Dashboard**: Admins can review interviews, assign scores, and manage users.
- **Job Posting**: Clients can post jobs and view applicants.
- **Smart Matching**: Automatic notifications for students when jobs matching their skills are posted.

## Technologies

- **Frontend**: React (TypeScript), Vite, TailwindCSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **API Architecture**: RESTful API
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Docker & Docker Compose (optional, for containerized setup)
- Git

### Quick Start with Docker

The fastest way to get started is using Docker Compose:

1. Clone the repository:

   ```bash
   git clone https://github.com/Mo7amed7osam/UniFreelance.git
   cd UniFreelance
   ```

2. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration (change passwords and secrets).

4. Start all services:

   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

6. To stop all services:

   ```bash
   docker-compose down
   ```

### Manual Setup

#### Clone the Repository

```bash
git clone https://github.com/yourusername/UniFreelance.git
cd UniFreelance
```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and configure your environment variables.

4. Start the backend server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend application:

   ```bash
   npm start
   ```

## Deployment

### Using Docker

The application includes Docker configurations for easy deployment:

1. **Build Docker Images**:

   ```bash
   # Build backend image
   docker build -t unifreelance-backend ./backend

   # Build frontend image
   docker build -t unifreelance-frontend ./frontend
   ```

2. **Run with Docker Compose**:

   ```bash
   docker-compose up -d
   ```

### CI/CD Pipeline

This project includes a fully automated CI/CD pipeline using GitHub Actions:

#### Continuous Integration (CI)

The CI pipeline runs automatically on push and pull requests to `main` and `develop` branches:

- **Backend CI**: 
  - Tests on Node.js 18.x and 20.x
  - Runs unit tests
  - Validates code integrity

- **Frontend CI**: 
  - Tests on Node.js 18.x and 20.x
  - Builds production bundle
  - Uploads build artifacts

- **Security Scan**: 
  - NPM security audit for both frontend and backend
  - Trivy vulnerability scanner
  - SARIF results uploaded to GitHub Security

- **Code Quality**: 
  - Code style checks
  - Quality metrics

#### Continuous Deployment (CD)

The CD pipeline runs automatically on push to `main` branch:

- **Docker Image Building**: 
  - Builds and pushes Docker images to GitHub Container Registry
  - Separate images for backend and frontend
  - Tagged with branch name, commit SHA, and `latest`

- **Automated Deployment**: 
  - Images are automatically built and published
  - Ready for deployment to any container orchestration platform

#### Pull Request Checks

Automated checks on every pull request:

- Validates commit messages
- Checks for sensitive files
- Runs lint checks
- Executes test suite
- Auto-labels PRs based on changed files

#### Dependency Management

Weekly automated dependency reviews:

- Checks for outdated packages
- Security vulnerability scanning
- Runs every Monday at 9 AM UTC

### Manual Deployment

For manual deployment to a server:

1. Copy the `docker-compose.yml` and `.env` files to your server
2. Update the `.env` file with production values
3. Run `docker-compose up -d`
4. Set up a reverse proxy (nginx/traefik) for HTTPS

## Usage

- Access the application in your browser at `http://localhost:3000`.
- Register as a student or client to start using the platform.
- Admins can log in to manage users and review interviews.

## API Endpoints

- **Authentication**
  - `POST /auth/register`: Register a new user.
  - `POST /auth/login`: Log in a user.

- **Skills**
  - `GET /skills`: Retrieve available skills.
  - `POST /skills/:skillId/interview/start`: Start a skill verification interview.
  - `POST /skills/:skillId/interview/upload`: Upload interview video.

- **Jobs**
  - `POST /jobs`: Post a new job.
  - `GET /jobs`: Retrieve job listings.
  - `POST /jobs/:id/proposals`: Submit a proposal for a job.

- **Admin**
  - `POST /admin/review/:interviewId`: Review a student's interview.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.