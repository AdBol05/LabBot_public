const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const execpath = process.cwd();
const formatName = require(execpath + '/utils/formatName.js');
const err_msg = require(execpath + '/utils/err_msg.js');
const db = require(execpath + "/utils/db.js");
const { DB, IDs } = require(execpath + "/config.json");

module.exports = {
    description: "Zobrazí informace o pokusu",
    args: true,
    options: [
        {
            name: "název-pokusu",
            description: "název pokusu",
            required: true,
            type: 3
        }
    ],
    requiredRole : IDs.Lrole,
    async run(client, interaction, options) {
        try {
            await interaction.reply({ content: "Počkejte prosím..." });
            let searchname = formatName(options.getString("název-pokusu"));

            let data = await db.search(DB.collections.lexicon, { $text: { $search: searchname } }, { score: { $meta: "textScore" } }, { score: { $meta: "textScore" } });
            console.log(data);

            if (data.length > 0) {
                data = data[0];

                let embed = new EmbedBuilder().setColor('#00ff1a').setTitle(`\`${data.displayName}\``);

                if (data.storage.content) { embed.addFields({ name: "Obsah bedny:", value: `${data.storage.content}`, inline: false }); }
                if (data.storage.extra) { embed.addFields({ name: "Mimo bednu:", value: `${data.storage.extra}`, inline: false }); }
                if (data.description) { embed.addFields({ name: "Popis pokusu:", value: `${data.description}`, inline: false }); }
                if (data.createdBy.name) { embed.setFooter({ text: `Vytvořil/a: ${data.createdBy.name}` }); }

                let row;
                if(data.URLs.length > 0){
                    row = new ActionRowBuilder();
                    for (let i in data.URLs) {
                        row.addComponents([
                            new ButtonBuilder()
                                .setLabel(data.URLs[i].domain)
                                .setURL(data.URLs[i].link)
                                .setStyle(ButtonStyle.Link)
                        ]);
                    }
                }

                await interaction.editReply({ content: "", embeds: [embed], components: (data.URLs.length > 0) ? [row] : [] });
            }
            else {
                const embed = new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Pokus se nepodařilo najít', value: 'Pokus ' + '"' + `${searchname}` + '"' + ' nebyl nalezen. Zkus příkaz `/list` pro zobrazení uložených pokusů. Třeba to byl jen překlep ;)', inline: false },)
                await interaction.editReply({ content: "", embeds: [embed], ephemeral: true });
            }
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}