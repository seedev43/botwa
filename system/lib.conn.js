const {
  downloadContentFromMessage,
  jidDecode,
} = require("@whiskeysockets/baileys");
const { writeExifVid, writeExifImg } = require("../lib/exif");
const fs = require("fs");
const { parsePhoneNumber } = require("libphonenumber-js");
const { getBuffer } = require("../functions/functions");

function Connection(conn) {
  conn.downloadMediaMessage = async (message) => {
    let mtypes = Object.keys(message)[0];
    console.log(mtypes, message[mtypes]);
    let mimetypes = message[mtypes].mimetype;
    let rgx = /document/.test(mimetypes)
      ? "document"
      : /(.*)\/(.*)/i.exec(mimetypes)[1];
    const stream = await downloadContentFromMessage(message[mtypes], rgx);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };

  conn.getName = (jid) => {
    let id = conn.decodeJid(jid);
    let v;
    if (id?.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v =
          conn.contacts[id] ||
          conn.messages["status@broadcast"]?.array?.find(
            (a) => a?.key?.participant === id
          );
        if (!(v.name || v.subject)) v = db.groupMetadata[id] || {};
        resolve(
          v?.name ||
            v?.subject ||
            v?.pushName ||
            parsePhoneNumber("+" + id.replace("@g.us", "")).format(
              "INTERNATIONAL"
            )
        );
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === conn.decodeJid(conn?.user?.id)
          ? conn.user
          : conn.contacts[id] || {};
    return (
      v?.name ||
      v?.subject ||
      v?.pushName ||
      v?.verifiedName ||
      parsePhoneNumber("+" + id.replace("@s.whatsapp.net", "")).format(
        "INTERNATIONAL"
      )
    );
  };

  conn.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    return await conn.sendMessage(
      jid,
      { image: buffer, caption: caption, ...options },
      { quoted }
    );
  };

  conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await writeExifImg(buff);
    }

    await conn.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      { quoted }
    );
    return buffer;
  };

  conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await await getBuffer(path)
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    let buffer = await writeExifVid(buff);
    // if (options && (options.packname || options.author)) {
    //     buffer = await writeExifImg(buff, options)
    // } else {
    //     buffer = await imageToWebp(buff)
    // }

    await conn.sendMessage(
      jid,
      { sticker: { url: buffer }, ...options },
      { quoted }
    );
    return buffer;
  };

  conn.sendVideo = async (jid, file, caption, quoted, options = {}) => {
    return await conn.sendMessage(
      jid,
      { video: { url: file }, caption: caption, ...options },
      { quoted }
    );
  };

  return conn;
}

module.exports = Connection;
