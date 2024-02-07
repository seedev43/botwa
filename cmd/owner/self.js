const path = require("path");
const fs = require("fs").promises;

module.exports = {
  name: "self",
  tags: "owner",
  isOwner: true,
  run: async ({ conn, m }) => {
    const filePath = path.join(__dirname, "../../config", "config.js"); // Ganti dengan path sesuai struktur proyek Anda

    try {
      // Baca isi file
      const data = await fs.readFile(filePath, "utf8");

      // Gunakan regex untuk mencari dan mengganti nilai self
      const updatedData = data.replace(
        /const self = .*;/,
        "const self = true;"
      ); // Ganti dengan nilai baru yang diinginkan

      // Tulis kembali ke file
      await fs.writeFile(filePath, updatedData, "utf8");

      console.log("Update self mode!");
      return m.reply("Update self mode!");
    } catch (err) {
      console.error("Error:", err);
      return m.reply(err.message);
    }
  },
};
