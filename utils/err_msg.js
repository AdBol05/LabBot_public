module.exports = async (action, message, client, interaction) => {
  try {
    const { EmbedBuilder } = require('discord.js');
    const execpath = process.cwd();
    const { IDs, channels } = require(execpath + "/config.json");
    const AdminChannel = channels.AdminChannel;

    let user = undefined;
    if (action.includes("interaction") && interaction) { user = interaction.member.displayName + "(" + interaction.member.id + ")"; }
    else if (action.includes("message command") && interaction) { user = interaction.author.username + "(" + interaction.author.id + ")"; }

    console.log("[!]> " + message + " | " + user);

    let embed_error = new EmbedBuilder()
      .setColor('#f70202')
      .setTitle('Runtime error!')
      .setThumbnail('https://pics.freeicons.io/uploads/icons/png/21197267291644374637-512.png')
      .addFields(
        { name: "During operation:", value: `${action}`, inline: true },
        { name: "Error message:", value: ` \`\`\`${message}\`\`\` `, inline: false }
      )
      .setFooter({ text: 'Adam Bolemant', iconURL: 'https://avatars.githubusercontent.com/u/98588523?s=96&v=4' });

    if (user !== undefined) {
      console.log(user);
      embed_error = embed_error.addFields({ name: "Triggered by:", value: `${user}`, inline: true });
    }

    await client.channels.fetch(AdminChannel).then(channel => { channel.send({ content: `<@${IDs.Admin}>`, embeds: [embed_error] }); });
  }
  catch (err) { console.error("[!][!] Error handling error message! \n Error: " + err + "\n" + message); }
}