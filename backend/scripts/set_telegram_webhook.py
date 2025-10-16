# Script to set Telegram webhook for Cloud Run deployment

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET")

def set_webhook(backend_url):
    """
    Set Telegram webhook URL
    
    Args:
        backend_url: Your Cloud Run backend URL (e.g., https://kleio-backend-xxx.run.app)
    """
    if not TELEGRAM_BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file")
        return False
    
    if not TELEGRAM_WEBHOOK_SECRET:
        print("❌ Error: TELEGRAM_WEBHOOK_SECRET not found in .env file")
        return False
    
    # Clean up backend URL
    backend_url = backend_url.rstrip('/')
    webhook_url = f"{backend_url}/api/telegram/webhook"
    
    print(f"🔧 Setting webhook to: {webhook_url}")
    print(f"🔐 Using secret token: {TELEGRAM_WEBHOOK_SECRET[:8]}...")
    
    # Set webhook
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    params = {
        "url": webhook_url,
        "secret_token": TELEGRAM_WEBHOOK_SECRET
    }
    
    try:
        response = requests.get(api_url, params=params)
        result = response.json()
        
        if result.get("ok"):
            print("✅ Webhook set successfully!")
            print(f"   URL: {webhook_url}")
            return True
        else:
            print(f"❌ Failed to set webhook: {result.get('description')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def get_webhook_info():
    """Get current webhook information"""
    if not TELEGRAM_BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file")
        return
    
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    
    try:
        response = requests.get(api_url)
        result = response.json()
        
        if result.get("ok"):
            info = result.get("result", {})
            print("📊 Current Webhook Info:")
            print(f"   URL: {info.get('url', 'Not set')}")
            print(f"   Pending updates: {info.get('pending_update_count', 0)}")
            
            if info.get('last_error_date'):
                print(f"   ⚠️ Last error: {info.get('last_error_message')}")
            else:
                print("   ✅ No errors")
        else:
            print(f"❌ Failed to get webhook info: {result.get('description')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


def delete_webhook():
    """Delete webhook (switch back to polling)"""
    if not TELEGRAM_BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file")
        return
    
    api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
    
    try:
        response = requests.get(api_url)
        result = response.json()
        
        if result.get("ok"):
            print("✅ Webhook deleted successfully")
        else:
            print(f"❌ Failed to delete webhook: {result.get('description')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("Telegram Webhook Configuration Tool")
    print("=" * 60)
    print()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Set webhook:    python set_telegram_webhook.py set <backend_url>")
        print("  Get info:       python set_telegram_webhook.py info")
        print("  Delete webhook: python set_telegram_webhook.py delete")
        print()
        print("Example:")
        print("  python set_telegram_webhook.py set https://kleio-backend-abc123.run.app")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "set":
        if len(sys.argv) < 3:
            print("❌ Error: Please provide backend URL")
            print("Example: python set_telegram_webhook.py set https://kleio-backend-abc123.run.app")
            sys.exit(1)
        
        backend_url = sys.argv[2]
        set_webhook(backend_url)
        print()
        print("🔍 Verifying...")
        get_webhook_info()
        
    elif command == "info":
        get_webhook_info()
        
    elif command == "delete":
        delete_webhook()
        
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: set, info, delete")
        sys.exit(1)
    
    print()
    print("=" * 60)

