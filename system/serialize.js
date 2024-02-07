const { prefixList, owners, botNumber } = require("../config/config");

async function serializeMsg(conn, m) {
  if (!m) return;
  if (m.key) {
    m.chat_id = m.key.remoteJid.split("@")[0];
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.from = conn.decodeJid(m.chat);
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.isBot = m.id.startsWith("3EB0") || m.id.startsWith("BAE5") || false;
    m.participant = !m.isGroup ? false : m.key.participant;
    m.sender = conn.decodeJid(
      (m.fromMe && conn.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup) {
      m.participant = conn.decodeJid(m.key.participant) || "";
      m.isAdmin = await (async () => {
        let { participants: participant } = await conn.groupMetadata(m.from);
        let check = participant.some(
          (participant) =>
            participant.id === m.sender && participant.admin !== null
        );
        return check;
      })();

      m.isBotAdmin = await (async () => {
        let { participants: participant } = await conn.groupMetadata(m.from);
        let check = participant.some(
          (participant) =>
            participant.id === botNumber + "@s.whatsapp.net" &&
            participant.admin !== null
        );
        return check;
      })();
    }
    m.isOwner = owners.includes(m.sender.replace("@s.whatsapp.net", ""));
  }
  m.date = m.messageTimestamp;
  m.pushname = m.pushName;
  if (m.message) {
    m.namebot = "Seedev Bot";
    m.type = Object.keys(m.message)[0];
    m.body =
      m.message.conversation ||
      m.message[m.type].caption ||
      m.message[m.type].text ||
      (m.type == "listResponseMessage" &&
        m.message[m.type].singleSelectReply.selectedRowId) ||
      (m.type == "buttonsResponseMessage" &&
        m.message[m.type].selectedButtonId) ||
      m.type;
    m.msg = m.message[m.type];
    let quoted = (m.quoted = m.msg.contextInfo
      ? m.msg.contextInfo.quotedMessage
      : null);
    const regexPrefix = new RegExp("^[" + prefixList + "]", "i");
    const matchPrefix = regexPrefix.test(m.body)
      ? m.body.match(regexPrefix)[0]
      : "";

    m.prefix = matchPrefix;
    m.query = m.body.split(" ").slice(m.prefix.length).join(" ");
  }

  if (m.quoted) {
    m.qtype = Object.keys(m.quoted)[0];
    m.mtype = m.quoted[m.qtype].mimetype;
    m.title = m.quoted[m.qtype].title;
    m.filename = m.quoted[m.qtype].fileName;
  }

  m.qmsg = m.quoted || m.message;

  m.sendMsg = (chatId, text, options) =>
    conn.sendMessage(chatId, { text: text }, { ...options });

  m.reply = (text, options) =>
    conn.sendMessage(m.chat, { text: text }, { quoted: m, ...options });

  m.react = (reaction, options) =>
    conn.sendMessage(
      m.chat,
      {
        react: {
          text: reaction, // use an empty string to remove the reaction
          key: m.key,
        },
      },
      { ...options }
    );
  if (!m.quoted) delete m.quoted;
  if (!m.title) delete m.title;
  if (!m.filename) delete m.filename;
  return m;
}

module.exports = serializeMsg;
