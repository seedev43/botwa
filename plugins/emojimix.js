const { emojiMix, fetchWeb } = require("../functions");
const fs = require("fs");

module.exports = {
  name: "emojimix",
  desc: "mix emoji",
  cmd: "emojimix",
  async execute(ctx, m, exe) {
    try {
      if (!exe) return m.reply("Ex: /emojimix 🥳+😎");
      let [e1, e2] = exe.split("+");
      if (!e1) return m.reply("Isi emoji pertama");
      if (!e2) return m.reply("Isi emoji kedua");

      // m.reply("Tunggu bang")

      let fetchResponse;
      let temp;
      temp = emojiMix(e1, e2);
      fetchResponse = await fetchWeb(emojiMix(e1, e2), false);
      if (fetchResponse.status != 200) temp = emojiMix(e2, e1);

      let gas = await ctx.sendImageAsSticker(m.chat, temp, m, {
        contextInfo: {
          externalAdReply: {
            thumbnailUrl:
              "https://cdns.klimg.com/merdeka.com/i/w/news/2022/09/25/1475625/670x335/jenis-kucing-lucu-dan-imut-kenali-karakteristiknya.jpg",
            title: "SeeDev Bot",
            body: "Nih bang emoji nya",
            sourceUrl: "https://github.com/seedev43",
          },
        },
      });

      fs.unlinkSync(gas);
    } catch (e) {
      console.log(e);
      m.reply("error");
    }
  },
};
