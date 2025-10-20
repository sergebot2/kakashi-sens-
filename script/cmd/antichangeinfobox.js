
const { getStreamFromURL, uploadImgbb } = global.utils;
const OWNER_UID = "61579262818537"; // UID exempté

module.exports = {
  config: {
    name: "antichangeinfobox",
    version: "1.9",
    author: "Octavio Wina",
    countDown: 5,
    role: 0,
    description: {
      fr: "Activer/désactiver la protection contre le changement d’infos du groupe (avatar, nom, nickname, theme, emoji)"
    },
    category: "box chat",
    guide: {
      fr: "╔══ 🔱 UTILISATION 🔱 ══╗\n" +
          "• {pn} avt [on|off] → Protection contre le changement d’avatar 🔥\n" +
          "• {pn} name [on|off] → Protection contre le changement de nom 👑\n" +
          "• {pn} nickname [on|off] → Protection contre le changement de nickname 💀\n" +
          "• {pn} theme [on|off] → Protection contre le changement de thème 🔥\n" +
          "• {pn} emoji [on|off] → Protection contre le changement d’emoji 👑\n" +
          "╚═══════════════════════╝"
    }
  },

  langs: {
    fr: {
      antiChangeAvatarOn: "🔥👑 Protection avatar activée ! 👑🔥",
      antiChangeAvatarOff: "💀 Protection avatar désactivée ! 💀",
      missingAvt: "⚠️ Aucun avatar défini pour ce groupe !",
      antiChangeNameOn: "🔥👑 Protection nom activée ! 👑🔥",
      antiChangeNameOff: "💀 Protection nom désactivée ! 💀",
      antiChangeNicknameOn: "🔥👑 Protection nickname activée ! 👑🔥",
      antiChangeNicknameOff: "💀 Protection nickname désactivée ! 💀",
      antiChangeThemeOn: "🔥👑 Protection thème activée ! 👑🔥",
      antiChangeThemeOff: "💀 Protection thème désactivée ! 💀",
      antiChangeEmojiOn: "🔥👑 Protection emoji activée ! 👑🔥",
      antiChangeEmojiOff: "💀 Protection emoji désactivée ! 💀",
      antiChangeAvatarAlreadyOn: "⚡ Tentative de changer l’avatar détectée ! Retour à l’avatar protégé 🔥",
      antiChangeAvatarAlreadyOnButMissingAvt: "⚠️ Tentative de changer l’avatar, mais aucun avatar défini pour ce groupe !",
      antiChangeNameAlreadyOn: "⚡ Tentative de changer le nom détectée ! Retour au nom protégé 🔥",
      antiChangeNicknameAlreadyOn: "⚡ Tentative de changer le nickname détectée ! Retour au nickname protégé 🔥",
      antiChangeThemeAlreadyOn: "⚡ Tentative de changer le thème détectée ! Retour au thème protégé 🔥",
      antiChangeEmojiAlreadyOn: "⚡ Tentative de changer l’emoji détectée ! Retour à l’emoji protégé 🔥"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang }) {
    if (!["on", "off"].includes(args[1])) return message.SyntaxError();
    const { threadID } = event;
    const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

    async function checkAndSaveData(key, data) {
      if (args[1] === "off") delete dataAntiChange[key];
      else dataAntiChange[key] = data;
      await threadsData.set(threadID, dataAntiChange, "data.antiChangeInfoBox");
      message.reply(getLang(`antiChange${key[0].toUpperCase() + key.slice(1)}${args[1][0].toUpperCase() + args[1].slice(1)}`));
    }

    switch (args[0]) {
      case "avt":
      case "avatar":
      case "image": {
        const { imageSrc } = await threadsData.get(threadID);
        if (!imageSrc) return message.reply(getLang("missingAvt"));
        const newImage = await uploadImgbb(imageSrc);
        await checkAndSaveData("avatar", newImage.image.url);
        break;
      }
      case "name": {
        const { threadName } = await threadsData.get(threadID);
        await checkAndSaveData("name", threadName);
        break;
      }
      case "nickname": {
        const { members } = await threadsData.get(threadID);
        await checkAndSaveData(
          "nickname",
          members.reduce((acc, user) => ({ ...acc, [user.userID]: user.nickname }), {})
        );
        break;
      }
      case "theme": {
        const { threadThemeID } = await threadsData.get(threadID);
        await checkAndSaveData("theme", threadThemeID);
        break;
      }
      case "emoji": {
        const { emoji } = await threadsData.get(threadID);
        await checkAndSaveData("emoji", emoji);
        break;
      }
      default: return message.SyntaxError();
    }
  },

  onEvent: async function ({ message, event, threadsData, role, api, getLang }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

    if (author === OWNER_UID) return; // Exemption totale pour ton UID

    switch (logMessageType) {
      case "log:thread-image":
        if (!dataAntiChange.avatar || role >= 1) return;
        message.reply(getLang("antiChangeAvatarAlreadyOn"));
        return api.changeGroupImage(await getStreamFromURL(dataAntiChange.avatar), threadID);

      case "log:thread-name":
        if (!dataAntiChange.name || role >= 1) return;
        message.reply(getLang("antiChangeNameAlreadyOn"));
        return api.setTitle(dataAntiChange.name, threadID);

      case "log:user-nickname":
        if (!dataAntiChange.nickname || role >= 1) return;
        const { participant_id } = logMessageData;
        message.reply(getLang("antiChangeNicknameAlreadyOn"));
        return api.changeNickname(dataAntiChange.nickname[participant_id], threadID, participant_id);

      case "log:thread-color":
        if (!dataAntiChange.theme || role >= 1) return;
        message.reply(getLang("antiChangeThemeAlreadyOn"));
        return api.changeThreadColor(dataAntiChange.theme || "196241301102133", threadID);

      case "log:thread-icon":
        if (!dataAntiChange.emoji || role >= 1) return;
        message.reply(getLang("antiChangeEmojiAlreadyOn"));
        return api.changeThreadEmoji(dataAntiChange.emoji, threadID);
    }
  }
};
