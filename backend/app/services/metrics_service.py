from collections import defaultdict, deque
from datetime import datetime, timezone
from statistics import mean


class MetricsService:
    def __init__(self):
        self._counters = defaultdict(int)
        self._latency_ms = defaultdict(lambda: deque(maxlen=1000))
        self._risk_probabilities = deque(maxlen=5000)

    def incr(self, name: str, value: int = 1):
        self._counters[name] += value

    def observe_latency(self, route: str, ms: float):
        self._latency_ms[route].append(float(ms))

    def observe_risk_probability(self, risk_probability: float):
        self._risk_probabilities.append(float(risk_probability))

    def snapshot(self):
        latency_summary = {}
        for route, values in self._latency_ms.items():
            if not values:
                continue
            latency_summary[route] = {
                "count": len(values),
                "avg_ms": round(mean(values), 2),
                "max_ms": round(max(values), 2),
            }

        risk_summary = {
            "count": len(self._risk_probabilities),
            "avg_risk_probability": round(mean(self._risk_probabilities), 4) if self._risk_probabilities else None,
            "max_risk_probability": round(max(self._risk_probabilities), 4) if self._risk_probabilities else None,
        }

        return {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "counters": dict(self._counters),
            "latency": latency_summary,
            "risk_distribution_summary": risk_summary,
        }


metrics_service = MetricsService()
