module.exports = {
    async run(client, message, args) {
        const { AdminID } = require('../config.json');
        const Discord = require("discord.js");
        const { exec } = require('child_process');
        const fs = require('fs');
        if(message.author.id === AdminID){
            exec('git pull',(error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);

                fs.writeFileSync("./gitout.txt", stdout.toString(), function (err) {
                    if (err) {console.error('Something fucked up the gitout file creation');}
                });

                fs.writeFileSync("./giterr.txt", stderr.toString(), function (err) {
                    if (err) {console.error('Something fucked up the giterr file creation');}
                });

                const embed = new Discord.MessageEmbed()
                    .setColor('#99039c')
                    .setTitle('Synchronizace zdrojového kódu proti githubu...')
                message.channel.send({ embeds: [embed]});
                message.channel.send({ files: ["./gitout.txt", "./giterr.txt"] });
                console.log("User " +  message.author.username  + " updated code");
            });    
        }
        else{
            const embed = new Discord.MessageEmbed()
                .setColor('#f70202')
                .setTitle('Chyba')
                .addFields({ name: 'Nedostatečná práva', value: 'Zpomal kamaráde! Na tuhle akci nemáš oprávnění', inline: false },)
            message.channel.send({ embeds: [embed]});
            console.log("User " +  message.author.username + " attempted to update code without permission");

        }
    }
}
