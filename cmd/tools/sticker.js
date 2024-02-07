const helpers = require("../../helpers/helpers");

module.exports = {
  name: "st",
  description: "convert image to sticker",
  tags: "tools",
  isWait: true,
  run: async ({ conn, m }) => {
    if (/image/.test(m.mtype) || m.type == "imageMessage") {
      let media = await conn.downloadMediaMessage(m.qmsg || m.msg);
      // console.log(media);
      let split;
      if (m.query) {
        split = m.query.split("|");
      }
      let gas = await conn.sendImageAsSticker(m.chat, media, m, {
        packname: split?.[0],
        publisher: split?.[1],
        contextInfo: {
          externalAdReply: {
            thumbnailUrl:
              "https://cdns.klimg.com/merdeka.com/i/w/news/2022/09/25/1475625/670x335/jenis-kucing-lucu-dan-imut-kenali-karakteristiknya.jpg",
            title: "SeeDev Bot",
            body: "Nih bang stiker nya",
            sourceUrl: "https://github.com/seedev43",
          },
        },
      });
      m.react(helpers.Success);
      require("fs").unlinkSync(gas);
    } else if (/video/.test(m.mtype) || m.type == "videoMessage") {
      if (m.qmsg.videoMessage.seconds > 11) return m.reply("Maksimal 10 detik");
      let media = await conn.downloadMediaMessage(m.qmsg || m.msg);
      console.log(media);
      let gas = await conn.sendVideoAsSticker(m.chat, media, m);
      m.react(helpers.Success);

      require("fs").unlinkSync(gas);
    }
  },
};
