const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder
} = require('discord.js');

const execpath = process.cwd();
let args = process.argv.splice(2);

const err_msg = require(execpath + "/utils/err_msg.js");
const db = require(execpath + "/utils/db.js");
const fs = require("fs");

const { token, TestToken, channels, prefix, IDs, DB, EnableLegacyCommands} = require(execpath + "/config.json");

let AdminChannel;
if (args.includes("--test") || args.includes("-T") || args.includes("-t")) { AdminChannel = channels.TestChannel; }
else { AdminChannel = channels.AdminChannel; }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let Commands = new Map();
let ICommands = new Map();
let submissions = new Map();

console.log("    __          __    ____        __ \n   / /   ____ _/ /_  / __ )____  / /_\n  / /   / __ `/ __ \\/ __  / __ \\/ __/\n / /___/ /_/ / /_/ / /_/ / /_/ / /_  \n/_____/\\__,_/_.___/_____/\\____/\\__/ ");

if (!fs.existsSync(execpath + "/temp")) { fs.mkdirSync(execpath + "/temp"); }

client.once("ready", async () => {
  try {
    client.user.setPresence({ activities: [{ name: `Laborky`, type: ActivityType.Watching }] });

    // message commands
    if (EnableLegacyCommands) {
      const cmds = fs.readdirSync(execpath + "/commands");
      cmds.forEach(cmd => {
        const fn = require(execpath + "/commands/" + cmd);
        let fnm = cmd.replace(".js", "");
        Commands.set(fnm, fn);
        console.log("Imported \"" + fnm +"\"");
      })

      console.log("\nLoaded massage commands (" + prefix + "):");
      console.table(Object.fromEntries(Commands));
    }
    else { console.log("\nMessage commands are disabled!\n"); }

    // interactions
    let interactions = client.application.commands

    const inter = fs.readdirSync(execpath + "/interactions");
    inter.forEach(intr => {
      const inr = require(execpath + "/interactions/" + intr);
      intr = intr.replace(".js", "");
      ICommands.set(intr, inr);
      
      let descr = inr.description;
      let opt = inr.options;
      
      interactions.create({
        name: intr,
        description: descr,
        options: inr.args ? opt : undefined
      });

      console.log("Imported \"" + intr +"\"");
    });

    console.log("\nLoaded slash commands:");
    console.table(Object.fromEntries(ICommands));
    console.log();

    // submissions
    const subs = fs.readdirSync(execpath + "/submissions");
    subs.forEach(sub => {
      const sb = require(execpath + "/submissions/" + sub);
      let sbs = sub.replace(".js", "")
      submissions.set(sbs, sb);
      console.log("Imported \"" + sbs +"\"");
    })

    console.log("\nLoaded submissions:");
    console.table(Object.fromEntries(submissions));

    // startup message
    console.log("\n\n#Client ready#\n-------------------------------------");
    console.log(" [#]  -  Trigerred slash command");
    console.log(" [*]  -  Trigerred message command");
    console.log(" [>]  -  Received modal submission");
    console.log(" [{}] -  Database operation message");
    console.log(" [i]  -  General info message");
    console.log(" [!]  -  Error message");
    console.log("-------------------------------------\n");

    let channel = await client.channels.fetch(AdminChannel)
    let msg;

    let startupEmbed = new EmbedBuilder()
      .setColor('#00ff1a')
      .setTitle('I\'m back online!')
      .setThumbnail('https://user-images.githubusercontent.com/98588523/194335228-4940c632-fed4-4666-a9ba-6ba85d1c5870.png')
      .addFields(
        { name: "loaded !commands (deprecated):", value: `${EnableLegacyCommands ? Commands.size : "disabled"}`, inline: false },
        { name: "loaded /commands:", value: `${ICommands.size}`, inline: false },
        //{ name: "loaded records:", value: `${record_len}`, inline: false }
      )
      .setFooter({ text: 'Adam Bolemant', iconURL: 'https://avatars.githubusercontent.com/u/98588523?s=96&v=4' });

    await channel.send({ content: `<@${IDs.Admin}>`, embeds: [startupEmbed] });

    let DBembed = new EmbedBuilder().setColor('#1000a3').setTitle("Connecting to database...");
    msg = await channel.send({ embeds: [DBembed] });

    // database setup
    if (!await db.init(client)) {
      console.error("\n[!!] Database startup failed! Aborting! [!!]");

      DBembed = new EmbedBuilder()
        .setColor('#f70202')
        .setTitle('Unable to connect to database!')
        .addFields({name: "Aborting!", value: "An error occured while connecting to the database server. Please check logs for more info."})
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/8911/8911085.png')
      await msg.edit({ embeds: [DBembed] });

      process.exit(1);
    }

    await db.createCollection(DB.collections.users);
    await db.createCollection(DB.collections.storage);
    await db.createCollection(DB.collections.lexicon);
    await db.index(DB.collections.lexicon, DB.index);
    let DBstructure = await db.logStructure();

    DBembed = new EmbedBuilder()
      .setColor('#00e0c6')
      .setTitle('Connection to database established')
      .setThumbnail('https://cdn-icons-png.flaticon.com/128/8686/8686102.png')
      .addFields(
        { name: "Accessible database structure:", value: "\`\`\`" + DBstructure + "\`\`\`", inline: false }
      );

    await msg.edit({ embeds: [DBembed] });

    // Database startup backup
    if(DB.BackupOnStartup){
      let BackupEmbed = new EmbedBuilder().setColor('#1000a3').setTitle("Backing up database...");
      msg = await channel.send({ embeds: [BackupEmbed] });

      let lxcBCKP = await db.backup(DB.collections.lexicon, DB.backupFolder);
      let usrsBCKP = await db.backup(DB.collections.users, DB.backupFolder);
      let strgBCKP = await db.backup(DB.collections.storage, DB.backupFolder);

      let BackupReportEmbed = new EmbedBuilder()
        .setColor((lxcBCKP.ok && usrsBCKP.ok && strgBCKP.ok) ? '#00e0c6' : '#fc9403')
        .setTitle((lxcBCKP.ok && usrsBCKP.ok && strgBCKP.ok) ? 'Database backed up' : 'Database backup failed')
        .addFields(
          { name: DB.collections.lexicon, value: `Status: \`${lxcBCKP.ok}\` \nExported entries: \`${lxcBCKP.ok ? lxcBCKP.exportedEntries : "---"}\` \nFile size: \`${lxcBCKP.ok ? (lxcBCKP.fileSize / 1024).toFixed(2) + " KB" : "---"}\` \nTimestamp: \`${lxcBCKP.ok ? lxcBCKP.date : "---"}\`` },
          { name: DB.collections.storage, value: `Status: \`${usrsBCKP.ok}\` \nExported entries: \`${usrsBCKP.ok ? usrsBCKP.exportedEntries : "---"}\` \nFile size: \`${usrsBCKP.ok ? (usrsBCKP.fileSize / 1024).toFixed(2) + " KB" : "---"}\` \nTimestamp: \`${usrsBCKP.ok ? usrsBCKP.date : "---"}\`` },
          { name: DB.collections.users, value: `Status: \`${strgBCKP.ok}\` \nExported entries: \`${strgBCKP.ok ? strgBCKP.exportedEntries : "---"}\` \nFile size: \`${strgBCKP.ok ? (strgBCKP.fileSize / 1024).toFixed(2) + " KB" : "---"}\` \nTimestamp: \`${strgBCKP.ok ? strgBCKP.date : "---"}\`` }
        );
      
      await msg.edit({embeds: [BackupReportEmbed]});
    }

    // Database startup shrink
    if (DB.ShrinkOnStartup) {
      let ShrinkInfoEmbed = new EmbedBuilder().setColor('#1000a3').setTitle("Shrinking database collections...");

      msg = await channel.send({ embeds: [ShrinkInfoEmbed] });

      let shrinkLexicon = await db.shrink(DB.collections.lexicon);
      let shrinkUsers = await db.shrink(DB.collections.users);
      let shrinkStorage = await db.shrink(DB.collections.storage);

      let ShrinkReportEmbed = new EmbedBuilder()
        .setColor((shrinkLexicon.ok && shrinkUsers.ok && shrinkStorage.ok) ? '#00e0c6' : '#fc9403')
        .setTitle((shrinkLexicon.ok && shrinkUsers.ok && shrinkStorage.ok) ? 'Database collections shrinked' : 'Database collections shrink failed')
        .addFields(
          { name: DB.collections.lexicon, value: `Status: \`${shrinkLexicon.ok}\` \nFreed: \`${shrinkLexicon.ok ? (shrinkLexicon.bytesFreed / 1024).toFixed(2) + " KB" : "---"}\`` },
          { name: DB.collections.storage, value: `Status: \`${shrinkStorage.ok}\` \nFreed: \`${shrinkStorage.ok ? (shrinkStorage.bytesFreed / 1024).toFixed(2) + " KB" : "---"}\`` },
          { name: DB.collections.users, value: `Status: \`${shrinkUsers.ok}\` \nFreed: \`${shrinkUsers.ok ? (shrinkUsers.bytesFreed / 1024).toFixed(2) + " KB" : "---"}\`` }
        );

      await msg.edit({ embeds: [ShrinkReportEmbed] });
    }

    console.log("\n-----------------------------------------------\n# Startup successful. System active. Welcome. #\n-----------------------------------------------\n");
  }
  catch (err) { console.error("[!]Error during client startup: " + err); err_msg("client startup", err, client); }
})

