module.exports = {
  name: "image to sticker",
  desc: "convert image to sticker",
  cmd: "st",
  async execute(ctx, m, exe) {
    if (/image/.test(m.mtype) || m.type == "imageMessage") {
      let media = await ctx.downloadMediaMessage(m.qmsg || m.msg);
      // console.log(media);
      let split;
      if (exe) {
        split = exe.split("|");
      }
      let gas = await ctx.sendImageAsSticker(m.chat, media, m, {
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
      require("fs").unlinkSync(gas);
    }
  },
};
