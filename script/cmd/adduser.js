const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "adduser",
		version: "2.0",
		author: "Octavio Wina",
		countDown: 5,
		role: 1,
		description: {
			fr: "Ajoute un ou plusieurs membres dans votre salon de discussion",
			en: "Add user(s) to your group chat"
		},
		category: "gestion de groupe",
		guide: {
			fr: "   {pn} [lien du profil | uid]",
			en: "   {pn} [profile link | uid]"
		}
	},

	langs: {
		fr: {
			alreadyInGroup: "⚠️ Ce membre est déjà présent dans le groupe.",
			successAdd:
`╔═══════🔥✦🔥═══════╗
║ ✅ 𝗔𝗝𝗢𝗨𝗧 𝗥𝗘́𝗨𝗦𝗦𝗜 ✅
╠═════════════════════╣
║ ➤ %1 membre(s) ont été ajouté(s)
║ avec succès dans le groupe 👑
╚═══════🔥✦🔥═══════╝`,

			failedAdd:
`╔═══════💀✦💀═══════╗
║ ❌ 𝗘́𝗖𝗛𝗘𝗖 𝗗’𝗔𝗝𝗢𝗨𝗧 ❌
╠═════════════════════╣
║ ➤ %1 membre(s) n’ont pas pu être ajoutés.
╚═══════💀✦💀═══════╝`,

			approve:
`╔═══════👑✦👑═══════╗
║ 🕐 𝗔𝗣𝗣𝗥𝗢𝗕𝗔𝗧𝗜𝗢𝗡 𝗘𝗡 𝗔𝗧𝗧𝗘𝗡𝗧𝗘 🕐
╠═════════════════════╣
║ ➤ %1 membre(s) ont été ajoutés
║ à la liste d’approbation 🔒
╚═══════👑✦👑═══════╝`,

			invalidLink: "⚠️ Lien Facebook invalide. Vérifie ton URL.",
			cannotGetUid: "❌ Impossible d’obtenir l’UID de cet utilisateur.",
			linkNotExist: "🚫 Ce profil Facebook n’existe pas ou est introuvable.",
			cannotAddUser: "❌ Le bot ne peut pas ajouter cet utilisateur (blocage ou restrictions)."
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, getLang }) {
		const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();

		const success = [
			{ type: "success", uids: [] },
			{ type: "waitApproval", uids: [] }
		];
		const failed = [];

		function checkErrorAndPush(messageError, item) {
			item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
			const findType = failed.find(error => error.type == messageError);
			if (findType)
				findType.uids.push(item);
			else
				failed.push({
					type: messageError,
					uids: [item]
				});
		}

		const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

		for (const item of args) {
			let uid;
			let continueLoop = false;

			// 🔍 Vérifie si l’argument est un lien ou un UID
			if (isNaN(item) && regExMatchFB.test(item)) {
				for (let i = 0; i < 10; i++) {
					try {
						uid = await findUid(item);
						break;
					} catch (err) {
						if (err.name == "SlowDown" || err.name == "CannotGetData") {
							await sleep(1000);
							continue;
						} else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
							checkErrorAndPush(
								err.name == "InvalidLink" ? getLang('invalidLink') :
								err.name == "CannotGetData" ? getLang('cannotGetUid') :
								err.name == "LinkNotExist" ? getLang('linkNotExist') :
								err.message,
								item
							);
							continueLoop = true;
							break;
						}
					}
				}
			} else if (!isNaN(item)) {
				uid = item;
			} else continue;

			if (continueLoop == true) continue;

			if (members.some(m => m.userID == uid && m.inGroup)) {
				checkErrorAndPush(getLang("alreadyInGroup"), item);
			} else {
				try {
					await api.addUserToGroup(uid, event.threadID);
					if (approvalMode === true && !adminIDs.includes(botID))
						success[1].uids.push(uid);
					else
						success[0].uids.push(uid);
				} catch (err) {
					checkErrorAndPush(getLang("cannotAddUser"), item);
				}
			}
		}

		const lengthUserSuccess = success[0].uids.length;
		const lengthUserWaitApproval = success[1].uids.length;
		const totalFailed = failed.reduce((a, b) => a + b.uids.length, 0);

		let msg = "";

		if (lengthUserSuccess)
			msg += `${getLang("successAdd", lengthUserSuccess)}\n\n`;
		if (lengthUserWaitApproval)
			msg += `${getLang("approve", lengthUserWaitApproval)}\n\n`;
		if (totalFailed) {
			msg += `${getLang("failedAdd", totalFailed)}\n`;
			for (const f of failed) {
				msg += `\n➤ ${f.type} :\n   ${f.uids.join("\n   ")}\n`;
			}
		}

		await message.reply(msg.trim());
	}
};
