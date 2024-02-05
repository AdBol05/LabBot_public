const Discord = require("discord.js");
const { exec } = require('child_process');
const fs = require('fs');
const { AdminID } = require('../config.json');
module.exports = {
    async run(client, message, args) {
        if(message.author.id === AdminID){
            exec('git pull',(error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
            const embed = new Discord.MessageEmbed()
                .setColor('#99039c')
                .setTitle('Synchronizace zdrojového kódu proti githubu...')
            message.channel.send({ embeds: [embed]});
        }
        else{
            const embed = new Discord.MessageEmbed()
                .setColor('#f70202')
                .setTitle('Chyba')
                .addFields({ name: 'Nedostatečná práva', value: 'Zpomal kamaráde! Na tuhle akci nemáš oprávnění', inline: false },)
            message.channel.send({ embeds: [embed]});
        }
    }
}
