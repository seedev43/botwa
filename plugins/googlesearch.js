const google = require("googlethis");
module.exports = {
  name: "googlesearch",
  desc: "bot google search",
  cmd: "google",
  async execute(ctx, m, exe) {
    if (!exe) return m.reply("Masukkan query");
    try {
      await m.reply("Tunggu...");
      const options = {
        page: 0,
        safe: true, // Safe Search
        parse_ads: false, // If set to true sponsored results will be parsed
        additional_params: {
          // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
          hl: "id",
        },
      };

      let teks = "";
      const response = await google.search(exe, options);
      //   console.log(response);
      for (let index = 0; index < response.results.length; index++) {
        const element = response.results[index];
        teks +=
          "Judul: " +
          element.title +
          "\nDeskripsi: " +
          element.description +
          "\nLink: " +
          element.url +
          "\n\n";
      }
      await m.reply(teks);
    } catch (error) {
      console.error(error);
      await m.reply("Terjadi error.");
    }
  },
};
