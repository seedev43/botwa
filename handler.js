const fs = require("fs");
require("dotenv").config();
require("./setting.js");
const { removePrefix } = require("./functions");
let reads = fs.readdirSync("./plugins").filter((read) => read.endsWith(".js"));
let cmdMap = new Map();
for (let read of reads) {
  const cmds = require(`./plugins/${read}`);
  cmdMap.set(cmds.cmd, cmds);
}

module.exports = handler = (ctx, m, store) => {
  //   console.log(m);
  if (m.isGroup) {
    if (![...global.opt.groups.listed].includes(m.chat)) return;
  }
  let qmsg = m.quoted || m.msg;
  if (!m.body.startsWith(global.opt.prefix)) return;
  let cmdName = m.body
    .slice(global.opt.prefix.length)
    .trim()
    .split(/ +/)
    .shift()
    .toLowerCase();
  if (!cmdMap.has(cmdName)) return;
  const cmd = cmdMap.get(cmdName);

  const exe = removePrefix(m.body, global.opt.prefix + cmdName).trim();

  try {
    cmd.execute(ctx, m, exe, store);
  } catch (error) {
    throw error;
  }
};
