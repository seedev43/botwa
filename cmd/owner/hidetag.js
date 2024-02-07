module.exports = {
  name: "ht",
  tags: "owner",
  isOwner: true,
  run: async ({ conn, m }) => {
    try {
      const groupMetadata = m.isGroup
        ? await conn.groupMetadata(m.chat).catch((e) => {})
        : "";
      const participants = m.isGroup ? await groupMetadata.participants : "";
      if (!m.isGroup) return m.reply("Bukan grup");
      if (!m.isOwner) return m.reply("gmw");
      conn.sendMessage(m.chat, {
        text: m.query ? m.query : "",
        mentions: participants.map((a) => a.id),
      });
    } catch (e) {
      conn.sendMessage(m.chat, { text: String(e) });
    }
  },
};
