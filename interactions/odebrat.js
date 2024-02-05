const Discord = require("discord.js");
const execpath = process.cwd();
const { IDs, DB } = require(execpath + '/config.json');
const formatName = require(execpath + '/utils/formatName.js');
const err_msg = require(execpath + '/utils/err_msg.js');
const db = require(execpath + "/utils/db.js");

module.exports = {
    description: "Smaže pokus (pouze pro editory)",
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
            let name = options.getString("název-pokusu");
            let fname = formatName(name);
            let outname = "`" + name + "`";
            await interaction.reply({ content: "Počkejte prosím..." });

            let foundEntries = await db.getAll(DB.collections.lexicon, { name: fname });

            console.log("[i]Found " + foundEntries.length + " entries");
            if (foundEntries.length > 0) {

                let delresult = await db.deleteOne(DB.collections.lexicon, { name: fname });
                if (!delresult) {
                    let embed = new Discord.EmbedBuilder()
                        .setColor('#f70202')
                        .setTitle('Chyba')
                        .addFields({ name: 'Chyba databáze', value: 'Něco se pokazilo při komunikaci s databází. Chyba byla nahlášena.', inline: false })
                    interaction.editReply({ content: "", embeds: [embed] });
                    return;
                }

                let embed = new Discord.EmbedBuilder()
                    .setColor('#00e0c6')
                    .setTitle('Pokus odebrán')
                    .addFields({ name: 'Smazal se pokus', value: `${outname}`, inline: false },)
                interaction.editReply({ content: "", embeds: [embed] });
                console.log("[i]User " + interaction.member.displayName + " deleted record " + fname);
            }
            else {
                let embed = new Discord.EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Pokus se nepodařilo najít', value: 'Pokus ' + '"' + `${outname}` + '"' + ' nebyl nalezen. U příkazu pro odstranění záznamu je funkce vyhledávání vypnuta. Prosím zadej přesný název. Zkus příkaz `/list` pro zobrazení uložených pokusů.', inline: false },)
                interaction.editReply({ content: "", embeds: [embed], ephemeral: true });
                return;
            }
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}
