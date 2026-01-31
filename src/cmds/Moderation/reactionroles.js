/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("reactionroles")
    .setDescription("Setup reaction roles for your server!");
};

const execute = async (bot, interaction) => {
  const serverSettings = await bot.DBs.serverSettings.findOne({ where: { serverID: interaction.guild.id } });

  await interaction.reply({
    embeds: [
      {
        title: bot.config.system.emotes.wait + " **Loading**",
        color: bot.config.colors.blue,
      },
    ],
  });

  try {
    if (!serverSettings) throw new Error("No server in database"); // How did they even do this command?

    // Prepare channel options
    const channelOptions = [];
    for (const [id, channel] of interaction.guild.channels.cache) {
      if (channel.type === 0) {
        // 0 is GuildText
        channelOptions.push({
          label: `#${channel.name}`,
          description: channel.topic
            ? channel.topic.substring(0, 100)
            : "No topic",
          value: channel.id,
        });
      }
    }

    const channelRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("channel_select")
        .setPlaceholder("Choose a channel!")
        .addOptions(channelOptions.slice(0, 25)), // Limit to 25 options
    );

    await interaction.editReply({
      embeds: [
        {
          title: `${bot.config.system.emotes.question} Reaction Roles - Select Channel`,
          color: bot.config.colors.purple,
          description:
            "Alright - from the dropdown - What channel are we going to be setting this up in?",
        },
      ],
      components: [channelRow],
    });

    // Handle channel selection
    const channelFilter = (i) =>
      i.customId === "channel_select" && i.user.id === interaction.user.id;
    const channelCollector =
      interaction.channel.createMessageComponentCollector({
        channelFilter,
        time: 30000,
      });

    let channelID = null;
    let messageID = null;
    let reactions = [];
    let customTitle = "";
    let customDesc = "";

    channelCollector.on("collect", async (i) => {
      if (i.values.length > 0) {
        await i.deferUpdate();
        channelID = i.values[0];

        // Ask for title and description
        await interaction.editReply({
          embeds: [
            {
              title: `${bot.config.system.emotes.question} Reaction Roles - Set title & description`,
              color: bot.config.colors.purple,
              description:
                "Nice channel!\nPlease enter the embed title and description so your users know what is what!\nExample: `This is a test|Get roles here :)`",
            },
          ],
          components: [],
        });

        // Wait for title and description
        const msgFilter = (m) => m.author.id === interaction.user.id;
        const msgCollector = interaction.channel.createMessageCollector({
          filter: msgFilter,
          max: 1,
          time: 30000,
        });

        msgCollector.on("collect", async (m) => {
          if (m.content.includes("|")) {
            const splitMsg = m.content.split("|");
            customTitle = splitMsg[0];
            customDesc = splitMsg[1];

            // Show preview message
            const previewMessage = await interaction.channel.send({
              embeds: [
                {
                  title: customTitle,
                  description: customDesc,
                  footer: { text: " !! EXAMPLE !! - " + bot.config.system.footerText }
                },
              ],
            });

            // Ask for reaction roles
            await interaction.editReply({
              embeds: [
                {
                  title: `${bot.config.system.emotes.question} Reaction Roles - Create Reactions`,
                  color: bot.config.colors.purple,
                  description:
                    "Great! What should the reaction roles be? Send `done` when done.\nSend in this format: `:white_check_mark:|13-18|999999999999999999`\n(Example is below)",
                },
              ],
              components: [],
            });

            // Collect reaction roles
            const reactionFilter = (rm) => rm.author.id === interaction.user.id;
            const reactionCollector =
              interaction.channel.createMessageCollector({
                filter: reactionFilter,
                time: 90000,
              });

            reactionCollector.on("collect", async (rm) => {
              if (rm.content === "done") {
                reactionCollector.stop("done");
                await previewMessage.delete().catch((err) => {});

                // Save reaction roles
                await interaction.editReply({
                  embeds: [
                    {
                      title: `${bot.config.system.emotes.wait} Reaction Roles - Saving`,
                      color: bot.config.colors.blue,
                      description: "Fantastic! Saving your settings..."
                    },
                  ],
                  components: [],
                });

                // Create the reaction role message
                const channel = interaction.guild.channels.cache.get(channelID);
                const reactionsList = [];
                for (const reaction of reactions) {
                  reactionsList.push(`${reaction.emoji} ${reaction.roleMsg}`);
                }

                const reactionMessage = await channel.send({
                  embeds: [
                    {
                      title: customTitle,
                      description:
                        customDesc + "\n\n" + reactionsList.join("\n"),
                    },
                  ],
                });

                messageID = reactionMessage.id;

                // Add reactions to the message
                for (const reaction of reactions) {
                  try {
                    await reactionMessage.react(reaction.emoji);
                  } catch (error) {
                    console.error(
                      `Could not add reaction ${reaction.emoji}:`,
                      error,
                    );
                  }
                }

                // Save to database
                let data = {};
                if (serverSettings.reactionRoles) {
                  data = JSON.parse(serverSettings.reactionRoles);
                }

                data[channelID] = {
                  message: messageID,
                  reactionRoles: reactions
                };

                const affectedRows = await bot.DBs.serverSettings.update(
                  { reactionRoles: JSON.stringify(data, null, "\t") },
                  { where: { serverID: interaction.guild.id } }
                );

                if (affectedRows > 0) {
                  await interaction.editReply({
                    embeds: [
                      {
                        title: `${bot.config.system.emotes.success} Reaction Roles`,
                        color: bot.config.colors.lime,
                        description: `Woohoo! We're done here! Go see your lovely reaction roles [now](https://discord.com/channels/${interaction.guild.id}/${channelID}/${messageID}).\nPlease note that reactions may take a bit to apply due to ratelimits.`
                      },
                    ],
                    components: [],
                  });
                } else {
                  throw new Error("Database saving failed!");
                }
              } else {
                // Parse reaction role
                const splitMsg = rm.content.split("|");
                if (splitMsg.length < 3) return; // Ignore the message.

                const emoji = splitMsg[0];
                const roleMsg = splitMsg[1];
                const roleID = bot.functions.getID(splitMsg[2]) || splitMsg[2];

                reactions.push({
                  emoji: emoji,
                  roleID: roleID,
                  roleMsg: roleMsg,
                });

                // Update preview message
                const updatedReactionsList = [];
                for (const reaction of reactions) {
                  updatedReactionsList.push(
                    `${reaction.emoji} ${reaction.roleMsg}`,
                  );
                }

                await previewMessage.edit({
                  embeds: [
                    {
                      title: customTitle,
                      description:
                        customDesc + "\n\n" + updatedReactionsList.join("\n"),
                    },
                  ],
                });

                await rm.react(bot.config.system.emotes.success).catch(err => {});
              }
            });
          }
        });
      }
    });

    channelCollector.on("end", async (collected) => {
      if (collected.size < 1) {
        await interaction.editReply({
          components: [],
        });
      }
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: `Something happened, ${interaction.user.username}!`,
            icon_url: interaction.user.displayAvatarURL({
              extension: "png",
              dynamic: true,
              size: 1024,
            }),
          },
          title: `${bot.config.system.emotes.information} Reaction Roles - Setup`,
          color: bot.config.colors.red,
          description: `Sadly, we ran into an error while setting up your reaction roles. Here's what we know: ${error.message}`,
        },
      ],
      components: [],
    });
  }
};

export default (app) => ({
  meta,
  execute,
});
