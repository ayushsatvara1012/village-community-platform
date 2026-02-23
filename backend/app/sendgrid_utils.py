import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@satvara32samaj.com")

def send_sendgrid_otp(recipient_email: str, otp_code: str) -> bool:
    """Send an OTP code via SendGrid to the given email address."""
    if not SENDGRID_API_KEY:
        print("⚠️  SendGrid not configured — printing OTP to console instead.")
        print("=" * 50)
        print(f"  OTP for EMAIL {recipient_email}: {otp_code}")
        print(f"  Expires in 5 minutes")
        print("=" * 50)
        return False
        
    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Satvara 32 Samaj Login</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
                <p style="color: #555; font-size: 16px; margin-bottom: 24px;">
                    Use the following code to complete your login:
                </p>
                <div style="background: #f0f4ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f; font-family: monospace;">{otp_code}</span>
                </div>
                <p style="color: #888; font-size: 14px; margin-top: 24px;">
                    This code expires in <strong>5 minutes</strong>.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">Village Community Platform</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    message = Mail(
        from_email=SENDGRID_FROM_EMAIL,
        to_emails=recipient_email,
        subject="Your Login Security Code - Satvara 32 Samaj",
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ SendGrid email dispatched to {recipient_email} (Status: {response.status_code})")
        return True
    except Exception as e:
        print(f"❌ Failed to send SendGrid email: {e}")
        return False
