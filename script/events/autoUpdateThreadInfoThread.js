module.exports = {
	config: {
		name: "autoUpdateThreadInfo",
		version: "1.6",
		author: "Octavio Wina",
		category: "events"
	},

	onStart: async ({ threadsData, event, api }) => {
		const types = [
			"log:subscribe",
			"log:unsubscribe",
			"log:thread-admins",
			"log:thread-name",
			"log:thread-image",
			"log:thread-icon",
			"log:thread-color",
			"log:user-nickname"
		];

		if (!types.includes(event.logMessageType)) return;

		const { threadID, logMessageData, logMessageType } = event;
		const threadInfo = await threadsData.get(threadID);
		let { members, adminIDs, threadName } = threadInfo;

		const sendDarkMessage = async (msg) => {
			const framedMsg = `╭─────────────🔥 OCTAVIO WINA 🔥─────────────⭓\n│ ${msg.replace(/\n/g, "\n│ ")}\n╰──────────────────────────────⭓`;
			await api.sendMessage(framedMsg, threadID);
		};

		switch (logMessageType) {
			case "log:subscribe":
				return async () => {
					const { addedParticipants } = logMessageData;
					const threadInfo_Fca = await api.getThreadInfo(threadID);
					threadsData.refreshInfo(threadID, threadInfo_Fca);

					for (const user of addedParticipants) {
						let oldData = members.find(m => m.userID === user.userFbId) || {};
						const isOldMember = !!oldData.userID;

						const { userInfo, nicknames } = threadInfo_Fca;

						const newData = {
							userID: user.userFbId,
							name: user.fullName,
							gender: userInfo.find(u => u.id == user.userFbId)?.gender || null,
							nickname: nicknames[user.userFbId] || null,
							inGroup: true,
							count: oldData.count || 0
						};

						if (!isOldMember) members.push(newData);
						else members[members.findIndex(m => m.userID === user.userFbId)] = newData;

						await sendDarkMessage(`👑 ${user.fullName} a rejoint le groupe !`);
					}

					await threadsData.set(threadID, members, "members");
				};

			case "log:unsubscribe":
				return async () => {
					const oldData = members.find(m => m.userID === logMessageData.leftParticipantFbId);
					if (oldData) {
						oldData.inGroup = false;
						await threadsData.set(threadID, members, "members");
						await sendDarkMessage(`💀 ${oldData.name} a quitté le groupe !`);
					}
				};

			case "log:thread-admins":
				return async () => {
					if (logMessageData.ADMIN_EVENT === "add_admin") {
						adminIDs.push(logMessageData.TARGET_ID);
						await sendDarkMessage(`🔥 ${logMessageData.TARGET_ID} est maintenant admin !`);
					} else {
						adminIDs = adminIDs.filter(uid => uid != logMessageData.TARGET_ID);
						await sendDarkMessage(`⚔️ ${logMessageData.TARGET_ID} n'est plus admin !`);
					}
					adminIDs = [...new Set(adminIDs)];
					await threadsData.set(threadID, adminIDs, "adminIDs");
				};

			case "log:thread-name":
				return async () => {
					await threadsData.set(threadID, logMessageData.name, "threadName");
					await sendDarkMessage(`📝 Le nom du groupe a été changé en : ${logMessageData.name}`);
				};

			case "log:thread-image":
				return async () => {
					await threadsData.set(threadID, logMessageData.url, "imageSrc");
					await sendDarkMessage(`🖼️ L'image du groupe a été mise à jour !`);
				};

			case "log:thread-icon":
				return async () => {
					await threadsData.set(threadID, logMessageData.thread_icon, "emoji");
					await sendDarkMessage(`✨ L'icône du groupe a été changée en : ${logMessageData.thread_icon}`);
				};

			case "log:thread-color":
				return async () => {
					await threadsData.set(threadID, logMessageData.theme_id, "threadThemeID");
					await sendDarkMessage(`🎨 Le thème du groupe a été modifié !`);
				};

			case "log:user-nickname":
				return async () => {
					const { participant_id, nickname } = logMessageData;
					const oldData = members.find(m => m.userID === participant_id);
					if (oldData) {
						oldData.nickname = nickname;
						await threadsData.set(threadID, members, "members");
						await sendDarkMessage(`🏷️ ${oldData.name} a changé son pseudo en : ${nickname}`);
					}
				};

			default:
				return null;
		}
	}
};
