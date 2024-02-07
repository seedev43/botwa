const chalk = require("chalk");
const moment = require("moment-timezone");
const { commandExecute } = require("./command");
const { whiteList } = require("../config/config");

async function message(conn, m) {
  if (m.isGroup) {
    if (!whiteList.groups.listed.includes(m.chat)) return;
  }

  // auto read story

  if (m.chat.endsWith("@broadcast")) {
    if (m.fromMe) return;
    await conn.readMessages([m.key]);
    let txt = `Berhasil melihat status ${m.pushName} (${
      m.key.participant.split("@")[0]
    })`;

    // kirim notif ke log dan grup
    console.log(txt);
    await conn.sendMessage("120363029632242050@g.us", { text: txt });
  }

  let ok = new Date(m.date * 1000);
  let log = `${chalk.red("------------------------------")}
${
  m.isGroup
    ? `${chalk.magenta(m.type.toUpperCase() + " CHAT")}
${chalk.blueBright("GROUP ID: " + m.chat)}
${chalk.blueBright("USER ID: " + m.sender)}
${chalk.blueBright("PUSHNAME: " + m.pushname)}
${chalk.blueBright("MESSAGE ID: " + m.id)}
${chalk.blueBright("MESSAGE:\n" + m.body)}`
    : `${chalk.magenta(m.type.toUpperCase() + " CHAT")}
${chalk.cyan("USER ID: " + m.sender)}
${chalk.cyan("PUSHNAME: " + m.pushname)}
${chalk.cyan("MESSAGE ID: " + m.id)}
${chalk.cyan("MESSAGE:\n" + m.body)}`
}
${chalk.yellow("SENDING AT: " + moment(ok).format("DD-MM-YYYY HH:mm:ss"))}
${chalk.red("------------------------------")}
`;
  console.log(log);
  // console.log(m);

  commandExecute(conn, m);
}

module.exports = message;
