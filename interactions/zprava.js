const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('discord.js');
const execpath = process.cwd();
const { IDs } = require(execpath + '/config.json');
const err_msg = require(execpath + '/utils/err_msg.js');

module.exports = {
    description: "Otevře formulář vytvoření specialní zprávy (pouze pro editory)",
    args: true,
    options: [
        {
            name: "kanál",
            description: "kam poslat zprávu",
            required: true,
            type: 7,
            channelTypes: [0]
        }
    ],
    requiredRole : IDs.Erole,
    async run(client, interaction, options) {
        try {
            let channelID = options.getChannel("kanál").toString().replaceAll('<', '').replaceAll('>', '').replaceAll('#', '');
            console.log("[i]Send to: " + channelID);

            const modal = new ModalBuilder()
                .setCustomId('create-modal-zprava')
                .setTitle('Formulář vytvoření specialní zprávy')
                .addComponents([
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('label')
                            .setLabel('Nadpis')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(256)
                            .setPlaceholder('Nadpis zprávy')
                            .setRequired(true),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('sublabel')
                            .setLabel('Podnadpis')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(256)
                            .setPlaceholder('Podnadpis zprávy')
                            .setRequired(true),
                    ),


                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('content')
                            .setLabel('Text zprávy')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(1024)
                            .setPlaceholder('Samotný text zprávy')
                            .setRequired(true),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('HEXcolor')
                            .setLabel('Barva (HEX), přednastaveno, nepovinná')
                            .setStyle('Short')
                            .setMinLength(6)
                            .setMaxLength(7)
                            .setPlaceholder('HEX kód barvy postranního proužku zprávy')
                            .setRequired(false)
                            .setValue('#00ff1a'),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('target-channel')
                            .setLabel('ID (přednastaveno)')
                            .setStyle('Short')
                            .setMinLength(18)
                            .setMaxLength(22)
                            .setPlaceholder('ID cílového kanálu')
                            .setRequired(true)
                            .setValue(channelID),
                    ),
                ]);

            await interaction.showModal(modal);
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}