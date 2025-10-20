module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["adminbox", "adbox", "onlyadbox"],
		version: "1.4",
		author: "Octavio wina",
		countDown: 5,
		role: 1,
		description: {
			fr: "Active ou désactive le mode où seuls les administrateurs du groupe peuvent utiliser le bot",
			en: "Turn on/off admin-only mode for group"
		},
		category: "gestion de groupe",
		guide: {
			fr: "   {pn} [on | off] : Active ou désactive le mode administrateur uniquement.\n"
				+ "   {pn} noti [on | off] : Active ou désactive les notifications pour les non-admins.",
			en: "   {pn} [on | off]: Enable/disable admin-only mode.\n"
				+ "   {pn} noti [on | off]: Enable/disable notification when non-admin uses the bot."
		}
	},

	langs: {
		fr: {
			turnedOn:
`╔═══════════════════✦⚜️✦═══════════════════╗
║ 🔥 𝗠𝗢𝗗𝗘 𝗔𝗗𝗠𝗜𝗡 𝗔𝗖𝗧𝗜𝗩𝗘́ 🔥
╠═════════════════════════════════════╣
║ ✅ Seuls les administrateurs du groupe peuvent
║ désormais utiliser le bot.
╚═══════════════════✦⚜️✦═══════════════════╝`,

			turnedOff:
`╔═══════════════════✦❄️✦═══════════════════╗
║ 👥 𝗠𝗢𝗗𝗘 𝗔𝗗𝗠𝗜𝗡 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́ 👥
╠═════════════════════════════════════╣
║ 🌍 Tous les membres du groupe peuvent à présent
║ utiliser le bot librement.
╚═══════════════════✦❄️✦═══════════════════╝`,

			turnedOnNoti:
`╔═══════════════════✦🔔✦═══════════════════╗
║ 📢 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡𝗦 𝗔𝗖𝗧𝗜𝗩𝗘́𝗘𝗦 📢
╠═════════════════════════════════════╣
║ 🔔 Les membres non-admin recevront une alerte
║ lorsqu’ils tenteront d’utiliser le bot.
╚═══════════════════✦🔔✦═══════════════════╝`,

			turnedOffNoti:
`╔═══════════════════✦🔕✦═══════════════════╗
║ 🤫 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡𝗦 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́𝗘𝗦 🤫
╠═════════════════════════════════════╣
║ 🔇 Aucun message ne sera envoyé aux non-admins.
╚═══════════════════✦🔕✦═══════════════════╝`,

			syntaxError:
`╔═══════════════════✦⚠️✦═══════════════════╗
║ ⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗗𝗘 𝗦𝗬𝗡𝗧𝗔𝗫𝗘 ⚠️
╠═════════════════════════════════════╣
║ Utilisation correcte :
║ ➤ {pn} on / off
║ ➤ {pn} noti on / off
╚═══════════════════✦⚠️✦═══════════════════╝`
		},
		en: {
			turnedOn: "Admin mode activated. Only admins can use the bot.",
			turnedOff: "Admin mode disabled. Everyone can use the bot now.",
			turnedOnNoti: "Notification for non-admins turned on.",
			turnedOffNoti: "Notification for non-admins turned off.",
			syntaxError: "Syntax error, use {pn} on/off or {pn} noti on/off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		else
			return message.reply(getLang(value ? "turnedOn" : "turnedOff"));
	}
};
