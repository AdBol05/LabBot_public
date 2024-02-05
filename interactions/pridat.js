const execpath = process.cwd();
const { IDs } = require(execpath + '/config.json');
const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('discord.js');
const err_msg = require(execpath + '/utils/err_msg.js');

module.exports = {
    description: "Otevře formulář vytvoření pokusu (pouze pro editory)",
    args: false,
    options: [
        {
            name: "název-pokusu",
            description: "název pokusu",
            required: true,
            type: 3
        }
    ],
    requiredRole : IDs.Erole,

    async run(client, interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('create-modal-pokus')
                .setTitle('Formulář vytvoření pokusu')
                .addComponents([
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('name')
                            .setLabel('Název pokusu')
                            .setStyle('Short')
                            .setMinLength(2)
                            .setMaxLength(40)
                            .setPlaceholder('Název pokusu')
                            .setRequired(true),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('box')
                            .setLabel('Věci v bedně')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(1024)
                            .setPlaceholder('Seznam věcí v bedně')
                            .setRequired(false),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('out')
                            .setLabel('Věci mimo bednu')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(1024)
                            .setPlaceholder('Seznam věcí, co nejsou v bedně')
                            .setRequired(false),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('description')
                            .setLabel('Popis pokusu')
                            .setStyle('Paragraph')
                            .setMinLength(2)
                            .setMaxLength(1024)
                            .setPlaceholder('Krátký popis pokusu')
                            .setRequired(false),
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('links')
                            .setLabel('Odkazy (max 5)')
                            .setStyle('Paragraph')
                            .setMinLength(3)
                            .setMaxLength(1024)
                            .setPlaceholder('Odkazy např. na videa nebo články\nPiště jeden odkaz na jeden řádek nebo je oddělujte čárkou')
                            .setRequired(false),
                    ),
                ]);

            await interaction.showModal(modal);
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}
