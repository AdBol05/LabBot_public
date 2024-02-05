const execpath = process.cwd();
const {
    Client,
    GatewayIntentBits,
    ActivityType,
    EmbedBuilder
} = require('discord.js');
const db = require(execpath + "/utils/db.js");
const formatName = require(execpath + '/utils/formatName.js');
const { IDs, DB } = require(execpath + '/config.json');
const err_msg = require(execpath + '/utils/err_msg.js');

module.exports = {
    description: "Stáhne json souboru pokusu (pouze pro editory)",
    args: true,
    options: [
        {
            name: "název-pokusu",
            description: "název pokusu",
            required: true,
            type: 3
        }
    ],
    requiredRole : IDs.Erole,
    async run(client, interaction, options) {
        try {
            await interaction.reply({ content: "Počkejte prosím..." });
            let searchname = formatName(options.getString("název-pokusu"));

            let data = await db.search(DB.collections.lexicon, { $text: { $search: searchname } }, { score: { $meta: "textScore" } }, { score: { $meta: "textScore" } });
            console.log(data);

            if (data.length > 0) {
                data = data[0];
                const buffer = Buffer.from(JSON.stringify(data), 'utf-8');

                let embed_data = new EmbedBuilder()
                    .setColor('#1000a3')
                    .setTitle('Záznam pokusu ' + '\"' + data.displayName + '\"');

                await interaction.editReply({
                    content: "",
                    embeds: [embed_data],
                    files: [{
                        attachment: buffer,
                        name: 'data.json',
                        type: 'text/plain',
                    }],
                });
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