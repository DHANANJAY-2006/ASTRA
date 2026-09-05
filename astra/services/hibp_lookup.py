import json
from pathlib import Path
from typing import Optional, List
from urllib.parse import quote
from pydantic import BaseModel
import httpx

from astra.config import settings

class HibpLookupResult(BaseModel):
    configured: bool
    email: str
    breach_names: List[str] = []
    error: Optional[str] = None

class HibpService:
    def __init__(self, offline_catalog_path: Optional[Path] = None):
        self.offline_catalog_path = offline_catalog_path or Path("./data/breach_records.json")
        self._offline_map = {}
        self._load_offline()

    def _load_offline(self):
        if self.offline_catalog_path.exists():
            try:
                with open(self.offline_catalog_path, "r", encoding="utf-8") as f:
                    records = json.load(f)
                    for r in records:
                        if "email" in r:
                            self._offline_map[r["email"].lower()] = r.get("breaches", [])
            except Exception:
                pass

    def check_email(self, email: str) -> HibpLookupResult:
        clean_email = email.strip().lower()
        api_key = getattr(settings, "hibp_api_key", None)

        if not api_key:
            if clean_email in self._offline_map:
                return HibpLookupResult(
                    configured=False,
                    email=email,
                    breach_names=self._offline_map[clean_email],
                    error=None
                )
            return HibpLookupResult(
                configured=False,
                email=email,
                breach_names=[],
                error="HIBP API key not configured; checked local forensic cache"
            )

        try:
            url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{quote(clean_email, safe='')}"
            resp = httpx.get(
                url,
                headers={"hibp-api-key": api_key, "User-Agent": "ASTRA-Forensic-Engine"},
                params={"truncateResponse": "true"},
                timeout=10.0
            )
            if resp.status_code == 404:
                return HibpLookupResult(configured=True, email=email, breach_names=[])
            if not resp.is_success:
                return HibpLookupResult(configured=True, email=email, error=f"HTTP {resp.status_code}")

            breaches = resp.json()
            return HibpLookupResult(
                configured=True,
                email=email,
                breach_names=[b.get("Name", "") for b in breaches]
            )
        except Exception as e:
            return HibpLookupResult(configured=True, email=email, error=str(e))

hibp_service = HibpService()
