const execpath = process.cwd();
const { IDs, DB } = require(execpath + '/config.json');
const { EmbedBuilder, ModalBuilder } = require('discord.js');
const formatName = require(execpath + '/utils/formatName.js');
const err_msg = require(execpath + '/utils/err_msg.js');
const db = require(execpath + '/utils/db.js');
const component = require(execpath + '/utils/ModalComponent.js');

module.exports = {
    description: "Otevře formulář upravení pokusu (pouze pro editory)",
    args: true,
    options: [
        {
            name: "název-pokusu",
            description: "název pokusu",
            required: true,
            type: 3,
            maxLength: 40
        }
    ],
    requiredRole : IDs.Erole,
    async run(client, interaction, options) {
        try {
            let name = formatName(options.getString("název-pokusu"));
            let outname = "`" + name + "`";
            let data = await db.search(DB.collections.lexicon, { $text: { $search: name } }, { score: { $meta: "textScore" } }, { score: { $meta: "textScore" } });
            console.log(data);

            if (data.length > 0) {
                data = data[0];

                let URLs = ""; //TODO construct string from URLs
                if (data.URLs.length > 0) {
                    for (let i in data.URLs) {
                        URLs += data.URLs[i].link;
                        URLs += "\n";
                    }
                }
                URLs = URLs.trim();

                const modal = new ModalBuilder()
                    .setCustomId(`update|${data.name}`)
                    .setTitle(`"${data.displayName}"`)
                    .addComponents([
                        component('box', 'věci v bedně', 'Paragraph', 2, 1024, 'Seznam věcí v bedně', false, data.storage.content),
                        component('out', 'věci mimo bednu', 'Paragraph', 2, 1024, 'Seznam věcí, co nejsou v bedně', false, data.storage.extra),
                        component('description', 'Popis pokusu', 'Paragraph', 2, 1024, 'Krátký popis pokusu', false, data.description),
                        component('links', 'Odkazy (max 5)', 'Paragraph', 3, 1024, 'Odkazy např. na videa nebo články\nPiště jeden odkaz na jeden řádek nebo je oddělujte čárkou', false, URLs)
                    ]);
                await interaction.showModal(modal);
            }
            else {
                const embed = new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Pokus se nepodařilo najít', value: 'Pokus ' + '"' + `${outname}` + '"' + ' nebyl nalezen. Zkus příkaz `/list` pro zobrazení uložených pokusů. Třeba to byl jen překlep ;)', inline: false },)
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}
