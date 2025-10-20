const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "admin",
    version: "1.7",
    author: "Octavio Wina",
    countDown: 5,
    role: 2,
    description: {
      fr: "Ajouter, retirer ou afficher les administrateurs du bot avec affichage du nom, UID et TID"
    },
    category: "système",
    guide: {
      fr:
        "╔══ 🔱 UTILISATION 🔱 ══╗\n" +
        "• {pn} add <uid | @tag> → Ajouter un admin 👑\n" +
        "• {pn} remove <uid | @tag> → Retirer un admin 💀\n" +
        "• {pn} list → Afficher la liste des admins 🔥\n" +
        "╚═══════════════════════╝"
    }
  },

  langs: {
    fr: {
      added:
        "🔥👑 *Ajout réussi !* 👑🔥\n\n" +
        "➤ %1 utilisateur(s) promus au rang *Admin Royal* dans le groupe : %2\n" +
        "Détails :\n%3",
      alreadyAdmin:
        "⚠️ Ces utilisateurs sont déjà des *Admin Royaux* :\n%2",
      missingIdAdd:
        "⚠️ Mentionne ou indique l’ID de la personne à ajouter en tant qu’administrateur.",
      removed:
        "💀 *Admin déchu !* 💀\n➤ %1 utilisateur(s) ont perdu leur statut :\n%2",
      notAdmin:
        "⚠️ Ces utilisateurs ne sont pas administrateurs :\n%2",
      missingIdRemove:
        "⚠️ Mentionne ou indique l’ID de la personne à retirer des administrateurs.",
      listAdmin:
        "👑 *Liste des Administrateurs Royaux :*\n\n%1",
      invoking: [
        "⚔️ Invocation du pouvoir royal... 👑",
        "🔥 Les flammes du Dark Mode s’éveillent... 💀",
        "✨ Les sceaux de l’autorité apparaissent... 🔥",
        "⚡ Préparation du registre des admins... 👑"
      ]
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const lang = getLang;

    // Animation initiale
    for (const line of lang("invoking")) {
      await message.reply(line);
      await sleep(600);
    }

    switch (args[0]) {
      case "add":
      case "-a": {
        if (!args[1]) return message.reply(lang("missingIdAdd"));

        let uids = [];
        if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
        else if (event.messageReply) uids.push(event.messageReply.senderID);
        else uids = args.filter(arg => !isNaN(arg));

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        config.adminBot.push(...notAdminIds);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getInfos = await Promise.all(
          uids.map(uid =>
            usersData.getName(uid).then(name => ({ uid, name }))
          )
        );

        const details = getInfos
          .filter(({ uid }) => notAdminIds.includes(uid))
          .map(({ name, uid }) => `• Nom : ${name} | UID : ${uid} | TID : ${event.threadID}`)
          .join("\n");

        return message.reply(
          (notAdminIds.length
            ? lang("added", notAdminIds.length, event.threadID, details)
            : "") +
          (adminIds.length
            ? lang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• UID : ${uid}`).join("\n"))
            : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1]) return message.reply(lang("missingIdRemove"));

        let uids = [];
        if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
        else uids = args.filter(arg => !isNaN(arg));

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        for (const uid of adminIds)
          config.adminBot.splice(config.adminBot.indexOf(uid), 1);

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getNames = await Promise.all(
          adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );

        const details = getNames.map(({ name, uid }) => `• Nom : ${name} | UID : ${uid} | TID : ${event.threadID}`).join("\n");

        return message.reply(
          (adminIds.length
            ? lang("removed", adminIds.length, event.threadID, details)
            : "") +
          (notAdminIds.length
            ? lang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• UID : ${uid}`).join("\n"))
            : "")
        );
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(
          config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
        );
        const details = getNames.map(({ name, uid }) => `• Nom : ${name} | UID : ${uid}`).join("\n");
        return message.reply(lang("listAdmin", details));
      }

      default:
        return message.reply(
          "⚠️ Commande inconnue ! Utilise `admin help` pour voir toutes les options."
        );
    }
  }
};
