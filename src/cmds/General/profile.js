/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("profile")
    .setDescription("It's all about you - update, opt-out, delete, and more on your profile!");
};

const execute = async (bot, interaction) => {
  const userSettings = await bot.DBs.userSettings.findOne({ where: { userID: interaction.user.id } });

  await interaction.reply({
    embeds: [
      {
        title: bot.config.system.emotes.wait + " **Loading**",
        color: bot.config.colors.blue,
      },
    ],
  });

  try {
    if (!userSettings) throw new Error("No profile in database"); // How did they even do this command?

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("cfgsettings")
          .setLabel("Change Settings")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId(userSettings.get("optedOut") ? "optin" : "optout")
          .setLabel(`Opt-${userSettings.get("optedOut") ? "in to" : "out of"} analytics`)
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("delete")
          .setLabel("Delete profile")
          .setStyle("Danger"),
      );

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: `Welcome, ${interaction.user.username}!`,
            icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
          },
          title: `${bot.config.system.emotes.information} It's all about you!`,
          color: bot.config.colors.lime,
          fields: [
            { name: "Your User Information", value: "** **" },
            { name: "Language", value: userSettings.get("language") || "English", inline: true },
            { name: "Prefix", value: userSettings.get("prefix") || bot.config.system.defaultPrefix || "Error", inline: true },
            { name: "Your User Statistics", value: "** **" },
            { name: "Total Commands Executed", value: userSettings.get("executedCommands").toString() || "0", inline: true },
            { name: "Total Commands Errored", value: userSettings.get("errorCommands").toString() || "0", inline: true },
          ],
        },
      ],
      components: [row],
    });

    // Collect button interactions
    const filter = i => ["cfgsettings", "optout", "optin", "delete"].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 10000 });

    collector.on("collect", async i => {
      if (i.customId === "cfgsettings") {
        await i.deferUpdate();

        const selectRow = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("select")
              .setPlaceholder("Nothing selected")
              .addOptions([
                {
                  label: "Language",
                  description: "Change your language from a list of supported languages!",
                  value: "language",
                },
                {
                  label: "Prefix",
                  description: `Maybe you don't want '${userSettings.get("prefix")}' anymore.`,
                  value: "prefix",
                },
              ])
          );

        await interaction.editReply({
          embeds: [
            {
              author: {
                name: `Change change change, ${interaction.user.username}!`,
                icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
              },
              title: `${bot.config.system.emotes.question} User Settings - Change Settings`,
              color: bot.config.colors.purple,
              description: "Alright - from the dropdown - what do you wish to change?"
            },
          ],
          components: [selectRow],
        });

        // Handle the selection menu
        const selectionFilter = si => si.customId === "select" && si.user.id === interaction.user.id;
        const selectionCollector = interaction.channel.createMessageComponentCollector({ selectionFilter, max: 1, time: 30000 });

        selectionCollector.on("collect", async si => {
          if (si.values[0] === "language") {
            await si.deferUpdate();

            // Get available languages
            const languages = [];
            const validLangCodes = [];

            if (bot.config.langs) {
              for (const langCode of Object.keys(bot.config.langs)) {
                const lang = bot.config.langs[langCode];
                languages.push({
                  label: lang.metadata.full_name,
                  description: lang.metadata.description,
                  value: lang.metadata.langCode,
                });
                validLangCodes.push(lang.metadata.langCode);
              }
            } else {
              languages.push({
                label: "English (en_US)",
                description: "English - United States",
                value: "en_US",
              });
              validLangCodes.push("en_US");
            }

            const langSelectRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId("select_lang")
                  .setPlaceholder("Nothing selected")
                  .addOptions(languages)
              );

            await interaction.editReply({
              embeds: [
                {
                  author: {
                    name: `Change change change, ${interaction.user.username}!`,
                    icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                  },
                  title: `${bot.config.system.emotes.question} User Settings - Change Language`,
                  color: bot.config.colors.purple,
                  description: "Neat, choose from the dropdown your new language!"
                },
              ],
              components: [langSelectRow],
            });

            // Handle language selection
            const langFilter = li => li.customId === "select_lang" && li.user.id === interaction.user.id;
            const langCollector = interaction.channel.createMessageComponentCollector({ langFilter, max: 1, time: 30000 });

            langCollector.on("collect", async li => {
              const selectedLang = li.values[0];

              if (validLangCodes.includes(selectedLang)) {
                const affectedRows = await bot.DBs.userSettings.update({ language: selectedLang }, { where: { userID: interaction.user.id } });

                if (affectedRows > 0) {
                  await li.update({
                    embeds: [
                      {
                        author: {
                          name: `Whoop whoop, ${interaction.user.username}!`,
                          icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                        },
                        title: `${bot.config.system.emotes.success} User Settings - Change Language`,
                        color: bot.config.colors.lime,
                        description: `Here's what just happened: You successfully changed your language to \`${selectedLang}\`.`
                      },
                    ],
                    components: [],
                  });
                  bot.logger.info("DISCORD", `[MESSAGE] ${interaction.user.id} changed their language.`);
                } else {
                  await li.update({
                    embeds: [
                      {
                        author: {
                          name: `Eep! Sorry about that, ${interaction.user.username}!`,
                          icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                        },
                        title: `${bot.config.system.emotes.warning} User Settings - Change Language`,
                        color: bot.config.colors.orange,
                        description: "Could not save your acknowledgement. Please try again.",
                      },
                    ],
                    components: [],
                  });
                }
              }
            });
          } else if (si.values[0] === "prefix") {
            await si.deferUpdate();

            await interaction.editReply({
              embeds: [
                {
                  author: {
                    name: `Change change change, ${interaction.user.username}!`,
                    icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                  },
                  title: `${bot.config.system.emotes.question} User Settings - Change Prefix`,
                  color: bot.config.colors.purple,
                  description: "Great! What should that new prefix be?\n*NOTE: If you enter a space, it will only take the first part before the space). Example: `a prefix` -> `a`*"
                },
              ],
              components: [],
            });

            // Wait for prefix input
            const prefixFilter = m => m.author.id === interaction.user.id;
            const prefixChannel = interaction.channel;

            const prefixCollector = prefixChannel.createMessageCollector({ filter: prefixFilter, max: 1, time: 30000 });

            prefixCollector.on("collect", async m => {
              if (m.content !== userSettings.get("prefix")) {
                const newPrefix = m.content.split(" ")[0];
                const affectedRows = await bot.DBs.userSettings.update({ prefix: newPrefix }, { where: { userID: interaction.user.id } });

                if (affectedRows > 0) {
                  await interaction.editReply({
                    embeds: [
                      {
                        author: {
                          name: `Whoop whoop, ${interaction.user.username}!`,
                          icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                        },
                        title: `${bot.config.system.emotes.success} User Settings - Change Prefix`,
                        color: bot.config.colors.lime,
                        description: `Here's what just happened: You successfully changed your prefix to \`${newPrefix}\`.`
                      },
                    ],
                    components: [],
                  });
                  bot.logger.info("DISCORD", `[MESSAGE] ${interaction.user.id} changed their prefix.`);
                } else {
                  await interaction.editReply({
                    embeds: [
                      {
                        author: {
                          name: `Eep! Sorry about that, ${interaction.user.username}!`,
                          icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                        },
                        title: `${bot.config.system.emotes.warning} User Settings - Change Prefix`,
                        color: bot.config.colors.orange,
                        description: "Could not save your acknowledgement. Please try again.",
                      },
                    ],
                    components: [],
                  });
                }
              }
            });
          }
        });
      } else if (i.customId === "optout" || i.customId === "optin") {
        const type = i.customId === "optout" ? "Opt-Out" : "Opt-In";
        const affectedRows = await bot.DBs.userSettings.update({ optedOut: (i.customId === "optout") }, { where: { userID: interaction.user.id } });

        if (affectedRows > 0) {
          await i.update({
            embeds: [
              {
                author: {
                  name: `At your request, ${interaction.user.username}!`,
                  icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                },
                title: `${bot.config.system.emotes.success} User Settings - ${type}`,
                color: bot.config.colors.lime,
                description: `Here's what just happened: You successfully ${i.customId === "optout" ? "dis" : "en"}abled analytics.`,
              },
            ],
            components: [],
          });
          bot.logger.info("DISCORD", `[MESSAGE] ${interaction.user.id} opted out.`);
        } else {
          await i.update({
            embeds: [
              {
                author: {
                  name: `Eep! Sorry about that, ${interaction.user.username}!`,
                  icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                },
                title: `${bot.config.system.emotes.warning} User Settings - ${type}`,
                color: bot.config.colors.orange,
                description: "Could not save your acknowledgement. Please try again.",
              },
            ],
            components: [],
          });
        }
      } else if (i.customId === "delete") {
        const affectedRows = await bot.functions.DB.deleteUser(interaction.user.id);

        if (affectedRows > 0) {
          await i.update({
            embeds: [
              {
                author: {
                  name: `We're sad to see you go, ${interaction.user.username}!`,
                  icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                },
                title: `${bot.config.system.emotes.success} User Settings - Delete Account`,
                color: bot.config.colors.lime,
                description: `Here's what just happened: You successfully deleted your account.`,
              },
            ],
            components: [],
          });
          bot.logger.info("DISCORD", `[MESSAGE] ${interaction.user.id} deleted their account.`);
        } else {
          await i.update({
            embeds: [
              {
                author: {
                  name: `Eep! Sorry about that, ${interaction.user.username}!`,
                  icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                },
                title: `${bot.config.system.emotes.warning} User Settings - Delete Account`,
                color: bot.config.colors.orange,
                description: "Could not save your acknowledgement. Please try again.",
              },
            ],
            components: [],
          });
        }
      }
    });

    collector.on("end", async collected => {
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
            icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
          },
          title: `${bot.config.system.emotes.information} It's all about you!`,
          color: bot.config.colors.red,
          description: `Sadly, we ran into an error while handling your profile. Here's what we know: ${error.message}`
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
