from typer.testing import CliRunner
from astra.cli.main import app

runner = CliRunner()

def test_cli_version():
    result = runner.invoke(app, ["version"])
    assert result.exit_code == 0
    assert "PROJECT ASTRA" in result.stdout
    assert "26151" in result.stdout

def test_cli_scan():
    result = runner.invoke(app, ["scan", "darknetmarket.onion", "--simulate-leak"])
    assert result.exit_code == 0
    assert "INFRA-SCAN Findings" in result.stdout

def test_cli_trace():
    result = runner.invoke(app, ["trace", "bc1qtestaddress1234567890"])
    assert result.exit_code == 0
    assert "CMTBP On-Chain Forensics" in result.stdout

def test_cli_correlate():
    result = runner.invoke(app, ["correlate", "--demo"])
    assert result.exit_code == 0
    assert "DACS FUSION ATTRIBUTION RESULTS" in result.stdout
    assert "DE-ANONYMIZATION VERDICT" in result.stdout

def test_cli_verify_chain():
    result = runner.invoke(app, ["verify-chain"])
    assert result.exit_code == 0
    assert "CHAIN INTEGRITY VERIFIED" in result.stdout
