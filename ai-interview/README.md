# AI Interview Tooling

This folder contains the standalone Python AI interview tooling that was added separately from the main Shaghalny marketplace stack.

## Contents

- `main.py`: FastAPI entry point for the interview server
- `interview.py`: CLI entry point for interactive interview flow
- `interview/`: interview engine and shared session state
- `voice/`: voice capture and speech-to-text helpers
- `stt/`: alternate speech-to-text interviewer flow
- `camera/`: camera-based interview monitoring
- `comp-vision/`: separate computer-vision monitoring prototype
- `web/`: FastAPI server module
- `.env.example`: environment template for this Python tooling

## Notes

- This tooling is separate from the main `frontend/` + `backend/` marketplace app.
- Main marketplace local startup remains in root `docker-compose.yml`.
- Runtime artifacts such as `interview.db`, `interview_log.txt`, and `state.json` stay in this folder.
