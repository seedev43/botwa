const { exec } = require("child_process");

module.exports = {
  name: "cmd",
  desc: "cmd menu",
  cmd: "c",
  async execute(ctx, m, exe) {
    if (!exe) return;
    if (!m.isOwner) return m.reply("om jangan om");
    try {
      exec(exe, async (error, stdout) => {
        if (error) return m.reply(error);
        if (stdout) return m.reply(stdout);
      });
    } catch (e) {
      m.reply(JSON.stringify(e, null, 2));
    }
  },
};
