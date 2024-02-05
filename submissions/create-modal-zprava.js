const { EmbedBuilder } = require('discord.js');
const Discord = require("discord.js");
const execpath = process.cwd();
const err_msg = require(execpath + '/utils/err_msg.js');
const { IDs } = require(execpath + '/config.json');

module.exports = {
    requiredRole : IDs.Erole,
    async run(interaction, client) {
        try {
            let target = interaction.fields.getTextInputValue('target-channel');
            let color = interaction.fields.getTextInputValue('HEXcolor');
            let Label = interaction.fields.getTextInputValue('label');
            let SubLabel = interaction.fields.getTextInputValue('sublabel');
            let text = interaction.fields.getTextInputValue('content');

            if (color === undefined || color.length < 6) { color = '#00ff1a'; }
            if (!color.startsWith('#')) { color = '#' + color; }

            let hexreg = /^#[0-9A-F]{6}$/i;
            let embed;

            if (hexreg.test(color)) {
                embed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setTitle(Label)
                    .addFields({ name: `${SubLabel}`, value: `${text}`, inline: false })
                    .setFooter({ text: "od: " + interaction.member.displayName })
                try {
                    client.channels.fetch(target).then(channel => { channel.send({ embeds: [embed] }); });
                    const embed_done = new EmbedBuilder()
                        .setColor('#00ff1a')
                        .setTitle('Hotovo')
                        .addFields({ name: 'Zpráva odeslána', value: 'Pokud zprávu nevidíš, zkontroluj zadané informace (např. ID a oprávnění kanálu)', inline: false },)
                    interaction.reply({ embeds: [embed_done], ephemeral: true });
                }
                catch (error) {
                    console.error(error);
                }
            }
            else {
                embed = new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Neplatná barva', value: 'Zadaný hex kód barvy není použitelný. Nastevení barvý **není povinné**. Když ji nenastavíš, bude použita zelená. \nSprávný tvar kódu vypadá třeba takhle: `#00ff1a`', inline: false },)
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        catch (err) { console.error("[!]Error during modal submission: " + err); err_msg("\"" + interaction.customId + "\" modal submission", err, client, interaction); }
    }
}
