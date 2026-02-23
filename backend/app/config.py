import os
from dotenv import load_dotenv
import razorpay

load_dotenv()

# Razorpay Configuration
# Replace these with your own keys from https://dashboard.razorpay.com
# Settings -> API Keys -> Generate Test Key
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G5ag")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "thiswillbesetlater")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
