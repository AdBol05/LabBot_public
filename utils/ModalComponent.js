const { ActionRowBuilder, TextInputBuilder } = require('discord.js');

module.exports = (id, label, style, min, max, placeholder, required, value) => {
    let component = new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(style)
        .setMinLength(min)
        .setMaxLength(max)
        .setPlaceholder(placeholder)
        .setRequired(required);

    if(value){component = component.setValue(value)}

    let output = new ActionRowBuilder().addComponents(component);

    return output;
}