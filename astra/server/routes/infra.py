from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from astra.pillars.infra_scan import infra_scanner

router = APIRouter(prefix="/infra", tags=["infrastructure"])

class ScanRequest(BaseModel):
    target: str
    port: int = 443
    mock_data: Optional[Dict[str, Any]] = None

@router.post("/scan")
def trigger_infra_scan(req: ScanRequest):
    res = infra_scanner.scan_target(req.target, port=req.port, mock_data=req.mock_data)
    return res

@router.get("/findings")
def list_global_findings():
    targets = [
        ("vektor7darkops3xyz.onion", {"san_list": ["vektor7darkops3xyz.onion", "auth.vektor-ops.ru", "185.220.101.5"], "leaked_ips": ["185.220.101.5"]}),
        ("krypton5store2abc.onion", {"san_list": ["krypton5store2abc.onion", "krypton-labs.cc"]}),
        ("phantom9broker4market.onion", {"san_list": ["phantom9broker4market.onion"]}),
        ("cerberus8leaksnode.onion", {"san_list": ["cerberus8leaksnode.onion", "194.26.29.114"], "leaked_ips": ["194.26.29.114"]})
    ]
    results = []
    for onion, mock in targets:
        res = infra_scanner.scan_target(onion, mock_data=mock)
        results.append(res)
    return results
