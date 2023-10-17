const fetch = require("node-fetch");
module.exports = {
  name: "ttdl",
  desc: "tiktok downloader",
  cmd: "ttdl",
  async execute(ctx, m, exe) {
      try {
          
        if (!exe) return m.reply("mana url tiktok nya");
        let donglod = await fetch(
          `${global.api}/tiktokdl?url=${exe}`
        );
        let result = await donglod.json();
        if (!result.success) return m.reply("gagal mendownload");
        return await ctx.sendVideo(
          m.chat,
          result.data.downloadUrls[1], "", m
        );
        /*return await ctx.sendFile(
          m.chat,
          result.data.downloadUrls[1],
          "done ga bang?",
          true, 
          m
        );
        */
      } catch(error) {
          console.error(error)
          await m.reply("Terjadi error..")
      }
     } 
};
// https://v19.tiktokcdn.com/650cd56b5b1a0e3f09ebc9f64d7fc575/6482c201/video/tos/useast2a/tos-useast2a-pve-0037-aiso/ogQt1IXEeEdDsgriHloAoeDG13nv5NgpKbcfxe/?a=1180&ch=0&cr=0&dr=0&lr=all&cd=0%7C0%7C0%7C0&cv=1&br=1014&bt=507&cs=0&ds=6&ft=iusKpyhZZiK0PD1zhItXg9wHU9SWkEeC~&mime_type=video_mp4&qs=0&rc=MzRmNztmOTszaTg8PDpnZEBpM3ZkbjY6ZmloajMzZjgzM0BgNF9iYDU2XmIxYDEzNDIuYSNra15mcjRvcWFgLS1kL2Nzcw%3D%3D&l=20230609000834B79340207FA0A14DC87F&btag=e00080000&cc=4
