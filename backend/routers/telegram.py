# Telegram webhook endpoint for Cloud Run deployment
# Receives updates from Telegram via webhooks instead of polling

import logging
import re
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional

from config import settings
from database import SessionLocal
from crud.user import get_user_by_telegram_id
from crud.telegram import create_verification_code
from agent.langchain_agent import process_message
from telegram import Update, Bot
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/telegram", tags=["Telegram"])

# Initialize bot
bot = None

def get_bot():
    global bot
    if bot is None and settings.telegram_bot_token:
        bot = Bot(token=settings.telegram_bot_token)
    return bot


# Telegram MarkdownV2 formatting helper functions
def escape_markdown_v2(text: str) -> str:
    """
    Escape special characters for Telegram MarkdownV2.
    Characters that need escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
    """
    escape_chars = r'[\\`>#+\-=|{}.!()[\]]'
    return re.sub(escape_chars, r'\\\g<0>', text)


def format_telegram_message(text: str) -> str:
    """
    Format a message for Telegram with proper MarkdownV2 escaping.
    Preserves *bold* and _italic_ formatting while escaping special characters.
    """
    parts = []
    current_pos = 0
    
    # Find all formatting markers: *text* or _text_
    pattern = r'(\*[^*]+\*|_[^_]+_)'
    
    for match in re.finditer(pattern, text):
        # Escape unformatted text before this match
        if match.start() > current_pos:
            unformatted = text[current_pos:match.start()]
            parts.append(escape_markdown_v2(unformatted))
        
        # Handle formatted text (preserve markers, escape content)
        formatted = match.group(0)
        marker = formatted[0]
        content = formatted[1:-1]
        parts.append(f"{marker}{escape_markdown_v2(content)}{marker}")
        
        current_pos = match.end()
    
    # Escape remaining text
    if current_pos < len(text):
        parts.append(escape_markdown_v2(text[current_pos:]))
    
    return ''.join(parts)


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None)
):
    """
    Webhook endpoint for Telegram bot
    Receives updates from Telegram and processes them
    """
    
    # Verify webhook secret token for security
    if settings.telegram_webhook_secret:
        if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
            logger.warning("Invalid webhook secret token")
            raise HTTPException(status_code=403, detail="Invalid secret token")
    
    try:
        # Parse incoming update
        body = await request.json()
        update = Update.de_json(body, get_bot())
        
        if not update.message:
            return {"ok": True}
        
        telegram_id = update.message.from_user.id
        message_text = update.message.text
        chat_id = update.message.chat_id
        
        logger.info(f"Received message from {telegram_id}: {message_text}")
        
        # Get user from database
        db = SessionLocal()
        user = get_user_by_telegram_id(db, telegram_id)
        
        # Handle /start command
        if message_text and message_text.startswith("/start"):
            if user:
                response = f"👋 Welcome back, {update.message.from_user.first_name}! I'm Kleio, your personal kitchen assistant.\n\nWhat would you like to do today?"
            else:
                code = create_verification_code(db, telegram_id)
                response = (
                    "🔐 Link Your Account\n\n"
                    "To connect this Telegram to Kleio.ai:\n\n"
                    "1. Go to: https://kleio.ai/settings\n"
                    "2. Click 'Connect Telegram'\n"
                    f"3. Enter this code: {code}\n\n"
                    "⏰ Code expires in 10 minutes."
                )
            db.close()
            await get_bot().send_message(chat_id=chat_id, text=response)
            return {"ok": True}
        
        # Handle /help command
        if message_text and message_text.startswith("/help"):
            help_text = """
Of course! Here's how I can help you manage your kitchen:

📦 *Inventory Management*
• *Add items:* Just tell me what you bought! Try: "bought 2kg onions, 1L milk, and a loaf of bread"
• *Check stock:* Ask me what you have. Try: "what vegetables do I have?" or "do I have any milk?"

🍳 *Recipes & Cooking*
• *Get ideas:* Ask for a recipe based on your inventory. Try: "what can I make for dinner?"
• *Check a specific recipe:* See if you can make a dish you have in mind. Try: "can I cook paneer butter masala?"

🛒 *Smart Shopping*
• *Generate a list:* I can predict what you need to buy. Try: "what should I buy this week?"

⚙️ *Account*
• /start - Re-links your account if you ever get disconnected.
• /help - Shows this message again.

Just type a message and I'll do my best to understand!
"""
            db.close()
            await get_bot().send_message(chat_id=chat_id, text=help_text, parse_mode='Markdown')
            return {"ok": True}
        
        # Handle regular messages
        if not user:
            db.close()
            await get_bot().send_message(
                chat_id=chat_id,
                text="Please use /start to link your account first."
            )
            return {"ok": True}
        
        db.close()
        
        # Send typing action
        await get_bot().send_chat_action(chat_id=chat_id, action="typing")
        
        try:
            # Process message through agent
            response = await process_message(user.firebase_uid, message_text, str(chat_id))
            
            # Format response for Telegram (escape special characters for MarkdownV2)
            formatted_response = format_telegram_message(response)
            
            # Send response
            await get_bot().send_message(
                chat_id=chat_id,
                text=formatted_response,
                parse_mode='MarkdownV2'
            )
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            # Fallback to plain text
            try:
                await get_bot().send_message(
                    chat_id=chat_id,
                    text="⚠️ Response received, but there was a formatting issue. Here's the plain text:\n\n" + response,
                    parse_mode=None
                )
            except:
                await get_bot().send_message(
                    chat_id=chat_id,
                    text="❌ Sorry, I encountered an error processing your request. Please try again."
                )
        
        return {"ok": True}
        
    except Exception as e:
        logger.error(f"Webhook error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/webhook-info")
async def get_webhook_info():
    """
    Get current webhook configuration
    Useful for debugging
    """
    if not settings.telegram_bot_token:
        raise HTTPException(status_code=400, detail="Telegram bot token not configured")
    
    try:
        webhook_info = await get_bot().get_webhook_info()
        return {
            "url": webhook_info.url,
            "has_custom_certificate": webhook_info.has_custom_certificate,
            "pending_update_count": webhook_info.pending_update_count,
            "last_error_date": webhook_info.last_error_date,
            "last_error_message": webhook_info.last_error_message,
            "max_connections": webhook_info.max_connections,
            "allowed_updates": webhook_info.allowed_updates
        }
    except Exception as e:
        logger.error(f"Error getting webhook info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

