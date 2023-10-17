const google = require("googlethis");
module.exports = {
  name: "googlesearchimage",
  desc: "google search image menu",
  cmd: "googleimg",
  async execute(ctx, m, exe) {
    if (!exe) return m.reply("Masukkan query");
    try {
      await m.reply("Tunggu...");
      const options = {
        safe: true, // Safe Search
      };

      let teks = "";
      const response = await google.image(exe, options);
      //   console.log(response);
      for (let index = 0; index < response.length; index++) {
        const element = response[index];
        teks +=
          "Judul: " + element.origin.title + "\nLink: " + element.url + "\n\n";
      }
      await m.reply(teks);
    } catch (error) {
      console.error(error);
      await m.reply("Terjadi error.");
    }
  },
};
