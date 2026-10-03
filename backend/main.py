import uuid
import csv
import io
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional

import aiosqlite
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

DATABASE = "polls.db"


async def init_db():
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS polls (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                poll_type TEXT NOT NULL DEFAULT 'poll',
                choice_type TEXT NOT NULL DEFAULT 'single',
                allow_other INTEGER NOT NULL DEFAULT 0,
                duplicate_prevention TEXT NOT NULL DEFAULT 'none',
                end_date TEXT,
                created_at TEXT NOT NULL,
                total_votes INTEGER NOT NULL DEFAULT 0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poll_id TEXT NOT NULL,
                option_text TEXT NOT NULL,
                option_type TEXT NOT NULL DEFAULT 'choice',
                required INTEGER NOT NULL DEFAULT 0,
                position INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (poll_id) REFERENCES polls(id)
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poll_id TEXT NOT NULL,
                option_id INTEGER,
                text_value TEXT,
                rating_value INTEGER,
                voter_ip TEXT,
                voted_at TEXT NOT NULL,
                FOREIGN KEY (poll_id) REFERENCES polls(id),
                FOREIGN KEY (option_id) REFERENCES options(id)
            )
        """)
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_options_poll ON options(poll_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_votes_poll ON votes(poll_id)"
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option_id)"
        )
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="DoAide Poll API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptionCreate(BaseModel):
    text: str
    option_type: str = "choice"
    required: bool = False
    position: int = 0


class PollCreate(BaseModel):
    title: str
    description: str = ""
    poll_type: str = "poll"
    choice_type: str = "single"
    allow_other: bool = False
    duplicate_prevention: str = "none"
    end_date: Optional[str] = None
    options: list[OptionCreate]


class VoteItem(BaseModel):
    option_id: Optional[int] = None
    text_value: Optional[str] = None
    rating_value: Optional[int] = None


class VoteCreate(BaseModel):
    votes: list[VoteItem]


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.get("/health")
async def health():
    return {"status": "ok", "service": "doaide-poll"}


@app.post("/api/polls")
async def create_poll(poll: PollCreate):
    poll_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(DATABASE) as db:
        await db.execute(
            """INSERT INTO polls (id, title, description, poll_type, choice_type,
               allow_other, duplicate_prevention, end_date, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                poll_id,
                poll.title,
                poll.description,
                poll.poll_type,
                poll.choice_type,
                1 if poll.allow_other else 0,
                poll.duplicate_prevention,
                poll.end_date,
                now,
            ),
        )
        for i, opt in enumerate(poll.options):
            await db.execute(
                """INSERT INTO options (poll_id, option_text, option_type, required, position)
                   VALUES (?, ?, ?, ?, ?)""",
                (poll_id, opt.text, opt.option_type, 1 if opt.required else 0, i),
            )
        await db.commit()

    return {"id": poll_id, "url": f"/poll/{poll_id}"}


@app.get("/api/polls/{poll_id}")
async def get_poll(poll_id: str):
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM polls WHERE id = ?", (poll_id,))
        poll = await cursor.fetchone()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")

        cursor = await db.execute(
            "SELECT * FROM options WHERE poll_id = ? ORDER BY position", (poll_id,)
        )
        options = await cursor.fetchall()

        return {
            "id": poll["id"],
            "title": poll["title"],
            "description": poll["description"],
            "poll_type": poll["poll_type"],
            "choice_type": poll["choice_type"],
            "allow_other": bool(poll["allow_other"]),
            "duplicate_prevention": poll["duplicate_prevention"],
            "end_date": poll["end_date"],
            "created_at": poll["created_at"],
            "total_votes": poll["total_votes"],
            "options": [
                {
                    "id": o["id"],
                    "text": o["option_text"],
                    "type": o["option_type"],
                    "required": bool(o["required"]),
                    "position": o["position"],
                }
                for o in options
            ],
        }


