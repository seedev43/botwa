module.exports = {
  name: "video to sticker",
  desc: "convert video to sticker gif",
  cmd: "vst",
  async execute(ctx, m, exe) {
    if (/video/.test(m.mtype)) {
      if (m.qmsg.videoMessage.seconds > 11) return m.reply("Maksimal 10 detik");
      let media = await ctx.downloadMediaMessage(m.qmsg || m.msg);
      console.log(media);
      let gas = await ctx.sendVideoAsSticker(m.chat, media, m);
      require("fs").unlinkSync(gas);
    }
  },
};
