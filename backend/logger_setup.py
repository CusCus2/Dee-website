import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler


def configure_logging() -> logging.Logger:
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("my_app")
    logger.setLevel(logging.INFO)
    logger.propogate = False  # Prevent log messages from being propagated to the root logger
    if logger.handlers:
        return logger  # Return the existing logger if it has already been configured

    file_handler = RotatingFileHandler(
        filename = log_dir / "app.log",
        maxBytes = 5 * 1024 * 1024, # 5 MB
        backupCount = 3,
        encoding = "utf-8"
    )

    logger.addHandler(file_handler)
    return logger
