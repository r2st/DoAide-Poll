# DoAide Poll

Free poll and survey creator at [poll.doaide.com](https://poll.doaide.com).

## Features

- **Quick Polls** — Create a poll in 15 seconds: question, options, share
- **Survey Builder** — Multiple choice, text input, ratings, yes/no
- **Live Results** — Animated bar/pie charts, percentage breakdown
- **Share Everywhere** — WhatsApp, Twitter, LinkedIn, copy link
- **Embed Widget** — Drop polls into any website with iframe code
- **CSV Export** — Download results as spreadsheet
- **No Login Required** — 100% free, no account needed

## Architecture

- **Backend**: Python FastAPI + SQLite (aiosqlite)
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Server**: 89.167.8.178
- **Ports**: API 3061, Web 3062

## Development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 3061 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

1. Copy project to `/opt/DoAide-Poll/` on server
2. Set up backend venv and install requirements
3. Build frontend: `cd frontend && npm run build`
4. Copy systemd services from `deploy/` to `/etc/systemd/system/`
5. Copy nginx config from `deploy/` to `/etc/nginx/sites-enabled/`
6. Enable and start services:

```bash
sudo systemctl enable doaide-poll-api doaide-poll-web
sudo systemctl start doaide-poll-api doaide-poll-web
sudo systemctl reload nginx
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/polls` | Create poll |
| GET | `/api/polls/{id}` | Get poll |
| POST | `/api/polls/{id}/vote` | Submit vote |
| GET | `/api/polls/{id}/results` | Get results |
| GET | `/api/polls/{id}/export` | Export CSV |
