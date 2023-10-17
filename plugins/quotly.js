const axios = require("axios");
const fs = require("fs");

module.exports = {
  name: "quotly maker",
  desc: "bot quotly",
  cmd: "qt",
  async execute(ctx, m, exe) {
    try {
      if (m.isGroup) {
        if (m.type == "extendedTextMessage") {
          console.log(m);
          let getProfile = await ctx.profilePictureUrl(
            m.msg?.contextInfo?.participant,
            "image"
          );
          const text = m.quoted?.conversation;
          const username = ctx.getName(
            ctx.decodeJid(m.msg?.contextInfo?.participant)
          );
          const avatar = getProfile;

          const json = {
            type: "quote",
            format: "png",
            backgroundColor: "#FFFFFF",
            width: 512,
            height: 768,
            scale: 2,
            messages: [
              {
                entities: [],
                avatar: true,
                from: {
                  id: 1,
                  name: username,
                  photo: {
                    url: avatar,
                  },
                },
                text: text,
                replyMessage: {},
              },
            ],
          };
          const { data } = await axios.post(
            "https://bot.lyo.su/quote/generate",
            json,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          const buffer = Buffer.from(data.result.image, "base64");

          await fs.writeFileSync("./tmp/oke.png", buffer);
          await ctx.sendMessage(m.chat, { image: { url: "./tmp/oke.png" } });

          require("fs").unlinkSync("./tmp/oke.png");
        }
      }
    } catch (error) {
      console.error(error);
      await m.reply("Terjadi error..");
    }
  },
};
