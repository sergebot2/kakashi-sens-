const { getTime } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Octavio Wina",
		category: "events"
	},

	langs: {
		fr: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",
			welcomeBot: "Merci de m'avoir ajouté dans le groupe !\nPrefix du bot : %1\nTapez %1help pour voir la liste des commandes",
			defaultWelcome: "🌌 Bonjour {userName} !\n🔥 Bienvenue {multiple} dans le groupe : {threadName}\n🕹️ Passez un excellent {session} !",
			multiple1: "à toi",
			multiple2: "à vous tous"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		// Quand le bot est ajouté au groupe
		if (event.logMessageType === "log:subscribe" && event.logMessageData.addedParticipants.some(u => u.userFbId === api.getCurrentUserID())) {
			const prefix = global.utils.getPrefix(event.threadID);
			const msg = `╭─────────────🔥 BIENVENUE 🔥─────────────⭓\n│ ${getLang("welcomeBot", prefix)}\n╰──────────────────────────────⭓`;
			return message.send(msg);
		}

		// Quand un ou plusieurs membres rejoignent le groupe
		if (event.logMessageType === "log:subscribe") {
			const { threadID } = event;
			const threadData = await threadsData.get(threadID);
			if (!threadData.settings.sendWelcomeMessage) return;

			const added = event.logMessageData.addedParticipants.filter(u => u.userFbId !== api.getCurrentUserID());
			if (!added.length) return;

			const hours = getTime("HH");
			const multiple = added.length > 1;
			const userNames = added.map(u => u.fullName);
			const mentions = added.map(u => ({ tag: u.fullName, id: u.userFbId }));

			let welcomeMessage = getLang("defaultWelcome")
				.replace(/\{userName\}/g, userNames.join(", "))
				.replace(/\{threadName\}/g, threadData.threadName)
				.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
				.replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

			const msg = {
				body: `╭─────────────🔥 BIENVENUE 🔥─────────────⭓\n│ ${welcomeMessage.replace(/\n/g, "\n│ ")}\n╰──────────────────────────────⭓`,
				mentions
			};
			return message.send(msg);
		}
	}
};
