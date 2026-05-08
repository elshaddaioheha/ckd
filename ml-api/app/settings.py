from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "CKD AI Risk Screener API"
    model_path: str = "./models/ckd_distilbert"

settings = Settings()
