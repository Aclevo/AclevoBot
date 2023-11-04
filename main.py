import os
from dotenv import load_dotenv
import disnake
import logging

from disnake.ext import commands



load_dotenv()
logging.basicConfig(level=logging.INFO)
bot = commands.InteractionBot()

for botCog in disnake.utils.search_directory("cogs"):
    bot.load_extension(botCog)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})\n------")

bot.run(os.getenv('BOT_TOKEN'))