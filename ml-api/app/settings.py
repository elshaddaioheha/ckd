from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "CKD AI Risk Screener API"
    model_path: str = "./models/ckd-distilbert"
    log_level: str = "info"
    debug: bool = False
    
    # Allows loading from .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
