# shared.py — يشاور على interview/database.py
from interview.database import sessions_store, answers_store, answers_lock

__all__ = ["sessions_store", "answers_store", "answers_lock"]
