const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "1.9",
		author: "Octavio Wina",
		countDown: 5,
		role: 2,
		description: {
			fr: "📣 Envoyer une notification de l'admin à tous les groupes"
		},
		category: "owner",
		guide: {
			fr: "{pn} <message> : envoie un message à tous les groupes"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		fr: {
			missingMessage: "❌ Veuillez saisir le message à envoyer à tous les groupes",
			notificationTitle: "💀📢 **NOTIFICATION ADMIN BOT** 📢💀",
			sendingNotification: "⏳ Début de l'envoi de la notification à %1 groupes...",
			sentNotification: "✅ Notification envoyée avec succès à %1 groupes",
			errorSendingNotification: "⚠️ Erreur lors de l'envoi à %1 groupes :\n%2"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		const { delayPerGroup } = envCommands[commandName];
		if (!args[0]) return message.reply(getLang("missingMessage"));

		const formSend = {
			body: `╭─────────────💀 NOTIFICATION 💀─────────────⭓\n│ ${args.join(" ")}\n╰──────────────────────────────────────────⭓`,
			attachment: await getStreamsFromAttachment([
				...event.attachments,
				...(event.messageReply?.attachments || [])
			].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type)))
		};

		const allThreadID = (await threadsData.getAll())
			.filter(t => t.isGroup && t.members.some(m => m.userID == api.getCurrentUserID() && m.inGroup));
		
		message.reply(getLang("sendingNotification", allThreadID.length));

		let sendSucces = 0;
		const sendError = [];
		const waitingSend = [];

		for (const thread of allThreadID) {
			const tid = thread.threadID;
			try {
				waitingSend.push({
					threadID: tid,
					pending: api.sendMessage(formSend, tid)
				});
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			} catch (e) {
				sendError.push(tid);
			}
		}

		for (const sended of waitingSend) {
			try {
				await sended.pending;
				sendSucces++;
			} catch (e) {
				const { errorDescription } = e;
				const existError = sendError.find(item => item.errorDescription == errorDescription);
				if (existError)
					existError.threadIDs.push(sended.threadID);
				else
					sendError.push({ threadIDs: [sended.threadID], errorDescription });
			}
		}

		let msg = "╭─────────────💀 RÉSUMÉ 💀─────────────⭓\n";
		if (sendSucces > 0) msg += `│ ✅ ${getLang("sentNotification", sendSucces)}\n`;
		if (sendError.length > 0) {
			msg += `│ ⚠️ ${getLang("errorSendingNotification", sendError.reduce((a, b) => a + b.threadIDs.length, 0), sendError.reduce((a, b) => a + `\n│  - ${b.errorDescription}\n│    + ${b.threadIDs.join("\n│    + ")}`, ""))}\n`;
		}
		msg += "╰──────────────────────────────────────────⭓";

		message.reply(msg);
	}
};
