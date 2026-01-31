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
    .setName("config")
    .setDescription("Configure your server the way you want!");
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

    const dropdownData = [
      {
        label: "Logging",
        description: "Configure logging settings.",
        value: "logging",
      },
      {
        label: "Join & Leave Messages",
        description: "Configure join and leave messages.",
        value: "joinleave",
      },
    ];

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Choose an option!")
        .addOptions(dropdownData),
    );

    await interaction.editReply({
      embeds: [
        {
          title: `${bot.config.system.emotes.question} Configure ${bot.name} - Select Option`,
          color: bot.config.colors.purple,
          description:
            "Alright - from the dropdown - what are we going to be configuring?",
        },
      ],
      components: [row],
    });

    const filter = (i) =>
      i.customId === "select" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.values.length > 0) {
        await i.deferUpdate();
        const val = i.values[0];

        if (val === "logging") {
          // Handle logging configuration
          const loggingOptions = [
            {
              label: "Member Event Channel",
              description:
                "The channel member events are logged to (joins, leaves, and updates)",
              value: "loggingMemberChannel",
            },
            {
              label: "Server Event Channel",
              description:
                "The channel guild events are logged to (role + channel creates/updates/deletes & server updates)",
              value: "loggingGuildChannel",
            },
            {
              label: "Message Event Channel",
              description:
                "The channel message events are logged to (message updates/deletes/bulkdeletes)",
              value: "loggingMessageChannel",
            },
          ];

          const loggingRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("logging_select")
              .setPlaceholder("Choose an option!")
              .addOptions(loggingOptions),
          );

          await interaction.editReply({
            embeds: [
              {
                title: `${bot.config.system.emotes.question} Configure ${bot.name} - Type of Logging`,
                color: bot.config.colors.purple,
                description:
                  "My favorite! Alright, what type of logging should we configure?",
              },
            ],
            components: [loggingRow],
          });

          // Handle logging type selection
          const loggingFilter = (si) =>
            si.customId === "logging_select" &&
            si.user.id === interaction.user.id;
          const loggingCollector =
            interaction.channel.createMessageComponentCollector({
              loggingFilter,
              time: 30000,
            });

          loggingCollector.on("collect", async (si) => {
            if (si.values.length > 0) {
              await si.deferUpdate();
              const logType = si.values[0];

              // Show channel selection for the logging type
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
                    title: `${bot.config.system.emotes.question} Configure ${bot.name} - Select Logging Channel`,
                    color: bot.config.colors.purple,
                    description:
                      "Sick! What channel are we going to be setting this up in?",
                  },
                ],
                components: [channelRow],
              });

              // Handle channel selection
              const channelFilter = (ci) =>
                ci.customId === "channel_select" &&
                ci.user.id === interaction.user.id;
              const channelCollector =
                interaction.channel.createMessageComponentCollector({
                  channelFilter,
                  time: 30000,
                });

              channelCollector.on("collect", async (ci) => {
                if (ci.values.length > 0) {
                  await ci.deferUpdate();
                  const channelId = ci.values[0];

                  // Save the logging channel configuration
                  const affectedRows = await bot.DBs.serverSettings.update(
                    { [logType]: channelId },
                    { where: { serverID: interaction.guild.id } }
                  );

                  if (affectedRows > 0) {
                    await interaction.editReply({
                      embeds: [
                        {
                          title: `${bot.config.system.emotes.success} Configure ${bot.name}`,
                          color: bot.config.colors.lime,
                          description: `Woohoo! We're done here!\nYour selected logs is ready to go!`
                        },
                      ],
                      components: [],
                    });
                  } else {
                    throw new Error("Database saving failed!");
                  }
                }
              });
            }
          });
        } else if (val === "joinleave") {
          // Handle join/leave configuration
          const joinLeaveOptions = [
            {
              label: "Join Messages & Channel",
              description: "Hello (user) and welcome to the server!",
              value: "join",
            },
            {
              label: "Leave Messages & Channel",
              description: "Oh no! (user) left the server!",
              value: "leave",
            },
          ];

          const joinLeaveRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("joinleave_select")
              .setPlaceholder("Choose an option!")
              .addOptions(joinLeaveOptions),
          );

          await interaction.editReply({
            embeds: [
              {
                title: `${bot.config.system.emotes.question} Configure ${bot.name} - Join or Leave??`,
                color: bot.config.colors.purple,
                description: "Bet! What would you like to set up?",
              },
            ],
            components: [joinLeaveRow],
          });

          // Handle join/leave type selection
          const joinLeaveFilter = (ji) =>
            ji.customId === "joinleave_select" &&
            ji.user.id === interaction.user.id;
          const joinLeaveCollector =
            interaction.channel.createMessageComponentCollector({
              joinLeaveFilter,
              time: 30000,
            });

          joinLeaveCollector.on("collect", async (ji) => {
            if (ji.values.length > 0) {
              await ji.deferUpdate();
              const eventType = ji.values[0];

              // Ask for the message content
              await interaction.editReply({
                embeds: [
                  {
                    title: `${bot.config.system.emotes.question} Configure ${bot.name} - ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Message`,
                    color: bot.config.colors.purple,
                    description: `Great! What should the ${eventType} message be?`,
                  },
                ],
                components: [],
              });

              // Wait for message input
              const msgFilter = (m) => m.author.id === interaction.user.id;
              const msgCollector = interaction.channel.createMessageCollector({
                filter: msgFilter,
                max: 1,
                time: 30000,
              });

              msgCollector.on("collect", async (m) => {
                const messageContent = m.content;

                // Show channel selection for the join/leave event
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
                    .setCustomId("joinleave_channel_select")
                    .setPlaceholder("Choose a channel!")
                    .addOptions(channelOptions.slice(0, 25)), // Limit to 25 options
                );

                await interaction.editReply({
                  embeds: [
                    {
                      title: `${bot.config.system.emotes.question} Configure ${bot.name} - Select ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Channel`,
                      color: bot.config.colors.purple,
                      description:
                        "Sick! What channel are we going to be setting this up in?",
                    },
                  ],
                  components: [channelRow],
                });

                // Handle channel selection
                const joinLeaveChannelFilter = (jci) =>
                  jci.customId === "joinleave_channel_select" &&
                  jci.user.id === interaction.user.id;
                const joinLeaveChannelCollector =
                  interaction.channel.createMessageComponentCollector({
                    joinLeaveChannelFilter,
                    time: 30000,
                  });

                joinLeaveChannelCollector.on("collect", async (jci) => {
                  if (jci.values.length > 0) {
                    await jci.deferUpdate();
                    const channelId = jci.values[0];

                    // Save the join/leave configuration
                    let data = { join: { msg: "Welcome {user} to {server}!", channel: null }, leave: { msg: "{user} has left {server}", channel: null } };
                    if (serverSettings.get("other")) {
                      data = JSON.parse(serverSettings.get("other"));
                    }

                    data[eventType] = {
                      msg: messageContent,
                      channel: channelId
                    };

                    const affectedRows = await bot.DBs.serverSettings.update(
                      { other: JSON.stringify(data, null, "\t") },
                      { where: { serverID: interaction.guild.id } }
                    );

                    if (affectedRows > 0) {
                      await interaction.editReply({
                        embeds: [
                          {
                            title: `${bot.config.system.emotes.success} Configure ${bot.name}`,
                            color: bot.config.colors.lime,
                            description: `Woohoo! We're done here!\nYour ${eventType} message & channel are both ready to go!\n\n\`${messageContent}\``
                          },
                        ],
                        components: [],
                      });
                    } else {
                      throw new Error("Database saving failed!");
                    }
                  }
                });
              });
            }
          });
        }
      }
    });

    collector.on("end", async (collected) => {
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
          title: `${bot.config.system.emotes.information} Configure ${bot.name} - Unexpected Error`,
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
