const execpath = process.cwd();
const { IDs } = require(execpath + '/config.json');
const Discord = require("discord.js");
const { exec } = require('child_process');
const fs = require('fs');
const err_msg = require(execpath + '/utils/err_msg.js');

module.exports = {
    description: "Aktualizace zdrojového kódu (pouze pro vývojáře)",
    args: false,
    requiredRole : IDs.Admin,
    async run(client, interaction) {
        try {
            const embed_1 = new Discord.EmbedBuilder()
                .setColor('#1000a3')
                .setTitle('Downloading current source code...')
            
            interaction.reply({ embeds: [embed_1], ephemeral: true });

            exec('git pull', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);

                let gitout = Buffer.from(stdout, 'utf-8');
                let giterr = Buffer.from(stderr, 'utf-8');

                const embed_2 = new Discord.EmbedBuilder()
                    .setColor('#1000a3')
                    .setTitle('Source code updated')

                interaction.editReply({ 
                    embeds: [embed_2], 
                    files: [                    {
                        attachment: gitout,
                        name: 'gitout.txt',
                        type: 'text/plain'
                        },
                        {
                        attachment: giterr,
                        name: 'giterr.txt',
                        type: 'text/plain'
                        }
                    ],
                    ephemeral: true });
                console.log("[i]User " + interaction.member.displayName + " updated code");
            });
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}