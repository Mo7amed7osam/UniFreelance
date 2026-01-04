# UniFreelance

UniFreelance is a student-focused freelancing marketplace that connects students with clients looking for freelance work. The platform features skill-based video interviews to verify student skills, ensuring that clients can find qualified candidates for their job postings.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
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

- **Frontend**: React (TypeScript)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **API Architecture**: RESTful API

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Clone the Repository

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