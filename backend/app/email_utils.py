import smtplib
import os
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")


def send_otp_email(to_email: str, otp: str):
    """Send OTP code code via Email."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Admin Login OTP: {otp}"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    html = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Admin Login OTP</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
                <p style="color: #555; font-size: 16px; margin-bottom: 24px;">
                    Use the following code to complete your admin login:
                </p>
                <div style="background: #f0f4ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f; font-family: monospace;">{otp}</span>
                </div>
                <p style="color: #888; font-size: 14px; margin-top: 24px;">
                    This code expires in <strong>5 minutes</strong>.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">Village Community Portal</p>
            </div>
        </div>
    </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))
    
    # 1. Try Resend API first if configured (Most reliable on Render)
    if RESEND_API_KEY:
        print(f"DEBUG: Attempting to send email via Resend API (To: {to_email})")
        try:
            resend.api_key = RESEND_API_KEY
            params = {
                "from": SMTP_FROM if "resend.com" in SMTP_FROM else "Village Samaj <onboarding@resend.dev>",
                "to": to_email,
                "subject": f"Your Admin Login OTP: {otp}",
                "html": html,
            }
            resend.Emails.send(params)
            print(f"✅ OTP email sent via Resend API to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Resend API failed: {e}")
            # Continue to SMTP fallback

    # 2. Skip SMTP if not configured
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️  SMTP/API not configured — printing OTP to console instead.")
        _print_otp_box(to_email, otp)
        return False

    # 3. Try SMTP
    print(f"DEBUG: Attempting to send email via SMTP {SMTP_HOST}:{SMTP_PORT} (User: {SMTP_USER[:3]}...)")
    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, to_email, msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, to_email, msg.as_string())
        print(f"✅ OTP email sent via SMTP to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email via SMTP: {e}")
        _print_otp_box(to_email, otp)
        return False

def _print_otp_box(to_email, otp):
    print("=" * 50)
    print(f"  ADMIN OTP for {to_email}: {otp}")
    print(f"  Expires in 5 minutes")
    print("=" * 50)
