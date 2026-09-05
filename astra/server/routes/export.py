from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from astra.services.attribution_pipeline import attribution_pipeline
from astra.dacs.engine import dacs_engine
from astra.pillars.infra_scan import infra_scanner
from astra.pillars.mgrd import mgrd_analyzer
from astra.pillars.cmtbp import cmtbp_tracer
from astra.pillars.caa import caa_profiler
from astra.exporters.stix_export import Stix21Exporter
from astra.exporters.dossier import ForensicDossierExporter

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/stix/{actor_id}")
def export_stix(actor_id: str):
    actors = attribution_pipeline.run_attribution()
    match = next((a for a in actors if a.actor_id == actor_id or a.primary_alias.lower() == actor_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail="Actor not found")

    report = dacs_engine.fuse_signals(
        case_id=match.actor_id,
        target_persona=match.primary_alias,
        infra_result=infra_scanner.scan_target(f"{match.primary_alias}.onion"),
        mgrd_result=mgrd_analyzer.analyze_migration_residue(match.primary_alias, [al["platform"] for al in match.aliases], match.pgp_keys),
        cmtbp_result=cmtbp_tracer.analyze_wallet_transactions(match.wallets[0] if match.wallets else "bc1q000"),
        caa_result=caa_profiler.compare_samples("sample a", "sample b")
    )
    bundle = Stix21Exporter.generate_bundle(report)
    return JSONResponse(content=bundle)

@router.get("/dossier/markdown/{actor_id}", response_class=PlainTextResponse)
def export_markdown_dossier(actor_id: str):
    actors = attribution_pipeline.run_attribution()
    match = next((a for a in actors if a.actor_id == actor_id or a.primary_alias.lower() == actor_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail="Actor not found")

    report = dacs_engine.fuse_signals(
        case_id=match.actor_id,
        target_persona=match.primary_alias,
        infra_result=infra_scanner.scan_target(f"{match.primary_alias}.onion"),
        mgrd_result=mgrd_analyzer.analyze_migration_residue(match.primary_alias, [al["platform"] for al in match.aliases], match.pgp_keys),
        cmtbp_result=cmtbp_tracer.analyze_wallet_transactions(match.wallets[0] if match.wallets else "bc1q000"),
        caa_result=caa_profiler.compare_samples("sample a", "sample b")
    )
    return ForensicDossierExporter.generate_markdown_brief(report)
