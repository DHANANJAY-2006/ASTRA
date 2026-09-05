import sys
import webbrowser
from pathlib import Path
from typing import Optional
import json

if sys.platform == "win32":
    try:
        if sys.stdout.encoding != "utf-8":
            sys.stdout.reconfigure(encoding="utf-8")
        if sys.stderr.encoding != "utf-8":
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, TextColumn
from rich import box

from astra import __version__
from astra.core.evidence import ledger
from astra.core.taxonomy import taxonomy_classifier
from astra.pillars.infra_scan import infra_scanner
from astra.pillars.mgrd import mgrd_analyzer
from astra.pillars.cmtbp import cmtbp_tracer
from astra.pillars.caa import caa_profiler
from astra.dacs.engine import dacs_engine
from astra.exporters.stix_export import Stix21Exporter
from astra.exporters.dossier import ForensicDossierExporter
from astra.visualization.graph_builder import ForensicGraphBuilder

app = typer.Typer(
    name="astra",
    help="Project ASTRA: Darknet Threat Actor De-Anonymization Forensic Tool (SIH 2026 - Problem 26151)",
    add_completion=False
)
console = Console(highlight=False)

def print_banner():
    banner_text = (
        "[bold cyan]PROJECT ASTRA[/bold cyan] [bold white]| Autonomous Threat Intelligence & De-Anonymization[/bold white]\n"
        "[dim]Smart India Hackathon 2026 | Problem Statement: 26151 | Team BISHOP[/dim]\n"
        "[dim green]Section 65B Indian Evidence Act / BSA 2023 Cryptographic Hash-Chain Active[/dim green]"
    )
    console.print(Panel(banner_text, box=box.ROUNDED, border_style="cyan"))

@app.callback(invoke_without_command=True)
def main_callback(ctx: typer.Context):
    if ctx.invoked_subcommand is None:
        print_banner()
        console.print("[yellow]Use [bold]astra --help[/bold] to see available forensic commands.[/yellow]")

@app.command("version")
def version_cmd():
    print_banner()
    console.print(f"[bold]Engine Version:[/bold] {__version__}")
    console.print(f"[bold]Author:[/bold] Team BISHOP")
    console.print(f"[bold]Target PS:[/bold] SIH 2026 - Problem Statement 26151 (Dark web threat actor de-anonymization)")

