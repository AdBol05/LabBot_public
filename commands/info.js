module.exports = {
    async run(client, message, args) {
        const Discord = require("discord.js");

        const embed = new Discord.MessageEmbed()
            .setColor('#FDC800')
            .setTitle('Informace a použití')
            .setThumbnail('https://user-images.githubusercontent.com/98588523/194335228-4940c632-fed4-4666-a9ba-6ba85d1c5870.png')
            .addFields(
                { name: 'Popis', value: 'Bot určený pro ukládání, správu a využívání záznamů o pokusech', inline: false },
                { name: 'Použití', value: 'Pomocí příkazu `/pokus [název pokusu]` se vyvolá stránka s informacemi o pokusu. Pokud si nejste jistí, jak se přesně pokus jmenuje, příkaz `/list` zobrazí seznam všech uložených pokusů. (např. `/pokus ultrazvuk` zobrazí informace o pokusu "ultrazvuk")', inline: false },
                { name: 'Správa záznamů (pouze pro editor roli)', value: 'Záznamy pokusů se přidávjí pomocí formuláře, který lze vyvolat příkazem `/pridat`. Systém ignoruje diakritiku a velká písmena při ukládání i vyhledávání.\nPro odebrání záznamu poté slouží příkaz `/odebrat [název pokusu]`. \nZáznamy se také dají ze systému stáhnout příkazem `/stahnout [název pokusu]`.', inline: false },
                { name: 'Správa bota (pouze pro vývojáře)', value: 'Pro aktualizaci zdrojového kódu slouží příkaz `/update`, který z githubu stáhne poslední verzi všech souborů a pošle výstup z konzole jako .txt soubor pro jednodušší opravu případných chyb. \nPokud je třeba bota restartovat, lze použít příkaz `/restart`. Pro jistotu je zde také příkaz `!update`, který slouží jako záloha v případě, že selže původní `/update`.', inline: false },

            )
            .setFooter({ text: 'Adam Bolemant', iconURL: 'https://avatars.githubusercontent.com/u/98588523?s=96&v=4' });
        message.channel.send({ embeds: [embed] });

    }
}