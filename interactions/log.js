const execpath = process.cwd();
const { IDs, ELogPath, OLogPath } = require(execpath + "/config.json");
const Discord = require("discord.js");
const fs = require('fs');
const err_msg = require(execpath + "/utils/err_msg.js");

module.exports = {
    description: "Pošle posledních 100 řádků záznamů (pouze pro vývojáře)",
    args: false,
    requiredRole : IDs.Admin,
    async run(client, interaction) {
        try {
            let OutputLog = fs.readFileSync(OLogPath, 'utf8').split("\n").slice(-100).join("\n");
            let ErrorLog = fs.readFileSync(ELogPath, 'utf8').split("\n").slice(-100).join("\n");

            let OutputLog_ = Buffer.from(OutputLog, 'utf-8');
            let ErrorLog_ = Buffer.from(ErrorLog, 'utf-8');

            interaction.reply({
                content:"",
                files: [
                    {
                        attachment: ErrorLog_,
                        name: 'error.txt',
                        type: 'text/plain'
                    },
                    {
                        attachment: OutputLog_,
                        name: 'output.txt',
                        type: 'text/plain'
                    }
                ],
                ephemeral: true
            });
        }
        catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("\"" + interaction.commandName + "\" interaction", err, client, interaction); }
    }
}