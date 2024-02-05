module.exports = {
    async run(client, message, args) {
    const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
    
    const backId = 'back'
    const forwardId = 'forward'
    const backButton = new MessageButton({
      style: 'SECONDARY',
      label: 'Předchozí',
      emoji: '⬅️',
      customId: backId
    })
    const forwardButton = new MessageButton({
      style: 'SECONDARY',
      label: 'Další',
      emoji: '➡️',
      customId: forwardId
    })
    
    const fs = require("fs");
    let files = [];
    fs.readdirSync("./pokusy/").forEach(file => {
        files.push(file.replace(".json", ""));
        });
    console.log(files);

    const {author, channel} = message
    const generateEmbed = async start => {
    const current = files.slice(start, start + 10)
    //let outname = "`" + data.nazev + "`";

      return new MessageEmbed({
        title: `Seznam pokusů ${start + 1}-${start + current.length} / ${
          files.length
        }`,
        color: '#00ff1a',
        fields: await Promise.all(
          current.map(async file => ({
            name: (files.indexOf(file) + 1).toString(),
            value: "`" + `${file}` + "`"
          }))
        )
      })
    }
    
    // Send the embed with the first 10 records
    const canFitOnOnePage = files.length <= 10
    const embedMessage = await channel.send({
      embeds: [await generateEmbed(0)],
      components: canFitOnOnePage
        ? []
        : [new MessageActionRow({components: [forwardButton]})]
    })
    // Exit if there is only one page of records (no need for all of this)
    if (canFitOnOnePage) return
    const collector = embedMessage.createMessageComponentCollector({
      filter: ({user}) => user.id === author.id
    })
    
    let currentIndex = 0
    collector.on('collect', async interaction => {
      // Increase/decrease index
      interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)
      // Respond to interaction by updating message with new embed
      await interaction.update({
        embeds: [await generateEmbed(currentIndex)],
        components: [
          new MessageActionRow({
            components: [
              // back button if it isn't the start
              ...(currentIndex ? [backButton] : []),
              // forward button if it isn't the end
              ...(currentIndex + 10 < files.length ? [forwardButton] : [])
            ]
          })
        ]
      })
    })
  }
}