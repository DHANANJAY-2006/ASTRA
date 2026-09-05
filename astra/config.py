from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class AstraConfig(BaseSettings):
    """Configuration management for ASTRA Forensic Tool."""
    
    # Environment
    app_name: str = "ASTRA Forensic Intelligence Engine"
    env: str = Field(default="production", description="Environment mode")
    debug: bool = False
    
    # Workspace & Storage Paths
    data_dir: Path = Field(default=Path("./data"), description="Directory for raw forensic captures")
    evidence_ledger_path: Path = Field(default=Path("./data/evidence_ledger.jsonl"), description="Path to Section 65B hash chain ledger")
    reports_dir: Path = Field(default=Path("./reports"), description="Directory for exported forensic dossiers")
    
    # Network & Tor SOCKS5 Settings
    tor_proxy: str = Field(default="socks5://127.0.0.1:9050", description="Tor SOCKS5 proxy URL")
    user_agent: str = Field(
        default="Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0",
        description="Tor browser standard user agent"
    )
    request_timeout: float = 30.0
    jitter_min_seconds: float = 1.0
    jitter_max_seconds: float = 4.0
    
    # Pillar Weightings for DACS Fusion (Default calibrated baseline)
    weight_p1_infra: float = 0.25
    weight_p2_mgrd: float = 0.25
    weight_p3_cmtbp: float = 0.25
    weight_p4_caa: float = 0.25

    model_config = SettingsConfigDict(
        env_prefix="ASTRA_",
        env_file=".env",
        extra="ignore"
    )

config = AstraConfig()
