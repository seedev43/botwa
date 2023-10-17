const axios = require("axios");
const fs = require("fs");

module.exports = {
  name: "translate",
  desc: "translate kata",
  cmd: "tr",
  async execute(ctx, m, exe) {
    try {
      if (!exe)
        return await m.reply(
          "reply pesan lalu ketik contoh: /tr en\nList bahasa: https://telegra.ph/List-Bahasa-Translate-06-26"
        );
      if (m.type == "extendedTextMessage") {
        let datas = {
          text: m.quoted?.conversation,
          from: "auto",
          to: exe,
        };
        let { data } = await axios.post(global.api + "/translate2", datas);
        if (data.success) {
          let { translate_text } = data.data;
          await m.reply(translate_text);
        }
      }
    } catch (error) {
      console.error(error);
      await m.reply("Terjadi error atau mungkin bahasa yang anda masukkan tidak ada dalam list\nList bahasa: https://telegra.ph/List-Bahasa-Translate-06-26");
    }
  },
};
