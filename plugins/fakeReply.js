module.exports = {
  name: "fake reply",
  desc: "fake reply chat",
  cmd: "fk",
  async execute(ctx, m, exe) {
    if (!exe) return m.reply("Penggunaan: /fk teksmu|teksreply|target");
    try {
      let split = exe.split("|");
      return ctx.sendMessage(
        m.chat,
        { text: split[0] },
        {
          quoted: {
            key: {
              fromMe: false,
              participant: `${split[2].replace("@", "") + "@s.whatsapp.net"}`,
              ...(m.chat ? { remoteJid: m.chat } : {}),
            },
            message: {
              extendedTextMessage: {
                text: split[1],
              },
            },
          },
        }
      );
    } catch (error) {
      return m.reply("error cuy");
    }
  },
};
