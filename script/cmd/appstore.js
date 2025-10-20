// ╔═══════════════════════════════════════╗
// 🔥👑 COMMANDE APPSTORE ENCADRÉE - DARK / ROYAL / INFERNAL 👑🔥
// Auteur : Octavio Wina
// Version : 1.3
// Description : Recherche et affiche les apps sur l'App Store avec style
// ╚═══════════════════════════════════════╝

const itunes = require("searchitunes");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "appstore",
    version: "1.3",
    author: "Octavio Wina",
    countDown: 5,
    role: 0,
    description: {
      fr: "Recherche une application sur l'App Store et l'affiche dans un style encadré"
    },
    category: "software",
    guide: "╔══ 🔍 UTILISATION 🔍 ══╗\n" +
           "• {pn} <mot-clé>\n" +
           "• Exemple : {pn} PUBG\n" +
           "╚═══════════════════════╝",
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    fr: {
      missingKeyword: "⚠️ | Vous n'avez pas entré de mot-clé",
      noResult: "❌ | Aucun résultat trouvé pour le mot-clé : %1"
    }
  },

  onStart: async function ({ message, args, commandName, envCommands, getLang }) {
    if (!args[0])
      return message.reply(getLang("missingKeyword"));

    let results = [];
    try {
      results = (await itunes({
        entity: "software",
        country: "VN",
        term: args.join(" "),
        limit: envCommands[commandName].limitResult
      })).results;
    }
    catch (err) {
      return message.reply(getLang("noResult", args.join(" ")));
    }

    if (results.length > 0) {
      const attachments = [];
      let msg = "👑🔥 Résultats AppStore :\n";

      for (const result of results) {
        // Construire un mini-cadré Dark / Royal
        msg += "╔══════════════════════╗\n";
        msg += `• Nom : ${result.trackCensoredName}\n`;
        msg += `• Auteur : ${result.artistName}\n`;
        msg += `• Prix : ${result.formattedPrice}\n`;
        msg += `• Note : ${"🌟".repeat(Math.round(result.averageUserRating || 0))} (${(result.averageUserRating || 0).toFixed(1)}/5)\n`;
        msg += `• Lien : ${result.trackViewUrl}\n`;
        msg += "╚══════════════════════╝\n";
        attachments.push(await getStreamFromURL(result.artworkUrl512 || result.artworkUrl100 || result.artworkUrl60));
      }

      message.reply({ body: msg, attachment: await Promise.all(attachments) });
    }
    else {
      message.reply(getLang("noResult", args.join(" ")));
    }
  }
};
