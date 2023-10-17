const util = require("util");

module.exports = {
  name: "eval",
  desc: "eval menu",
  cmd: "exc",
  async execute(ctx, m, exe, store) {
    if (!exe) return;
    if (!m.isOwner) return m.reply("om jangan om");

    let evalCmd;
    try {
      evalCmd = /await/i.test(exe)
        ? eval("(async() => { " + exe + " })()")
        : eval(exe);
    } catch (e) {
      m.reply(util.format(e));
    }
    new Promise(async (resolve, reject) => {
      try {
        resolve(evalCmd);
      } catch (err) {
        reject(err);
      }
    })
      ?.then((res) => m.reply(util.format(res)))
      ?.catch((err) => m.reply(util.format(err)));
  },
};
