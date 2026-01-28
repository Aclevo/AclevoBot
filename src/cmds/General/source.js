/*
 * TheCodingBot v6
 * codingbot.gg
 * (c) 2023 Netro Corporation
*/

const { SlashCommandBuilder } = require("discord.js");

const meta = () => {
	return new SlashCommandBuilder()
		.setName("source")
		.setDescription("Learn more about the source code.");
};

const execute = async(bot, interaction) => {
	await interaction.reply({ embeds: [{
		title: "Contribute to AclevoBot",
		color: bot.config.colors.blue,
		description: "Find more information about the bot and contribute at https://github.com/Aclevo/AclevoBot"
	}] });
};

module.exports = (app) => {
	return {
		meta,
		execute
	}
};