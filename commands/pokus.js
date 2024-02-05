module.exports = {
    async run(client, message, args) {
        const Discord = require("discord.js");
        const fs = require("fs");
        let nazev = "";

        for(let i = 0; i < args.length; i++){
            nazev = nazev + " " + args[i];
        }
        nazev = nazev.trim();

        let outname = "`" + nazev + "`";

        if(nazev !== undefined && !nazev.includes('/') && fs.existsSync("./pokusy/" + nazev + ".json")){
            let data = JSON.parse(fs.readFileSync("./pokusy/" + nazev + ".json", "utf-8"));
            const embed = new Discord.MessageEmbed()
                .setColor('#00ff1a')
                .setTitle(`${outname}`)
                .addFields(
                    { name: 'Obsah bedny:', value: `${data.krabice}`, inline: false },
                    { name: 'Mimo bednu:', value: `${data.mimo}`, inline: false },
                    { name: 'Základní popis:', value: `${data.popis}`, inline: false },
            )
            message.channel.send({ embeds: [embed] });
        }
        else{
            const embed = new Discord.MessageEmbed()
                .setColor('#f70202')
                .setTitle('Chyba')
                .addFields({ name: 'Pokus se nepodařilo najít', value: 'Pokus ' + '"' + `${outname}` + '"' + ' nebyl nalezen. Zkus příkaz `!list` pro zobrazení uložených pokusů. Třeba to byl jen překlep ;)', inline: false },)
            message.channel.send({ embeds: [embed] });
        }
    }
}