
const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin"],
    version: "1.5",
    author: "Octavio Wina",
    countDown: 5,
    role: 2,
    description: {
      fr: "Activer/désactiver le mode uniquement admin pour utiliser le bot"
    },
    category: "owner",
    guide: {
      fr: "╔══ 🔱 UTILISATION 🔱 ══╗\n" +
          "• {pn} on → Activer le mode uniquement admin 👑\n" +
          "• {pn} off → Désactiver le mode uniquement admin 💀\n" +
          "• {pn} noti on → Activer la notification quand un non-admin utilise le bot 🔥\n" +
          "• {pn} noti off → Désactiver la notification quand un non-admin utilise le bot 🔥\n" +
          "╚═══════════════════════╝"
    }
  },

  langs: {
    fr: {
      turnedOn: "🔥👑 Mode uniquement admin activé ! 👑🔥",
      turnedOff: "💀 Mode uniquement admin désactivé ! 💀",
      turnedOnNoti: "🔥 Notification pour non-admin activée ! 🔥",
      turnedOffNoti: "⚡ Notification pour non-admin désactivée ! ⚡",
      syntaxError: "⚠️ Syntaxe incorrecte ! Utilise {pn} on/off ou {pn} noti on/off"
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isSetNoti = false;
    let value;
    let indexGetVal = 0;

    if (args[0] === "noti") {
      isSetNoti = true;
      indexGetVal = 1;
    }

    if (args[indexGetVal] === "on") value = true;
    else if (args[indexGetVal] === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    if (isSetNoti) {
      config.hideNotiMessage.adminOnly = !value;
      message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
    } else {
      config.adminOnly.enable = value;
      message.reply(getLang(value ? "turnedOn" : "turnedOff"));
    }

    fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
  }
};
