const { EmbedBuilder } = require('discord.js');
const execpath = process.cwd();
const formatName = require(execpath + '/utils/formatName.js');
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
            await interaction.reply({ content: "Zpracovávám..." });

            let data = {
                name: "",
                displayName: "",
                description: "",
                storage: {
                    content: "",
                    extra: "",
                    id: ""
                },
                createdBy: {
                    name: "",
                    id: ""
                },
                URLs: []
            };

            let embeds = [];
            let name = interaction.fields.getTextInputValue('name').trim();
            let fname = formatName(name);

            let foundEntries = await db.getAll(DB.collections.lexicon, { name: fname });

            console.log("[i]Found " + foundEntries.length + " entries");
            if (foundEntries.length > 0) {
                console.log("[i]Record \"" + fname + "\" already exists");
                let embed = new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Záznam s tímto názvem již existuje!', value: 'Do systému nelze uložit dva záznamy se stejným názvem. Pokud si přeješ záznam upravit, použij příkaz `/upravit`', inline: false },)

                await interaction.editReply({ content: "", embeds: [embed], ephemeral: true });
                return;
            }

            let URLs = interaction.fields.getTextInputValue('links').trim();

            if (URLs) {
                URLs = URLs.replaceAll(" ", "").replaceAll(",", "\n").replaceAll(";", "\n");
                URLs = URLs.split("\n");

                URLs = URLs.filter(function (element) { return stringIsAValidUrl(element); });
                URLs = URLs.filter(function (element) { return element !== undefined; });

                for (let i in URLs) { URLs[i] = { link: URLs[i], domain: URL.parse(URLs[i]).hostname.replace("www.", "") }; }

                data.URLs = URLs;
            }

            data.displayName = name;
            data.name = fname;
            data.description = interaction.fields.getTextInputValue('description').trim();
            data.storage.content = interaction.fields.getTextInputValue('box').trim();
            data.storage.extra = interaction.fields.getTextInputValue('out').trim();
            data.createdBy.name = interaction.member.displayName;
            data.createdBy.id = interaction.member.id;

            let outname = "`" + data.displayName + "`";

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

            console.log("Parsed data:");
            console.log(data);

            if (await db.write(DB.collections.lexicon, data)) {
                embeds.push(new EmbedBuilder()
                    .setColor('#00e0c6')
                    .setTitle('Pokus přidán')
                    .addFields({ name: 'Uložil se pokus', value: `${outname}`, inline: false },));

                console.log("[i]User " + interaction.member.displayName + " added record \"" + data.name + "\"");
            }
            else {
                embeds.push(new EmbedBuilder()
                    .setColor('#f70202')
                    .setTitle('Chyba')
                    .addFields({ name: 'Chyba databáze', value: 'Něco se pokazilo při komunikaci s databází. Chyba byla nahlášena.', inline: false },));
            }

            interaction.editReply({ content: "", embeds: embeds, });
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.customId + "\" modal submission", err, client, interaction); }
    }
}