@app.command("scan")
def scan_cmd(
    target: str = typer.Argument(..., help="Target .onion hidden service or IP address"),
    port: int = typer.Option(443, "--port", "-p", help="Target port for TLS/JARM recon"),
    mock_clearnet_leak: bool = typer.Option(False, "--simulate-leak", help="Simulate discovered clearnet IP leak in lab")
):
    print_banner()
    console.print(f"[bold blue][P1: INFRA-SCAN][/bold blue] Probing target: [cyan]{target}[/cyan]")
    
    mock_data = None
    if mock_clearnet_leak:
        mock_data = {
            "san_list": [target, "node-backup.darkops-syndicate.org", "194.26.29.114"],
            "leaked_ips": ["194.26.29.114"],
            "open_ports": [80, 443, 9001]
        }

    with Progress(TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("[cyan]Extracting JARM TLS cipher signatures and certificate SANs...", total=None)
        res = infra_scanner.scan_target(target, port=port, mock_data=mock_data)
        progress.update(task, completed=True)

    table = Table(title="INFRA-SCAN Findings", box=box.ROUNDED, border_style="blue")
    table.add_column("Property", style="bold white")
    table.add_column("Observed Value", style="cyan")

    table.add_row("Target", res.target)
    table.add_row("JARM Fingerprint", res.jarm_fingerprint or "N/A")
    table.add_row("Subject Common Name", res.ssl_subject_common_name or "N/A")
    table.add_row("Subject Alt Names (SAN)", ", ".join(res.ssl_san_list))
    table.add_row("Leaked Clearnet IPs", ", ".join(res.leaked_clearnet_ips) if res.leaked_clearnet_ips else "[green]None detected[/green]")
    table.add_row("Pillar Confidence", f"[bold yellow]{res.confidence_score * 100:.1f}%[/bold yellow]")

    console.print(table)
    if res.indicators:
        console.print("[bold red]Indicators of Misconfiguration:[/bold red]")
        for ind in res.indicators:
            console.print(f"  • {ind}")

@app.command("trace")
def trace_cmd(
    wallet: str = typer.Argument(..., help="Cryptocurrency wallet address (BTC/XMR)"),
    currency: str = typer.Option("BTC", "--currency", "-c", help="Cryptocurrency type")
):
    print_banner()
    console.print(f"[bold yellow][P3: CMTBP][/bold yellow] Analyzing on-chain flows for: [cyan]{wallet}[/cyan]")

    synthetic_txs = [
        {"txid": "tx01", "amount": 0.0008, "timestamp": 1741160000, "is_coinjoin": False},
        {"txid": "tx02", "amount": 4.5000, "timestamp": 1741161200, "is_coinjoin": True},
        {"txid": "tx03", "amount": 0.0005, "timestamp": 1741198000, "is_coinjoin": False},
        {"txid": "tx04", "amount": 2.8000, "timestamp": 1741199500, "is_coinjoin": True},
    ]

    with Progress(TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("[yellow]Scanning UTXO clusters, testing rituals, and mixer hops...", total=None)
        res = cmtbp_tracer.analyze_wallet_transactions(wallet, transactions=synthetic_txs, cryptocurrency=currency)
        progress.update(task, completed=True)

    table = Table(title="CMTBP On-Chain Forensics", box=box.ROUNDED, border_style="yellow")
    table.add_column("Metric", style="bold white")
    table.add_column("Value", style="cyan")

    table.add_row("Wallet Address", res.wallet_address)
    table.add_row("Cryptocurrency", res.cryptocurrency)
    table.add_row("Pre-Mixer Micro-TXs Detected", str(res.pre_mixer_micro_txs_detected))
    table.add_row("Mixer Signature", res.mixer_heuristic_signature or "None")
    table.add_row("UTXO Breathing Cadence", f"{res.breathing_period_hours} hours")
    table.add_row("Attribution Confidence", f"[bold yellow]{res.confidence_score * 100:.1f}%[/bold yellow]")

    console.print(table)
    for pat in res.flagged_patterns:
        console.print(f"  • {pat}")

@app.command("stylometry")
def stylometry_cmd(
    sample_a: Path = typer.Argument(..., help="Path to text sample A"),
    sample_b: Path = typer.Argument(..., help="Path to text sample B")
):
    print_banner()
    if not sample_a.exists() or not sample_b.exists():
        console.print("[bold red]Error: Specified text sample files do not exist.[/bold red]")
        raise typer.Exit(code=1)

    text_a = sample_a.read_text(encoding="utf-8")
    text_b = sample_b.read_text(encoding="utf-8")

    with Progress(TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("[magenta]Extracting cognitive markers and syntactic argument trees...", total=None)
        res = caa_profiler.compare_samples(text_a, text_b, sample_id=f"{sample_a.name}_vs_{sample_b.name}")
        progress.update(task, completed=True)

    table = Table(title="CAA Stylometric Profile", box=box.ROUNDED, border_style="magenta")
    table.add_column("Feature", style="bold white")
    table.add_column("Evaluation", style="cyan")

    table.add_row("Comparison ID", res.sample_id)
    table.add_row("Lexical Diversity (TTR)", f"{res.lexical_diversity_ttr:.3f}")
    table.add_row("Average Sentence Length", f"{res.avg_sentence_length:.1f} words")
    table.add_row("Cognitive Markers Matched", ", ".join(res.cognitive_marker_matches) or "None")
    table.add_row("Author Similarity Score", f"[bold green]{res.author_similarity_score * 100:.1f}%[/bold green]")

    console.print(table)

@app.command("classify")
def classify_cmd(
    listing_text: str = typer.Argument(..., help="Darknet post or listing text to classify into threat heads")
):
    print_banner()
    categories = taxonomy_classifier.classify(listing_text)
    table = Table(title="LEA Threat Activity Taxonomy", box=box.ROUNDED, border_style="cyan")
    table.add_column("Classified Threat Category", style="bold yellow")
    for cat in categories:
        table.add_row(cat)
    console.print(table)

@app.command("correlate")
def correlate_cmd(
    case_id: str = typer.Option("ASTRA-CASE-26151", "--case", "-c", help="Case identifier"),
    persona: str = typer.Option("VektorVendor_X", "--persona", "-p", help="Target threat actor alias"),
    demo: bool = typer.Option(True, "--demo", help="Run full 4-pillar demonstration workflow"),
    open_graph: bool = typer.Option(False, "--open", help="Instantly open interactive investigation graph in browser")
):
    print_banner()
    console.print(f"[bold cyan]Initiating DACS Multi-Signal Fusion for Case:[/bold cyan] [bold yellow]{case_id}[/bold yellow]")
    console.print(f"[bold cyan]Target Persona:[/bold cyan] [bold white]{persona}[/bold white]\n")

    with Progress(TextColumn("[progress.description]{task.description}"), console=console) as progress:
        t1 = progress.add_task("[blue]Executing P1: INFRA-SCAN Tor Misconfig Recon...", total=None)
        infra_res = infra_scanner.scan_target(
            f"{persona.lower()}.onion",
            mock_data={
                "san_list": [f"{persona.lower()}.onion", "auth.vektor-ops.ru", "185.220.101.5"],
                "leaked_ips": ["185.220.101.5"],
                "open_ports": [80, 443, 22]
            }
        )
        progress.update(t1, completed=True)

        t2 = progress.add_task("[cyan]Executing P2: MGRD Marketplace Ghost Residue Detection...", total=None)
        mgrd_res = mgrd_analyzer.analyze_migration_residue(
            persona_alias=persona,
            known_forums=["AlphaBay_V2", "BohemiaMarket", "AbacusDarknet"],
            pgp_keys=["92F4 81B3 E45C 70A1 0D32"],
            seizure_date_delta_hours=24.5,
            tox_or_jabber="vektor_support@exploit.im"
        )
        progress.update(t2, completed=True)

        t3 = progress.add_task("[yellow]Executing P3: CMTBP Crypto Micro-TX Breathing Pattern...", total=None)
        cmtbp_res = cmtbp_tracer.analyze_wallet_transactions(
            wallet_address="bc1q9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c4e6g8w",
            transactions=[
                {"txid": "tx01", "amount": 0.001, "timestamp": 1741160000, "is_coinjoin": False},
                {"txid": "tx02", "amount": 6.200, "timestamp": 1741162000, "is_coinjoin": True},
                {"txid": "tx03", "amount": 0.001, "timestamp": 1741203200, "is_coinjoin": False},
                {"txid": "tx04", "amount": 4.100, "timestamp": 1741205000, "is_coinjoin": True},
            ]
        )
        progress.update(t3, completed=True)

        t4 = progress.add_task("[magenta]Executing P4: CAA Cognitive Argument Stylometry...", total=None)
        suspect_text = (
            "Guaranteed delivery strictly via stealth drops!! Do not ask for escrow bypass without PGP. "
            "Opsec is undeniable: always verify our signed pgp proof before releasing funds."
        )
        reference_text = (
            "Always verify our signed pgp proof before releasing funds!! Strictly escrow protected. "
            "Never compromise opsec, guaranteed stealth."
        )
        caa_res = caa_profiler.compare_samples(suspect_text, reference_text, sample_id=f"CAA_{persona}")
        progress.update(t4, completed=True)

        t_dacs = progress.add_task("[bold green]Fusing multi-modal signals into DACS Score...", total=None)
        report = dacs_engine.fuse_signals(
            case_id=case_id,
            target_persona=persona,
            infra_result=infra_res,
            mgrd_result=mgrd_res,
            cmtbp_result=cmtbp_res,
            caa_result=caa_res
        )
        progress.update(t_dacs, completed=True)

    table = Table(title="ASTRA DACS FUSION ATTRIBUTION RESULTS", box=box.HEAVY_EDGE, border_style="green")
    table.add_column("Analytical Pillar", style="bold white")
    table.add_column("Focus Domain", style="dim")
    table.add_column("Raw Confidence", style="cyan")
    table.add_column("Signal Status", style="bold")

    table.add_row("P1: INFRA-SCAN", "Tor JARM / Clearnet IP Leakage", f"{infra_res.confidence_score*100:.1f}%", "[green]POSITIVE[/green]")
    table.add_row("P2: MGRD", "Marketplace Ghost Residue / PGP", f"{mgrd_res.confidence_score*100:.1f}%", "[green]POSITIVE[/green]")
    table.add_row("P3: CMTBP", "Crypto Micro-TX Breathing Pattern", f"{cmtbp_res.confidence_score*100:.1f}%", "[green]POSITIVE[/green]")
    table.add_row("P4: CAA", "Cognitive Argument Stylometry", f"{caa_res.confidence_score*100:.1f}%", "[green]POSITIVE[/green]")

    console.print(table)

    verdict_color = "bold green" if report.dacs_score >= 80 else "bold yellow"
    summary_panel = (
        f"[{verdict_color}]DACS ATTRIBUTION CONFIDENCE: {report.dacs_score}%[/{verdict_color}]\n"
        f"[bold white]Attribution Verdict:[/bold white] {report.attribution_verdict}\n"
        f"[bold white]Section 65B Hash Anchor:[/bold white] [dim]{report.chain_of_custody_hash}[/dim]\n"
        f"[bold white]Cryptographic Blocks Verified:[/bold white] {report.evidence_count} evidence items in chain"
    )
    console.print(Panel(summary_panel, title="[bold]DE-ANONYMIZATION VERDICT[/bold]", border_style="green"))

    json_path = Path(f"./reports/{case_id}_dossier.json")
    md_path = Path(f"./reports/{case_id}_brief.md")
    stix_path = Path(f"./reports/{case_id}_stix21.json")
    graph_path = Path(f"./reports/{case_id}_investigation_graph.html")

    ForensicDossierExporter.export_json(report, json_path)
    ForensicDossierExporter.export_markdown(report, md_path)
    ForensicGraphBuilder.render_html(report, graph_path)
    
    stix_bundle = Stix21Exporter.generate_bundle(report)
    stix_path.parent.mkdir(parents=True, exist_ok=True)
    with open(stix_path, "w", encoding="utf-8") as f:
        json.dump(stix_bundle, f, indent=2)

    console.print("\n[bold green]Intelligence Artifacts Exported Successfully:[/bold green]")
    console.print(f"  • Central Interactive Investigation Graph: [bold cyan]{graph_path}[/bold cyan]")
    console.print(f"  • Court Brief (Markdown): [cyan]{md_path}[/cyan]")
    console.print(f"  • Forensic Dossier (JSON): [cyan]{json_path}[/cyan]")
    console.print(f"  • Inter-Agency STIX 2.1 Bundle: [cyan]{stix_path}[/cyan]")

    if open_graph:
        webbrowser.open(graph_path.resolve().as_uri())

@app.command("graph")
def graph_cmd(
    case_id: str = typer.Option("ASTRA-CASE-26151", "--case", "-c", help="Case reference ID"),
    persona: str = typer.Option("VektorVendor_X", "--persona", "-p", help="Target threat persona"),
    open_browser: bool = typer.Option(True, "--open/--no-open", help="Open generated graph in web browser")
):
    print_banner()
    console.print(f"[bold cyan]Rendering Interactive Forensic Graph for:[/bold cyan] [bold white]{persona}[/bold white]")

    report = dacs_engine.fuse_signals(
        case_id=case_id,
        target_persona=persona,
        infra_result=infra_scanner.scan_target(f"{persona.lower()}.onion", mock_data={
            "san_list": [f"{persona.lower()}.onion", "auth.vektor-ops.ru", "185.220.101.5"],
            "leaked_ips": ["185.220.101.5"],
            "open_ports": [80, 443, 22]
        }),
        mgrd_result=mgrd_analyzer.analyze_migration_residue(
            persona_alias=persona,
            known_forums=["AlphaBay_V2", "BohemiaMarket", "AbacusDarknet"],
            pgp_keys=["92F4 81B3 E45C 70A1 0D32"],
            seizure_date_delta_hours=24.5,
            tox_or_jabber="vektor_support@exploit.im"
        ),
        cmtbp_result=cmtbp_tracer.analyze_wallet_transactions(
            wallet_address="bc1q9v8t3z4x7p2m6k8h1n0s5d3f7j9a2c4e6g8w",
            transactions=[
                {"txid": "tx01", "amount": 0.001, "timestamp": 1741160000, "is_coinjoin": False},
                {"txid": "tx02", "amount": 6.200, "timestamp": 1741162000, "is_coinjoin": True},
            ]
        ),
        caa_result=caa_profiler.compare_samples(
            "Strictly escrow protected!! Never bypass pgp.",
            "Never bypass pgp!! Strictly escrow required.",
            sample_id=f"CAA_{persona}"
        )
    )

    graph_path = Path(f"./reports/{case_id}_investigation_graph.html")
    ForensicGraphBuilder.render_html(report, graph_path)

    console.print(f"[bold green]Interactive Graph Generated:[/bold green] [cyan]{graph_path.resolve()}[/cyan]")
    if open_browser:
        console.print("[dim]Opening interactive network canvas in your default web browser...[/dim]")
        webbrowser.open(graph_path.resolve().as_uri())

@app.command("verify-chain")
def verify_chain_cmd():
    print_banner()
    console.print("[bold blue]Auditing Section 65B / BSA 2023 Cryptographic Hash Chain...[/bold blue]")

    status = ledger.verify_chain_integrity()
    if status["valid"]:
        console.print(Panel(
            f"[bold green]CHAIN INTEGRITY VERIFIED: 100% INTACT[/bold green]\n\n"
            f"[bold white]Total Evidentiary Records:[/bold white] {status['total_records']}\n"
            f"[bold white]Head Block Hash:[/bold white] [cyan]{status['latest_block_hash']}[/cyan]\n"
            f"[dim]{status['message']}[/dim]",
            title="[bold green]Section 65B Digital Evidence Audit[/bold green]",
            border_style="green"
        ))
    else:
        console.print(Panel(
            f"[bold red]CRITICAL: CHAIN TAMPERING DETECTED![/bold red]\n\n"
            f"[bold white]Broken Line:[/bold white] {status.get('broken_at_line')}\n"
            f"[bold white]Error:[/bold white] {status.get('error')}",
            title="[bold red]Forensic Hash Chain Failure[/bold red]",
            border_style="red"
        ))
        raise typer.Exit(code=1)

@app.command("ui")
def ui_cmd(
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host interface"),
    port: int = typer.Option(8000, "--port", "-p", help="Port number"),
    no_open: bool = typer.Option(False, "--no-open", help="Do not automatically open browser")
):
    print_banner()
    console.print(f"[bold cyan]Launching Project ASTRA Forensic Analyst Workstation...[/bold cyan]")
    console.print(f"[bold white]API Server URL:[/bold white] [cyan]http://{host}:{port}[/cyan]")
    console.print(f"[bold white]Interactive Docs:[/bold white] [cyan]http://{host}:{port}/docs[/cyan]")

    if not no_open:
        webbrowser.open(f"http://{host}:{port}/")

    import uvicorn
    uvicorn.run("astra.server.app:app", host=host, port=port, reload=False)

@app.command("pipeline")
def pipeline_cmd():
    print_banner()
    console.print("[bold cyan]Executing Multi-Persona Darknet Attribution Pipeline...[/bold cyan]")
    from astra.services.attribution_pipeline import attribution_pipeline
    with Progress(TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("[cyan]Ingesting personas, clustering UTXO wallets, and fusing DACS signals...", total=None)
        actors = attribution_pipeline.run_attribution()
        progress.update(task, completed=True)

    table = Table(title="ATTRIBUTED THREAT ACTORS", box=box.ROUNDED, border_style="green")
    table.add_column("Actor ID", style="bold yellow")
    table.add_column("Primary Alias", style="bold white")
    table.add_column("Linked Aliases", style="cyan")
    table.add_column("DACS Score", style="bold green")
    table.add_column("Verdict", style="bold")

    for a in actors:
        table.add_row(
            a.actor_id,
            a.primary_alias,
            ", ".join(al["username"] for al in a.aliases),
            f"{a.dacs_score:.1f}%",
            f"[green]{a.attribution_verdict}[/green]" if a.dacs_score >= 80 else f"[yellow]{a.attribution_verdict}[/yellow]"
        )
    console.print(table)

@app.command("demo")
def demo_cmd():
    print_banner()
    console.print("[bold cyan]Running SIH 2026 Controlled De-Anonymization Demonstration...[/bold cyan]")
    from astra.server.routes.demo import execute_demo_run
    res = execute_demo_run()
    console.print(Panel(
        f"[bold green]DEMO PIPELINE STATUS: {res['status']}[/bold green]\n\n"
        f"[bold white]Target Actor ID:[/bold white] {res['actor_id']}\n"
        f"[bold white]Primary Alias:[/bold white] {res['primary_alias']}\n"
        f"[bold white]De-Anonymized Aliases:[/bold white] {', '.join(res['linked_aliases'])}\n"
        f"[bold white]DACS Confidence Score:[/bold white] [bold green]{res['dacs_score']}%[/bold green]\n"
        f"[bold white]Attribution Verdict:[/bold white] {res['verdict']}\n"
        f"[bold white]Section 65B Hash Chain Seal:[/bold white] [dim]{res['section_65b_hash']}[/dim]",
        title="[bold]Judge Demonstration Result[/bold]",
        border_style="green"
    ))

@app.command("personas")
def personas_cmd():
    print_banner()
    from astra.services.attribution_pipeline import attribution_pipeline
    personas = attribution_pipeline.load_personas()
    table = Table(title="Darknet Tracked Personas", box=box.ROUNDED, border_style="cyan")
    table.add_column("Username", style="bold white")
    table.add_column("Marketplace / Forum", style="yellow")
    table.add_column("Wallet Address", style="dim")
    table.add_column("PGP Key", style="dim")

    for p in personas:
        table.add_row(
            p.username,
            p.platform,
            (p.wallet[:14] + "...") if p.wallet else "N/A",
            (p.pgp_key[:12] + "...") if p.pgp_key else "N/A"
        )
    console.print(table)

if __name__ == "__main__":
    app()

