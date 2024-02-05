module.exports = {
    async run(client, message, args) {
        const Discord = require("discord.js");
        const { exec } = require('child_process');
        const { AdminID } = require('../config.json');

        if(message.author.id === AdminID){
            const embed = new Discord.MessageEmbed()
                .setColor('#99039c')
                .setTitle('Restart bota...')
            message.channel.send({ embeds: [embed]});
            exec('pm2 restart LabBot',(error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
            });
        }
        else{
            const embed = new Discord.MessageEmbed()
                .setColor('#f70202')
                .setTitle('Chyba')
                .addFields({ name: 'Nedostatečná práva', value: 'Zpomal kamaráde! Na tuhle akci nemáš oprávnění!', inline: false },)
            message.channel.send({ embeds: [embed]});
            console.log("User " +  message.author.username  + " attempted to restart bot without permission");
        }
    }
}