@app.post("/api/polls/{poll_id}/vote")
async def vote(poll_id: str, vote_data: VoteCreate, request: Request):
    client_ip = get_client_ip(request)
    now = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM polls WHERE id = ?", (poll_id,))
        poll = await cursor.fetchone()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")

        if poll["end_date"]:
            try:
                end = datetime.fromisoformat(poll["end_date"]).replace(
                    tzinfo=timezone.utc
                )
                if datetime.now(timezone.utc) > end:
                    raise HTTPException(status_code=400, detail="Poll has ended")
            except ValueError:
                pass

        if poll["duplicate_prevention"] == "ip":
            cursor = await db.execute(
                "SELECT 1 FROM votes WHERE poll_id = ? AND voter_ip = ?",
                (poll_id, client_ip),
            )
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="Already voted")

        for v in vote_data.votes:
            await db.execute(
                """INSERT INTO votes (poll_id, option_id, text_value, rating_value, voter_ip, voted_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (poll_id, v.option_id, v.text_value, v.rating_value, client_ip, now),
            )

        await db.execute(
            "UPDATE polls SET total_votes = total_votes + 1 WHERE id = ?", (poll_id,)
        )
        await db.commit()

    return {"success": True}


@app.get("/api/polls/{poll_id}/results")
async def get_results(poll_id: str):
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM polls WHERE id = ?", (poll_id,))
        poll = await cursor.fetchone()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")

        cursor = await db.execute(
            "SELECT * FROM options WHERE poll_id = ? ORDER BY position", (poll_id,)
        )
        options = await cursor.fetchall()

        results = []
        total_option_votes = 0
        for opt in options:
            cursor = await db.execute(
                "SELECT COUNT(*) as cnt FROM votes WHERE option_id = ?", (opt["id"],)
            )
            row = await cursor.fetchone()
            count = row["cnt"]
            total_option_votes += count
            results.append(
                {
                    "option_id": opt["id"],
                    "text": opt["option_text"],
                    "type": opt["option_type"],
                    "votes": count,
                }
            )

        cursor = await db.execute(
            """SELECT text_value, COUNT(*) as cnt FROM votes
               WHERE poll_id = ? AND option_id IS NULL AND text_value IS NOT NULL
               GROUP BY text_value ORDER BY cnt DESC""",
            (poll_id,),
        )
        other_votes = await cursor.fetchall()

        for r in results:
            r["percentage"] = (
                round(r["votes"] / total_option_votes * 100, 1)
                if total_option_votes > 0
                else 0
            )

        cursor = await db.execute(
            """SELECT rating_value, COUNT(*) as cnt FROM votes
               WHERE poll_id = ? AND rating_value IS NOT NULL
               GROUP BY rating_value ORDER BY rating_value""",
            (poll_id,),
        )
        ratings = [
            {"rating": r["rating_value"], "count": r["cnt"]}
            for r in await cursor.fetchall()
        ]

        cursor = await db.execute(
            """SELECT text_value FROM votes
               WHERE poll_id = ? AND text_value IS NOT NULL AND option_id IS NULL
               ORDER BY voted_at DESC""",
            (poll_id,),
        )
        text_responses = [r["text_value"] for r in await cursor.fetchall()]

        return {
            "poll_id": poll_id,
            "title": poll["title"],
            "total_votes": poll["total_votes"],
            "options": results,
            "other_votes": [
                {"text": o["text_value"], "votes": o["cnt"]} for o in other_votes
            ],
            "ratings": ratings,
            "text_responses": text_responses,
        }


@app.get("/api/polls/{poll_id}/export")
async def export_csv(poll_id: str):
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM polls WHERE id = ?", (poll_id,))
        poll = await cursor.fetchone()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")

        cursor = await db.execute(
            "SELECT * FROM options WHERE poll_id = ? ORDER BY position", (poll_id,)
        )
        options = {o["id"]: o["option_text"] for o in await cursor.fetchall()}

        cursor = await db.execute(
            "SELECT * FROM votes WHERE poll_id = ? ORDER BY voted_at", (poll_id,)
        )
        votes = await cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Vote #", "Option", "Text Response", "Rating", "Voted At"])
        for i, v in enumerate(votes, 1):
            option_text = options.get(v["option_id"], "") if v["option_id"] else ""
            writer.writerow(
                [
                    i,
                    option_text,
                    v["text_value"] or "",
                    v["rating_value"] or "",
                    v["voted_at"],
                ]
            )

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="poll-{poll_id}-results.csv"'
            },
        )
