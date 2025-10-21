const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.4",
		author: "Octavio Wina",
		countDown: 5,
		role: 0,
		description: "Changer le préfixe du bot dans ce chat ou dans tout le système (admin seulement)",
		category: "config",
		guide: {
			fr: "   {pn} <nouveau préfixe>: changer le préfixe dans ce chat"
				+ "\n    Exemple:"
				+ "\n     {pn} #"
				+ "\n\n   {pn} <nouveau préfixe> -g: changer le préfixe dans tout le système (admin bot)"
				+ "\n    Exemple:"
				+ "\n     {pn} # -g"
				+ "\n\n   {pn} reset: remettre le préfixe par défaut"
		}
	},

	langs: {
		fr: {
			reset: "💀 Votre préfixe a été réinitialisé par défaut : %1 💀",
			onlyAdmin: "🔥 Seuls les admins peuvent changer le préfixe du bot global 🔥",
			confirmGlobal: "💀 Réagissez à ce message pour confirmer le changement du préfixe global 💀",
			confirmThisThread: "💀 Réagissez à ce message pour confirmer le changement du préfixe dans ce chat 💀",
			successGlobal: "👑 Le préfixe global du bot est maintenant : %1 👑",
			successThisThread: "👹 Le préfixe de ce chat est maintenant : %1 👹",
			myPrefix: "👑──💀 PRÉFIXE ACTUEL 💀──👑\n"
				+ "│ 🌐 Global : %1\n"
				+ "│ 🛸 Chat : %2\n"
				+ "╰─────────────⭓"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] === 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			const prefixGlobal = global.GoatBot.config.prefix;
			const prefixThread = utils.getPrefix(event.threadID);
			const box = "👹═🩸═💀═⚔️═👑═💀═🩸═👹\n"
				+ `│ 🌐 Prefix Global : ${prefixGlobal}\n`
				+ `│ 🛸 Prefix Chat : ${prefixThread}\n`
				+ "👹═🩸═💀═⚔️═👑═💀═🩸═👹";
			return message.reply(box);
		}
	}
};
