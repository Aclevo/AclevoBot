/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Run JS code.")
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The code to execute")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);
};

const execute = async (bot, interaction) => {
  try {
    const code = interaction.options.getString("code");

    let evaluated = Bun.inspect(eval(code, { depth: 0 }));
    if (evaluated !== "Promise { <pending> }") {
      return await interaction.reply({
        embeds: [
          {
            title: "Eval Result",
            color: bot.config.colors.green,
            description: "```js\n" + (evaluated == "" ? "" : evaluated) + "```",
          },
        ],
      });
    } else return await interaction.reply({ content: "** **" });
  } catch (Ex) {
    return await interaction.reply({
      embeds: [
        {
          title: "Eval Result",
          color: bot.config.colors.red,
          description: "```js\n" + Ex.stack + "```",
        },
      ],
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
