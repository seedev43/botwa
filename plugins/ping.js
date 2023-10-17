module.exports = {
  name: "ping",
  desc: "ping menu",
  cmd: "ping",
  async execute(ctx, m, exe) {
    await m.reply("Pong!");
  },
};
