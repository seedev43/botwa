const util = require("util");

module.exports = {
  name: "eval",
  tags: "owner",
  isOwner: true,
  run: async ({ conn, m }) => {
    if (!m.query) return;
    if (!m.isOwner) return m.reply("om jangan om");

    let evalCmd;
    try {
      evalCmd = /await/i.test(m.query)
        ? eval("(async() => { " + m.query + " })()")
        : eval(m.query);
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
