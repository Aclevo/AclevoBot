/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("uwu")
    .setDescription("UwUify some messages... for some reason..?")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to uwuify")
        .setRequired(false),
    );
};

const execute = async (bot, interaction) => {
  const text = interaction.options.getString("text") || "uwu";

  function UwUify(msg) {
    msg = msg.toLowerCase(); // Convert the message to lowercase for now
    const flipList = "ay:ey,ck:cc,ing:in,or:aw,ou:ow,ro:wo,tha:da,the:de,thi:di,wh:w,wr:w,you:yu,mn:m,mb:m,l:w,r:w"
      .split(",")
      .map((i) => i.split(":"));
    for (let pair of flipList) {
      msg = msg.split(pair[0]).join(pair[1]);
    }
    return msg + (!msg.endsWith("uwu") ? " uwu" : "");
  }

  await interaction.reply(UwUify(text) || "Something went wrong :(");
};

export default {
  meta,
  execute,
};
