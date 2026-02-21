import os
import razorpay

# Razorpay Configuration
# Replace these with your own keys from https://dashboard.razorpay.com
# Settings -> API Keys -> Generate Test Key
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G5ag")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "thiswillbesetlater")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Google OAuth Configuration
# Get your Client ID from https://console.cloud.google.com
# APIs & Services -> Credentials -> Create OAuth Client ID (Web application)
# Set authorized JavaScript origins to http://localhost:5173
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID_HERE")
