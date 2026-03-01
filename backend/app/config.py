import os
import re
import warnings
from dotenv import load_dotenv
import razorpay

load_dotenv()

# Razorpay Configuration
# Replace these with your own keys from https://dashboard.razorpay.com
# Settings -> API Keys -> Generate Test Key
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G5ag")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "thiswillbesetlater")

# Special Welfare Fund Keys (In production these should be separate keys)
RAZORPAY_KEY_ID_SPECIAL = os.getenv("RAZORPAY_KEY_ID_SPECIAL", RAZORPAY_KEY_ID)
RAZORPAY_KEY_SECRET_SPECIAL = os.getenv("RAZORPAY_KEY_SECRET_SPECIAL", RAZORPAY_KEY_SECRET)

# Validate key format at startup — catches invalid keys (e.g. PhonePe IDs) immediately
# so payments don't silently fail at runtime.
if not re.match(r"^rzp_(test|live)_", RAZORPAY_KEY_ID or ""):
    warnings.warn(
        f"[Razorpay] RAZORPAY_KEY_ID '{RAZORPAY_KEY_ID}' does not look like a valid "
        "Razorpay key (expected format: rzp_test_... or rzp_live_...). "
        "All payment requests will fail with Authentication errors.",
        RuntimeWarning,
        stacklevel=2,
    )

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
razorpay_client_special = razorpay.Client(auth=(RAZORPAY_KEY_ID_SPECIAL, RAZORPAY_KEY_SECRET_SPECIAL))
