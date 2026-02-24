import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def send_otp_email(to_email: str, otp: str):
    """Send OTP code to admin via email."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️  SMTP not configured — printing OTP to console instead.")
        print("=" * 50)
        print(f"  ADMIN OTP for {to_email}: {otp}")
        print(f"  Expires in 5 minutes")
        print("=" * 50)
        return False

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

    try:
        if SMTP_PORT == 465:
            # Use SSL for port 465
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, to_email, msg.as_string())
        else:
            # Use STARTTLS for 587 or other ports
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, to_email, msg.as_string())
        print(f"✅ OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        # Fallback to console
        print("=" * 50)
        print(f"  ADMIN OTP for {to_email}: {otp}")
        print(f"  Expires in 5 minutes")
        print("=" * 50)
        return False
