import disnake
from disnake.ext import commands


def setup(bot):
    bot.add_cog(InfoCog(bot))


class InfoCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.slash_command(name="server", description="Check the server of the bot.")
    async def server(self, inter):
        embed = disnake.Embed(
            title="Server",
            description="Check the server of the bot.",
            color=disnake.Color.blue()
        )

        embed.add_field(name="Server Name", value=f"{inter.guild.name}", inline=False)
        embed.add_field(name="Server ID", value=f"{inter.guild.id}", inline=False)
        embed.add_field(name="Server Owner", value=f"{inter.guild.owner}", inline=False)
        embed.add_field(name="Server Members", value=f"{inter.guild.member_count}", inline=False)
        embed.add_field(name="Server Boosts", value=f"{inter.guild.premium_subscription_count}", inline=False)
        embed.add_field(name="Server Channels", value=f"{len(inter.guild.text_channels)}", inline=False)
        embed.add_field(name="Server Roles", value=f"{len(inter.guild.roles)}", inline=False)
        embed.add_field(name="Server Creation Date", value=f"{inter.guild.created_at}", inline=False)

        await inter.response.send_message(embed=embed)

    @commands.slash_command(name="ping", description="Check the latency of the bot.")
    async def ping(self, inter):
        embed = disnake.Embed(
            title="Bot Status",
            description="Current Bot Status",
            color=disnake.Color.blue()
        )

        embed.add_field(name="🏓 Ping", value=f"{self.bot.latency * 1000:.0f}ms", inline=False)

        embed.add_field(name="📶 Bot Status", value=f"{self.bot.status}")
        
        embed.add_field(name="🖥️ Servers", value=f"{len(self.bot.guilds)}", inline=False)

        # embed.set_footer("AclevoBotNext 2023")

        await inter.response.send_message(embed=embed)