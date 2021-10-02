const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "a/";
bot.prefix = prefix
const MessageEmbed = require("discord.js");
const fs = require("fs");
const bdd = require("./bdd.json");
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(3000);

bot.on("ready", async() => {
  console.log("Bot prêt")
  bot.user.setStatus("online");
  let statuts = [
    bot.guilds.cache.size + ` serveurs [${prefix}/help]`,
    `${prefix}/help pour les commandes !`,
    "créé par PauLem79YT, Entreprise FlashBot ©"
  ]
  setInterval(function() {
      let stats = statuts[Math.floor(Math.random()*statuts.length)];
      bot.user.setActivity(stats, {type: "PLAYING"})
  }, 5000)
});

bot.on("guildCreate", guild => {
  console.log(`Le bot a été ajouté au serveur ${guild.name}`)
  bdd[guild.id] = {}
  bdd[guild.id]["Nom"] = guild.name
  bdd[guild.id]["warn"] = {}
  Savebdd();
});

bot.on("message", async(message) => {
  if(message.author.bot) return;

  if(message.content.startsWith(bot.prefix + "debug")){
    bdd[message.guild.id] = {}
    bdd[message.guild.id]["Nom"] = message.guild.name
    bdd[message.guild.id]["warn"] = {}
    Savebdd();
    message.reply("debug !")
  }

    if (message.content.startsWith(bot.prefix + 'lock')){
    if (!message.member.hasPermission('MANAGE_CHANNELS')) {
   return message.channel.send("Vous n'avez pas les permissions")
   }
   const channel = message.mentions.channels.first()
   if(!channel) return message.channel.send('Veuillez fournir un salon !')
   channel.overwritePermissions([
     {
        id: message.guild.id,
        deny : ['SEND_MESSAGES'],
     },
    ],);
   const embed = new Discord.MessageEmbed()
   .setTitle("Channel Lock")
   .setDescription(`${channel} a été verrouillé`)
   .setColor("RANDOM");
   await message.channel.send(embed);
   message.delete();
    }

    //Unlock
  if (message.content.startsWith(bot.prefix + 'unlock')){
   if (!message.member.hasPermission('MANAGE_CHANNELS')) {
   return message.channel.send("Vous n'avez pas les permissions")
   }
   const channels = message.mentions.channels.first()
   if(!channels) return message.channel.send('Veuillez fournir un salon !')
   channels.overwritePermissions([
     {
        id: message.guild.id,
        allow : ['SEND_MESSAGES'],
     },
    ],);
   const embed = new Discord.MessageEmbed()
   .setTitle("Salon Unlock")
   .setDescription(`${channels} a été déverrouillé`)
   .setColor("RANDOM");
   await message.channel.send(embed);
   message.delete();      
  }

  if(message.content.startsWith(bot.prefix + "userinfo")){
    if(message.mentions.users.first()){
      const userinfoembed = new Discord.MessageEmbed()
      .setTitle(`Info du membre : ${message.mentions.users.first().username}`)
      .addFields(
        { name: 'ID : ', value: message.mentions.users.first().id, inline: true },
        { name: 'Mention : ', value: message.mentions.users.first(), inline: true },
        { name: 'Nom : ', value: message.mentions.users.first().username, inline: true },
        { name: 'Nombre de Rôles : ', value: message.member.roles.cache.size, inline: true },
        { name: 'Dernière raison de warn : ', value: bdd[message.guild.id]["warn"]["reason"][message.mentions.users.first().id] || "Aucun", inline: true }
      )
    message.channel.send(userinfoembed)
    } else {
      message.reply(":x: Veuillez mentionner un utilisateur !");
    }
  }

  if (message.content.startsWith(bot.prefix + 'avatar')) {
  let user = message.mentions.users.first();
  if(!user) user = message.author;
  const avatarembed = new Discord.MessageEmbed()
    .setTitle("Voici l'avatar de cette personne !")
    .setImage(user.avatarURL())
    .setColor('RANDOM')
    .setThumbnail(user.avatarURL())
  message.channel.send(avatarembed)
 }

  if(message.content.startsWith(bot.prefix + "clear")){
    if(message.member.hasPermission('MANAGE_MESSAGES')){
	  message.delete();
          let args = message.content.trim().split(/ +/g);
           if(args[1]){
               if(!isNaN(args[1]) && args[1] >= 1 && args[1] <= 99){
                   //on effectue le clear

                  message.channel.bulkDelete(args[1])
                    message.channel.send(`**Vous avez supprimé ${args[1]} message(s)** :white_check_mark:`);
                }
                else {
                    message.channel.send(`Vous devez indiquer une valeur entre 1 et 99 !`)
                }
            }
            else{
                message.channel.send(`Vous devez indiquer un nombre de messages à supprimer !`)
            }
        }
        else{
            message.channel.send("Vous devez avoir la permission `MANAGE_MESSAGES` pour exécuter cette commande !")
        }
  }

  if(message.content.startsWith(bot.prefix + "statsbot")){
    let totalservers = bot.guilds.cache.size;

        const statsbot = new Discord.MessageEmbed()
        //On créé un Embed contenant toutes les infos du serveur
	        .setColor('RANDOM')
	        .setTitle('Stats du bot')
	        .setDescription('Voici les statistiques du bot')
	        .setTimestamp()
	        .setFooter('Par Paulem79')
	        .addFields(
			        { name: 'Nom : ', value: bot.user.username, inline: true },
              { name: 'ID : ', value: bot.user.id, inline: true },
              { name: "Salons (dans tout les serveurs) : ", value: `${bot.channels.cache.size}`, inline: true },
              { name: "Serveurs : ", value: `${bot.guilds.cache.size}`, inline: true },
              { name: "Utilisateurs (dans tout les serveurs) : ", value: `${bot.users.cache.size}`, inline: true }
	        )
        message.channel.send(statsbot);
  }

  if(message.content.startsWith(bot.prefix + "warn")){
    let args = message.content.trim().split(" ").slice(2);
    if(!bdd[message.guild.id]["warn"]){
      bdd[message.guild.id]["warn"] = {}
      bdd[message.guild.id]["warn"]["reason"] = {}
      Savebdd();
      message.reply("Réexécuter la commande");
    } else if (bdd[message.guild.id]["warn"] && !bdd[message.guild.id]["warn"]["reason"]){
      bdd[message.guild.id]["warn"]["reason"] = {}
      Savebdd();
      message.reply("Réexécuter la commande");
    } else {
      if(message.member.hasPermission('BAN_MEMBERS')){
        if(!message.mentions.users.first()) return message.channel.send("**:x: Il faut indiquer une personne à warn !**");
        utilisateur = message.mentions.users.first().id
        if(bdd[message.guild.id]["warn"][utilisateur] == 2){
          delete bdd[message.guild.id]["warn"][utilisateur]
          const warnEmbed = new Discord.MessageEmbed()
          .setTitle("Ban")
          .setDescription(`Tu as été ban du serveur **${message.guild.name}** !`)
          .setColor('#ff9900')

          message.mentions.users.first().send(warnEmbed)
          message.guild.members.ban(utilisateur)
          message.channel.send("**L'utilisateur a bien été ban :white_check_mark:**");
        } else{
          if(!bdd[message.guild.id]["warn"][utilisateur]){
            bdd[message.guild.id]["warn"][utilisateur] = 1
            bdd[message.guild.id]["warn"]["reason"][utilisateur] = args.join(" ");
            Savebdd();
            message.channel.send("**L'utilisateur a bien été averti :white_check_mark: , il a à présent " + bdd[message.guild.id]["warn"][utilisateur] + " avertissement**");
          }
          else{
            bdd[message.guild.id]["warn"][utilisateur]++
            bdd[message.guild.id]["warn"]["reason"][utilisateur] = args.join(" ");
            Savebdd();
            message.channel.send("**L'utilisateur a bien été averti :white_check_mark: , il a à présent " + bdd[message.guild.id]["warn"][utilisateur] + " avertissement**");
          }
        }
      } else {
        message.reply("Permissions `BAN_MEMBERS` requises !");
      }
    }
  }

    if(message.content.startsWith(bot.prefix + "unwarn")){
    if(!bdd[message.guild.id]["warn"]){
      bdd[message.guild.id]["warn"] = {}
      Savebdd()
    }
    if(message.member.hasPermission('BAN_MEMBERS')){
     if(message.mentions.users.first()){
      utilisateur = message.mentions.users.first().id
      if(bdd[message.guild.id]["warn"][utilisateur] == 2){
        bdd[message.guild.id]["warn"][utilisateur]--
        Savebdd()
        message.channel.send("**L'utilisateur a bien été unwarn :white_check_mark: , il a à présent " + bdd[message.guild.id]["warn"][utilisateur] + " avertissement**")
      }
      else{
        if(!bdd[message.guild.id]["warn"][utilisateur]){
          message.channel.send("**L'utilisateur n'a pas de warn !**")
        }
        else{
          bdd[message.guild.id]["warn"][utilisateur]--
          Savebdd();
          message.channel.send("**L'utilisateur a bien été unwarn :white_check_mark: , il a à présent " + bdd[message.guild.id]["warn"][utilisateur] + " avertissement**")
        }
      }
     } else {
       message.channel.send("**:x: Il faut indiquer une personne à unwarn !**");
     }
    } else {
      message.reply("Vous n'avez pas les permissions requises !");
    }
  }

  if (message.content.startsWith(bot.prefix + 'kick')) {
    if(message.member.hasPermission('KICK_MEMBERS')){
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      if (member) {
        member
          .kick(`Kické par ${message.member.author}`)
          .then(() => {
            message.reply(`**:white_check_mark: L'utilisateur ${user} a bien été kick**`)
          })
          .catch(err => {
            message.reply("**:x: Je n'ai pas pu kicker le membre**")
            console.error(err);
          });
      } else {
        message.reply("**:x: Cet utilisateur n'est pas dans cette guilde !**")
      }
    } else {
      message.reply("**:x: Vous devez mentionner un membre à kick !**")
    }
    } else {
      message.reply("Vous n'avez pas les permissions requises !");
    }
  }

  if (message.content.startsWith(bot.prefix + 'ban')) {
    if(message.member.hasPermission('BAN_MEMBERS')){
    const user = message.mentions.users.first();
    if (user) {
      const member = message.guild.member(user);
      let reason = `Banni par ${message.author}`
      if (member) {
        member
          .ban({
            reason: reason
          })
          .then(() => {
            message.reply(`**:white_check_mark: L'utilisateur ${user} a bien été banni**`)
          })
          .catch(err => {
            message.reply("**:x: Je n'ai pas pu bannir le membre**")
            console.error(err);
            message.channel.send("Raison : " + err)
          });
      } else {
        message.reply("**:x: Cet utilisateur n'est pas dans cette guilde !**")
      }
    } else {
      message.reply("**:x: Vous devez mentionner un utilisateur à bannir !**")
    }
    } else {
      message.reply("Vous n'avez pas les permissions requises !");
    }
  }

  if(message.content.startsWith(bot.prefix + "ping")){
    message.channel.send("Pinging...").then(m =>{
      var ping = m.createdTimestamp - message.createdTimestamp;
      var embed = new Discord.MessageEmbed()
      .setAuthor(`Pong ! le ping est de ${ping}`)
      .setColor('RANDOM')
      m.edit(embed)
    })
  }

  if(message.content.startsWith(bot.prefix + "invite")){
    if(message.author.id == "787021462619947018"){
      message.author.send(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=8`);
      message.reply("Regarde en mp ;)");
    } else {
      message.reply("Tu ne peux pas ! C'est un bot privé !")
    }
  }
});

bot.on("message", async(message) => {
  if(message.author.bot) return
  if (message.content.startsWith(bot.prefix + "help")) {
    //Help de base
    const helpembed = new Discord.MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`${bot.user.username} Toutes les commandes`)
      .setTimestamp(new Date())
      .addFields(
        { name: `${bot.prefix}help`, value: "permet d'afficher ce message", inline: false },
        { name: `${bot.prefix}invite`, value:"inviter le bot", inline: false },
        { name: '🔑 Modération :', value: `${bot.prefix}ban [MENTION] \n ${bot.prefix}warn [MENTION] \n ${bot.prefix}unwarn [MENTION] \n ${bot.prefix}kick [MENTION] \n ${bot.prefix}clear [NB_MESSAGES] \n ${bot.prefix}statsbot \n ${bot.prefix}userinfo [MENTION] \n ${bot.prefix}avatar [MENTION] \n ${bot.prefix}lock [MENTION_SALON] \n ${bot.prefix}unlock [MENTION_SALON] \n ${bot.prefix}ping`, inline: false }
      )
    message.channel.send(helpembed);
  }
});

function Savebdd() {
  fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
    if (err) message.channel.send("Une erreur est survenue.");
  });
}

bot.login(process.env.TOKEN);