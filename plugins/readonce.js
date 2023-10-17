const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
module.exports = {
  name: "readonce",
  desc: "read image or video sent viewonce",
  cmd: "vo",
  async execute(ctx, m, exe) {
    try {
      if (m.quoted) {
        let a = Object.keys(m.qmsg)[0];
        let b = m.qmsg[a].message;
        let c = b[Object.keys(b)[0]];
        console.log(c);
        let media = await downloadContentFromMessage(
          c,
          Object.keys(b)[0] == "imageMessage" ? "image" : "video"
        );
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        // console.log(media);
        ctx.sendMessage(m.chat, { image: buffer });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
