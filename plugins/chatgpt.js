const fetch = require("node-fetch");
const axios = require("axios");
module.exports = {
  name: "chatgpt",
  desc: "bot chatgpt",
  cmd: "ai",
  async execute(ctx, m, exe) {
    if (!exe) return m.reply("Masukkan pertanyaanmu");
    try {
      await m.reply("Tunggu...");
      let body = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: exe,
          },
        ],
      };
      let headers = {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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",
      };
      let data = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(body),
        headers: headers,
      });
      let res = await data.json();
      console.log(res);
      await m.reply(res.choices[0].message.content);
    } catch (error) {
      console.error(error);
      await m.reply("Terjadi error.");
    }
  },
};
