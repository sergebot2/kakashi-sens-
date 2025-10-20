  config: {
    name: "all",
    version: "1.2",
    author: "Octavio Wina",
    countDown: 5,
    role: 1,
    description: {
      fr: "Tag tous les membres de ton groupe de chat avec style"
    },
    category: "box chat",
    guide: {
      fr: "╔══ 🔱 UTILISATION 🔱 ══╗\n" +
          "• {pn} [message] → Tag tous les membres avec le message fourni 💀\n" +
          "• {pn} → Si vide, tag tous les membres avec @all 🔥\n" +
          "╚═══════════════════════╝"
    }
  },

  onStart: async function ({ message, event, args }) {
    const { participantIDs, threadID } = event;
    const lengthAllUser = participantIDs.length;

    const mentions = [];
    let body = args.join(" ") || "@all";
    let bodyLength = body.length;
    let i = 0;

    for (const uid of participantIDs) {
      let fromIndex = 0;
      if (bodyLength < lengthAllUser) {
        body += body[bodyLength - 1];
        bodyLength++;
      }
      if (body.slice(0, i).lastIndexOf(body[i]) != -1)
        fromIndex = i;

      mentions.push({
        tag: body[i],
        id: uid,
        fromIndex
      });
      i++;
    }

    // Message final avec style Dark Royal
    const finalMsg = `🔥👑 Tous les membres ont été tagués ! 👑🔥\n` +
                     `➤ Nombre de membres : ${lengthAllUser}\n` +
                     `➤ TID du groupe : ${threadID}\n` +
                     `────────────────────────\n` +
                     `${body}`;

    message.reply({ body: finalMsg, mentions });
  }
};
