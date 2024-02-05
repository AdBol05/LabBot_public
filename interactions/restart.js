const execpath = process.cwd();
const Discord = require("discord.js");
const { exec } = require('child_process');
const { IDs } = require(execpath + '/config.json');
const err_msg = require(execpath + '/utils/err_msg.js');

module.exports = {
    description: "Restart systému (pouze pro vývojáře)",
    args: false,
    requiredRole : IDs.Admin,
    async run(client, interaction) {
        try {
            const embed = new Discord.EmbedBuilder()
                .setColor('#1000a3')
                .setTitle('System restart in progress...')
            interaction.reply({ embeds: [embed], ephemeral: true });
            exec('pm2 restart LabBot', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
            });
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}