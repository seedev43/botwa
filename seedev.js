exports.exc = (ctx, m) => {
  if (!m) return;
  if (m.key) {
    m.chat_id = m.key.remoteJid.split("@")[0];
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.from = ctx.decodeJid(m.key.remoteJid);
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.participant = !m.isGroup ? false : m.key.participant;
    m.sender = ctx.decodeJid(
      (m.fromMe && ctx.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup) m.participant = ctx.decodeJid(m.key.participant) || "";
    m.isOwner = [...global.opt.owners].includes(
      m.sender.replace("@s.whatsapp.net", "")
    );
  }
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
  }

  if (m.quoted) {
    m.qtype = Object.keys(m.quoted)[0];
    m.mtype = m.quoted[m.qtype].mimetype;
    m.title = m.quoted[m.qtype].title;
    m.filename = m.quoted[m.qtype].fileName;
  }

  m.qmsg = m.quoted || m.message;

  m.sendMsg = (chatId, text, options) =>
    ctx.sendMessage(chatId, { text: text }, { ...options });

  m.reply = (text, options) =>
    ctx.sendMessage(m.chat, { text: text }, { quoted: m, ...options });

  if (!m.quoted) delete m.quoted;
  if (!m.title) delete m.title;
  if (!m.filename) delete m.filename;

  return m;
};