client.on("messageCreate", (message) => {
  try {
    if (!message.content.startsWith(prefix)) { return; }
    const command = message.content.split(prefix)[1].split(" ")[0];
    console.log("[*]" + message.author.username + "(" + message.author.id + ") used " + command);
    let args = message.content.split(" ");
    args.shift();
    const commandFunction = Commands.get(command);
    if (commandFunction !== undefined) { commandFunction.run(client, message, args); }
  }
  catch (err) { console.error("[!]Error during message command execution: " + err); err_msg("message command execution", err, client, message); }
})

client.on('interactionCreate', async (interaction) => {
  try {
    const { commandName, options } = interaction;
    if (interaction.isCommand()) {
        
      let interactionFunction = ICommands.get(commandName);

      if(interaction.member.id == IDs.Admin || 
        interaction.member.roles.cache.has(interactionFunction.requiredRole) || 
        interactionFunction.requiredRole === undefined || 
        interactionFunction.requiredRole === null){
              
          console.log("[#]" + interaction.member.displayName + "(" + interaction.member.id + ") used interaction " + commandName);
          if (interactionFunction !== undefined) {
          if (options !== undefined) { interactionFunction.run(client, interaction, options/*, db*/); }
          else { interactionFunction.run(client, interaction); }
        }
      }
      else{
        const embed = new EmbedBuilder()
          .setColor('#f70202')
          .setTitle('Chyba')
          .addFields({ name: 'Nedostatečná práva', value: 'Zpomal kamaráde! Na tuhle akci nemáš oprávnění', inline: false },)
        console.log("[!]User " + interaction.member.displayName + "(" + interaction.member.id + ") " + "attempted to use interaction " + commandName + " without permission");
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    }

    if (interaction.isModalSubmit()) {
      let id = interaction.customId.split("|")[0];
      let submissionFunction = submissions.get(id);

      if(interaction.member.id == IDs.Admin || 
        interaction.member.roles.cache.has(submissionFunction.requiredRole) || 
          submissionFunction.requiredRole === undefined || 
          submissionFunction.requiredRole === null){
            
            console.log("[>]" + interaction.member.displayName + "(" + interaction.member.id + ") submitted modal " + id);
            submissionFunction.run(interaction, client);
        }
      else{
        const embed = new EmbedBuilder()
          .setColor('#f70202')
          .setTitle('Chyba')
          .addFields({ name: 'Nedostatečná práva', value: 'Zpomal kamaráde! Na tuhle akci nemáš oprávnění', inline: false },)
        console.log("[!]User " + interaction.member.displayName + "(" + interaction.member.id + ") " + "attempted to submit modal " + interaction.customId + " without permission");
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
  catch (err) { console.error("[!]Error during interaction execution: " + err); err_msg("interaction execution", err, client, interaction); }

});

if (args.includes("--test") || args.includes("-T") || args.includes("-t")) {
  console.log("RUNNING IN TEST MODE");
  client.login(TestToken);
}
else { client.login(token) }
console.log("Starting up, please wait ...");
