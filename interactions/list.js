const execpath = process.cwd();
const err_msg = require(execpath + "/utils/err_msg.js");
const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, createMessageComponentCollector } = require('discord.js');
const db = require(execpath + "/utils/db.js");
const { DB, IDs } = require(execpath + "/config.json");

module.exports = {
  description: "Zobrazí seznam uložených pokusů",
  args: false,
  requiredRole : IDs.Lrole,
  async run(client, interaction) {
    try {
      await interaction.reply({ content: "Počkejte prosím..." });

      const backId = 'back'
      const forwardId = 'forward'
      const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        label: 'Předchozí',
        emoji: '⬅️',
        customId: backId
      })
      const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        label: 'Další',
        emoji: '➡️',
        customId: forwardId
      })

      let files = await db.aggregate(DB.collections.lexicon, [
        { $project: { _id: 0, name: 1, displayName: 1 } },
        { $sort: { name: 1 } }
      ]);
      console.log("[i]Loaded " + files.length + " files");

      const { author, channel } = interaction
      const generateEmbed = async start => {
        const current = files.slice(start, start + 10)
        return new EmbedBuilder({
          title: `Seznam pokusů ${start + 1}-${start + current.length} / ${files.length}`,
          color: 0x00ff1a,
          fields: await Promise.all(
            current.map(async file => ({
              name: (files.indexOf(file) + 1).toString(),
              value: "`" + `${file.displayName}` + "`"
            }))
          )
        })
      }

      // Send the embed with the first 10 records
      const canFitOnOnePage = files.length <= 10
      let embedMessage = await interaction.editReply({
        content: "",
        embeds: [await generateEmbed(0)],
        components: canFitOnOnePage ? [] : [new ActionRowBuilder({ components: [forwardButton] })],
        fetchReply: true
      });

      // Exit if there is only one page of records (no need for all of this)
      if (canFitOnOnePage) return
      let collector = embedMessage.createMessageComponentCollector()

      let currentIndex = 0
      collector.on('collect', async interaction => {
        // Increase/decrease index
        interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
        // Respond to interaction by updating message with new embed
        await interaction.update({
          content: "",
          embeds: [await generateEmbed(currentIndex)],
          components: [
            new ActionRowBuilder({
              components: [...(currentIndex ? [backButton] : []), ...(currentIndex + 10 < files.length ? [forwardButton] : [])]
            })
          ]
        })
      })
    }
    catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
  }
}