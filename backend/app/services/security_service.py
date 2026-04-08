from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, Request

from ..config import (
    API_KEY_HEADER,
    API_KEY_VALUE,
    ENABLE_API_KEY_AUTH,
    ENABLE_RATE_LIMIT,
    RATE_LIMIT_PER_MINUTE,
)


class SecurityService:
    def __init__(self):
        self._request_windows = defaultdict(lambda: deque())

    def check_api_key(self, request: Request):
        if not ENABLE_API_KEY_AUTH:
            return
        token = request.headers.get(API_KEY_HEADER, "")
        if not API_KEY_VALUE or token != API_KEY_VALUE:
            raise HTTPException(status_code=401, detail="Unauthorized: invalid API key")

    def check_rate_limit(self, request: Request):
        if not ENABLE_RATE_LIMIT:
            return
        ip = request.client.host if request.client else "unknown"
        route = request.url.path
        key = f"{ip}:{route}"

        now = datetime.now(timezone.utc)
        window_start = now - timedelta(minutes=1)
        bucket = self._request_windows[key]
        while bucket and bucket[0] < window_start:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        bucket.append(now)


security_service = SecurityService()
