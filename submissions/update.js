const { EmbedBuilder } = require('discord.js');
const execpath = process.cwd();
const err_msg = require(execpath + '/utils/err_msg.js');
const db = require(execpath + "/utils/db.js");
const { DB, IDs } = require(execpath + "/config.json");

const URL = require("url");

const stringIsAValidUrl = (s) => {
    try {
        new URL.URL(s);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = {
    requiredRole : IDs.Erole,
    async run(interaction, client) {
        try {
            let embeds = [];
            let fname = interaction.customId.split("|")[1];;
            await interaction.reply({ content: "Zpracovávám..." });

            let data = {
                description: "",
                storage: {
                    content: "",
                    extra: ""
                },
                createdBy:{
                    name: "",
                    id: ""
                },
                URLs: []
            };

            let foundEntries = await db.getAll(DB.collections.lexicon, { name: fname });
            console.log("[i]Found " + foundEntries.length + " entries");

            if (foundEntries.length > 0) {
                let URLs = interaction.fields.getTextInputValue('links').trim();

                if (URLs) {
                    URLs = URLs.replaceAll(" ", "").replaceAll(",", "\n").replaceAll(";", "\n");
                    URLs = URLs.split("\n");

                    URLs = URLs.filter(function (element) { return stringIsAValidUrl(element); });
                    URLs = URLs.filter(function (element) { return element !== undefined; });

                    for (let i in URLs) { URLs[i] = { link: URLs[i], domain: URL.parse(URLs[i]).hostname.replace("www.", "") }; }

                    data.URLs = URLs;
                }

                let foundData = foundEntries[0];

                data.description = interaction.fields.getTextInputValue('description').trim();
                data.storage.content = interaction.fields.getTextInputValue('box').trim();
                data.storage.extra = interaction.fields.getTextInputValue('out').trim();
                data.createdBy.name = interaction.member.displayName;
                data.createdBy.id = interaction.member.id;

                if (data.URLs.length > 5) {
                    let ignoredURLs = data.URLs.slice(-5);
                    let ignoredString = "";

                    for (let i in ignoredURLs) {
                        ignoredString += ignoredURLs[i];
                        ignoredString += "\n";
                    }

                    ignoredString = ignoredString.trim();

                    embeds.push(new EmbedBuilder()
                        .setColor('#fc9403')
                        .setTitle('Varování')
                        .addFields(
                            { name: 'Do jednoho záznamu lze uložit maximálně pět odkazů', value: `Bylo jich uloženo pouze prvních pět. Zbytek byl ignorován.`, inline: false },
                            { name: 'Ignorované odkazy:', value: `\`\`\`${ignoredString}\`\`\`` }
                        ));

                    data.URLs = data.URLs.slice(0, 5);
                }

                console.log(data);
                let res = await db.edit(DB.collections.lexicon, { name: fname }, { $set: data });
                console.log(res);

                if (res.acknowledged) {
                    embeds.push(new EmbedBuilder()
                        .setColor('#00e0c6')
                        .setTitle(`Upravil se pokus \`${foundData.displayName}\``)
                        .addFields(
                            { name: "nalezeno záznamů:", value: `\`${res.matchedCount}\``, inline: false },
                            { name: "upraveno záznamů:", value: `\`${res.modifiedCount}\``, inline: false },
                            { name: "vytvořeno záznamů:", value: `\`${res.upsertedCount}\``, inline: false }
                        )
                    );
                }
                else {
                    embeds.push(new EmbedBuilder()
                        .setColor('#f70202')
                        .setTitle('Chyba')
                        .addFields({ name: 'Chyba databáze', value: 'Něco se pokazilo při komunikaci s databází. Chyba byla nahlášena.', inline: false })
                    );

                    err_msg("Database entry update (not acknowledged)", res, client, interaction);
                }

                await interaction.editReply({ content: "", embeds: embeds });
                return;
            }
            else {
                let embed = new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Pokus se nepodařilo najít', value: 'Pokus ' + '"' + `${outname}` + '"' + ' nebyl nalezen. Zkus příkaz `/list` pro zobrazení uložených pokusů.', inline: false },)
                await interaction.editReply({ content: "", embeds: [embed], ephemeral: true });
                return;
            }
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.customId + "\" modal submission", err, client, interaction); }
    }
}
