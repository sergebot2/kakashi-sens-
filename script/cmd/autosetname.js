function checkShortCut(nickname, uid, userName) {
  /\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, userName) : null;
  /\{userID\}/gi.test(uid) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;
  return nickname;
}

module.exports = {
  config: {
    name: "autosetname",
    version: "1.3",
    author: "Octavio Wina",
    cooldowns: 5,
    role: 1,
    description: {
      fr: "Auto change nickname of new member avec shortcuts {userName}, {userID}"
    },
    category: "box chat",
    guide: {
      fr: "╔══ 🔧 UTILISATION 🔧 ══╗\n" +
          "• {pn} set <nickname> : Définir le modèle de pseudo (ex: {userName} 🚀)\n" +
          "• {pn} [on | off] : Activer / Désactiver la fonction\n" +
          "• {pn} [view | info] : Afficher la configuration actuelle\n" +
          "╚═══════════════════════╝"
    }
  },

  langs: {
    fr: {
      missingConfig: "⚠️ | Veuillez entrer une configuration",
      configSuccess: "✅ | Configuration autoSetName définie avec succès",
      currentConfig: "📌 | Configuration autoSetName actuelle :\n%1",
      notSetConfig: "❌ | Votre groupe n'a pas encore défini la configuration autoSetName",
      syntaxError: "⚠️ | Syntaxe incorrecte, utilisez uniquement \"{pn} on\" ou \"{pn} off\"",
      turnOnSuccess: "✅ | Fonction autoSetName activée",
      turnOffSuccess: "✅ | Fonction autoSetName désactivée",
      error: "⚠️ | Une erreur est survenue, vérifiez les permissions ou essayez plus tard"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    switch (args[0]) {
      case "set":
      case "add":
      case "config": {
        if (args.length < 2)
          return message.reply(getLang("missingConfig"));
        const configAutoSetName = args.slice(1).join(" ");
        await threadsData.set(event.threadID, configAutoSetName, "data.autoSetName");
        return message.reply(getLang("configSuccess"));
      }
      case "view":
      case "info": {
        const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");
        return message.reply(configAutoSetName ? getLang("currentConfig", configAutoSetName) : getLang("notSetConfig"));
      }
      default: {
        const enableOrDisable = args[0];
        if (enableOrDisable !== "on" && enableOrDisable !== "off")
          return message.reply(getLang("syntaxError"));
        await threadsData.set(event.threadID, enableOrDisable === "on", "settings.enableAutoSetName");
        return message.reply(enableOrDisable === "on" ? getLang("turnOnSuccess") : getLang("turnOffSuccess"));
      }
    }
  },

  onEvent: async ({ message, event, api, threadsData, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;
    if (!await threadsData.get(event.threadID, "settings.enableAutoSetName")) return;
    const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");

    return async function () {
      const addedParticipants = [...event.logMessageData.addedParticipants];
      for (const user of addedParticipants) {
        const { userFbId: uid, fullName: userName } = user;
        try {
          await api.changeNickname(checkShortCut(configAutoSetName, uid, userName), event.threadID, uid);
        } catch (e) {
          return message.reply(getLang("error"));
        }
      }
    };
  }
};
