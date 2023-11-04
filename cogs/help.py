import disnake
from disnake.ext import commands


def setup(bot):
    bot.add_cog(HelpCog(bot))

class HelpCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.slash_command(name="help", description="Check the commands of the bot.")
    async def help(self, inter):
        embed = disnake.Embed(
            title="Commands",
            description="Check the commands of the bot.",
            color=disnake.Color.blue()
        )

        embed.add_field(name="ping", value="Check the latency of the bot.", inline=False)
        embed.add_field(name="server", value="Check the server of the bot.", inline=False)
        embed.add_field(name="help", value="Check the commands of the bot.", inline=False)        

        await inter.response.send_message(embed=embed)

    