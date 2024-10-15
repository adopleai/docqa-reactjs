from io import StringIO
import logging
import csv
from typing import Optional
from streamlit.runtime.scriptrunner import get_script_run_ctx
from streamlit import runtime

def get_remote_ip() -> Optional[str]:
    """Get remote IP."""
    try:
        ctx = get_script_run_ctx()
        if ctx is None:
            return None

        session_info = runtime.get_instance().get_client(ctx.session_id)
        if session_info is None:
            return None
    except Exception as e:
        return None

    return session_info.request.remote_ip

class ContextFilter(logging.Filter):
    def filter(self, record):
        record.user_ip = get_remote_ip()
        # Set default fields for all logs
        record.question = getattr(record, 'question', '')
        record.selected_application = getattr(record, 'selected_application', '')
        record.parent_product = getattr(record, 'parent_product', '')
        return super().filter(record)

class CSVFormatter(logging.Formatter):
    def __init__(self, with_extra_columns=False):
        super().__init__()
        self.output = StringIO()
        self.writer = csv.writer(self.output, quoting=csv.QUOTE_ALL)
        self.with_extra_columns = with_extra_columns
        if self.with_extra_columns:
            self.writer.writerow(["asctime", "name", "levelname", "user_ip", "question", "selected_application", "parent_product", "message"])
        else:
            self.writer.writerow(["asctime", "name", "levelname", "user_ip", "message"])

    def format(self, record):
        row = [
            record.asctime,
            record.name,
            record.levelname,
            record.user_ip,
        ]
        if self.with_extra_columns:
            row.extend([
                record.question,
                record.selected_application,
                record.parent_product,
            ])
        row.append(record.getMessage())
        self.writer.writerow(row)
        data = self.output.getvalue()
        self.output.truncate(0)
        self.output.seek(0)
        return data.strip()
    
def log_file_formatter():
    return logging.Formatter(
        "%(name)s %(asctime)s %(levelname)s [user_ip=%(user_ip)s] "
        "[question=%(question)s] [selected_application=%(selected_application)s] "
        "[parent_product=%(parent_product)s] - %(message)s"
    )

def error_log_formatter():
    return logging.Formatter(
        "%(name)s %(asctime)s %(levelname)s [user_ip=%(user_ip)s] - %(message)s"
    )   
def init_logging():
    logger = logging.getLogger("onboard_assist")
    if logger.handlers:  # Logger is already set up, don't set it up again
        return

    logger.propagate = False
    logger.setLevel(logging.INFO)

    context_filter = ContextFilter()

    # Console handler
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    stream_handler.addFilter(context_filter)
    stream_handler.setFormatter(log_file_formatter())

    # File handler for info and warnings
    info_handler = logging.FileHandler("info_warnings.log")
    info_handler.setLevel(logging.INFO)
    info_handler.addFilter(context_filter)
    info_handler.setFormatter(log_file_formatter())
    info_handler.addFilter(lambda record: record.levelno < logging.ERROR)

    # CSV handler for info and warnings with extra columns
    info_csv_handler = logging.FileHandler("info_warnings.csv")
    info_csv_handler.setLevel(logging.INFO)
    info_csv_handler.addFilter(context_filter)
    info_csv_handler.setFormatter(CSVFormatter(with_extra_columns=True))
    info_csv_handler.addFilter(lambda record: record.levelno < logging.ERROR)

    # File handler for errors
    error_handler = logging.FileHandler("errors.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.addFilter(context_filter)
    error_handler.setFormatter(error_log_formatter())

    # CSV handler for errors
    error_csv_handler = logging.FileHandler("errors.csv")
    error_csv_handler.setLevel(logging.ERROR)
    error_csv_handler.addFilter(context_filter)
    error_csv_handler.setFormatter(CSVFormatter(with_extra_columns=False))

    logger.addHandler(stream_handler)
    logger.addHandler(info_handler)
    logger.addHandler(info_csv_handler)
    logger.addHandler(error_handler)
    logger.addHandler(error_csv_handler)

    logger.info("Logger initialized")

# Initialize logging upon module import
init_logging()

# Expose the logger to be imported in other modules
logger = logging.getLogger("onboard_assist")
