//
// TheCodingBot
// Netro Corporation
//
// https://codingbot.gg

/*
 * TheCodingBot v6
 * codingbot.gg
 * (c) 2023 Netro Corporation
*/

const { SlashCommandBuilder } = require("discord.js");

const meta = () => {
	return new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Bot Status");
};

const execute = async(bot, interaction) => {
	
    data = [((bot.client.shard) ? bot.client.shard.ids : 0), bot.client.ws.status, bot.client.guilds.cache.size, bot.client.ws.ping],
        statusTypes = [
            "READY",
            "CONNECTING",
            "RECONNECTING",
            "IDLE",
            "NEARLY",
            "DISCONNECTED",
            "WAITING FOR GUILDS",
            "IDENTIFYING",
            "RESUMING"
        ];

	await interaction.reply({ embeds: [{
		title: bot.client.shard ? `Shard ${data[0]}/${bot.client.shard.count}` : "Current Status",
		color: bot.config.colors.blue,
        fields: [
            {
                name: "📶 **Status**: ",
                value: `${statusTypes[data[1]]}\n`
            },
            {
                name: "🖥️ **Servers**:",
                value: `${data[2]}\n`
            },
            {
                name: "🏓 **Ping**:",
                value: `${data[3]}ms`
            }
        ]
	}] });
};

module.exports = (app) => {
	return {
		meta,
		execute
	}
};