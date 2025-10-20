const axios = require('axios');

const apiKey = "";
const maxTokens = 500;
const numberGenerateImage = 4;
const maxStorageMessage = 4;

if (!global.temp.openAIUsing) global.temp.openAIUsing = {};
if (!global.temp.openAIHistory) global.temp.openAIHistory = {};

const { openAIUsing, openAIHistory } = global.temp;

module.exports = {
    config: {
        name: "gpt",
        version: "1.5 🔥",
        author: "Octavio Wina 💀👑",
        countDown: 5,
        role: 0,
        description: {
            vi: "GPT chat Dark/Infernal Edition",
            en: "GPT chat Dark/Infernal Edition"
        },
        category: "box chat",
        guide: {
            vi: "   {pn} <draw> <nội dung> - tạo hình ảnh từ nội dung"
                + "\n   {pn} <clear> - xóa lịch sử chat với gpt"
                + "\n   {pn} <nội dung> - chat với gpt",
            en: "   {pn} <draw> <content> - create image from content"
                + "\n   {pn} <clear> - clear chat history with gpt"
                + "\n   {pn} <content> - chat with gpt"
        }
    },

    langs: {
        vi: {
            apiKeyEmpty: "💀 | Vui lòng cung cấp api key OpenAI tại file scripts/cmds/gpt.js",
            invalidContentDraw: "⚠️ | Nhập nội dung bạn muốn vẽ",
            yourAreUsing: "⏳ | GPT đang xử lý yêu cầu trước, vui lòng chờ",
            processingRequest: "🔥 | Đang xử lý yêu cầu... Hãy kiên nhẫn",
            invalidContent: "⚠️ | Nhập nội dung bạn muốn chat",
            error: "💀 | Lỗi xảy ra:\n%1",
            clearHistory: "✅ | Lịch sử chat GPT đã được xóa",
        },
        en: {
            apiKeyEmpty: "💀 | Please provide OpenAI API key at scripts/cmds/gpt.js",
            invalidContentDraw: "⚠️ | Enter content you want to draw",
            yourAreUsing: "⏳ | GPT is processing previous request, please wait",
            processingRequest: "🔥 | Processing request... please wait",
            invalidContent: "⚠️ | Enter content to chat",
            error: "💀 | An error occurred:\n%1",
            clearHistory: "✅ | GPT chat history cleared",
        }
    },

    onStart: async function ({ message, event, args, getLang, prefix, commandName }) {
        if (!apiKey) return message.reply(getLang('apiKeyEmpty'));

        const uid = event.senderID;
        const tid = event.threadID;

        switch (args[0]) {
            case 'img':
            case 'image':
            case 'draw': {
                if (!args[1]) return message.reply(getLang('invalidContentDraw'));
                if (openAIUsing[uid]) return message.reply(getLang("yourAreUsing"));

                openAIUsing[uid] = true;
                let sending;
                try {
                    sending = await message.reply(getLang('processingRequest'));
                    const responseImage = await axios({
                        url: "https://api.openai.com/v1/images/generations",
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        },
                        data: {
                            prompt: args.slice(1).join(' '),
                            n: numberGenerateImage,
                            size: '1024x1024'
                        }
                    });

                    const images = await Promise.all(responseImage.data.data.map(async (item) => {
                        const img = await axios.get(item.url, { responseType: 'stream' });
                        img.data.path = `${Date.now()}.png`;
                        return img.data;
                    }));

                    return message.reply({
                        body: `🔥💀👑 [GPT Dark/Infernal] 👑💀🔥\nUID: ${uid}\nTID: ${tid}\n\nHình ảnh được tạo từ nội dung: ${args.slice(1).join(' ')}`,
                        attachment: images
                    });
                } catch (err) {
                    const errorMsg = err.response?.data.error.message || err.message;
                    return message.reply(getLang('error', errorMsg || ''));
                } finally {
                    delete openAIUsing[uid];
                    if (sending?.messageID) message.unsend(sending.messageID);
                }
            }

            case 'clear': {
                openAIHistory[uid] = [];
                return message.reply(getLang('clearHistory'));
            }

            default: {
                if (!args[0]) return message.reply(getLang('invalidContent'));
                await handleGpt(uid, tid, args, message, getLang, commandName);
            }
        }
    },

    onReply: async function ({ Reply, message, event, args, getLang, commandName }) {
        if (Reply.author !== event.senderID) return;
        await handleGpt(event.senderID, event.threadID, args, message, getLang, commandName);
    }
};

async function askGpt(uid) {
    const response = await axios({
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        data: {
            model: "gpt-3.5-turbo",
            messages: openAIHistory[uid],
            max_tokens: maxTokens,
            temperature: 0.7
        }
    });
    return response;
}

async function handleGpt(uid, tid, args, message, getLang, commandName) {
    try {
        openAIUsing[uid] = true;

        if (!Array.isArray(openAIHistory[uid])) openAIHistory[uid] = [];

        if (openAIHistory[uid].length >= maxStorageMessage) openAIHistory[uid].shift();

        openAIHistory[uid].push({
            role: 'user',
            content: args.join(' ')
        });

        const response = await askGpt(uid);
        const text = response.data.choices[0].message.content;

        openAIHistory[uid].push({
            role: 'assistant',
            content: text
        });

        return message.reply(`🔥💀👑 [GPT Dark/Infernal] 👑💀🔥\nUID: ${uid}\nTID: ${tid}\n\n💬 ${text}`, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                author: uid,
                messageID: info.messageID
            });
        });
    } catch (err) {
        const errorMsg = err.response?.data.error.message || err.message || '';
        return message.reply(getLang('error', errorMsg));
    } finally {
        delete openAIUsing[uid];
    }
			}
