const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  jidDecode,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  Browsers,
} = require("@whiskeysockets/baileys");
const { parsePhoneNumber } = require("libphonenumber-js");
const axios = require("axios");
const express = require("express");
const app = express();
const handler = require("./handler.js");
const { exc } = require("./seedev.js");
const { getBuffer } = require("./functions.js");
const { writeExifImg, writeExifVid } = require("./lib/exif.js");
const P = require("pino");

app.get("/", (req, res) => {
  res.send("halo");
});

const store = makeInMemoryStore({
  logger: P({ level: "fatal" }).child({ level: "fatal" }),
});
const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session_wa");

  const conn = makeWASocket({
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        P({ level: "fatal" }).child({ level: "fatal" })
      ),
    },
    browser: Browsers.macOS("Desktop"),
    logger: P({ level: "fatal" }).child({ level: "fatal" }),
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);

      return msg?.message || "";
    },
  });

  store.bind(conn.ev);

  // push update name to store.contacts
  conn.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = jidNormalizedUser(contact.id);
      if (store && store.contacts)
        store.contacts[id] = { id, name: contact.notify };
    }
  });

  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect.error?.output?.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        process.send("reset");
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        await startBot();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        await startBot();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        );
        process.exit(1);
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        process.exit(1);
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        await startBot();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        process.send("reset");
      } else if (reason === DisconnectReason.multideviceMismatch) {
        console.log("Multi device mismatch, please scan again");
        process.exit(0);
      } else {
        console.log(reason);
        process.send("reset");
      }
    } else if (connection === "open") {
      conn.sendMessage("6289665362153@s.whatsapp.net", { text: "BOT AKTIF!" });
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("messages.upsert", async (msg) => {
    let n = msg.messages[0];
    if (!n.message) return;
    const m = exc(conn, n);
    // console.log(m);

    handler(conn, m, store);

    // auto read story
    if (n.key.remoteJid.endsWith("@broadcast")) {
      if (m.fromMe) return;
      await conn.readMessages([n.key]);
      let txt = `Berhasil melihat status ${n.pushName} (${
        n.key.participant.split("@")[0]
      })`;

      // kirim notif ke grup
      await conn.sendMessage("120363029632242050@g.us", { text: txt });
    }
  });
  // console.log(conn)
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
      ? await await getBuffer(path)
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
};

startBot();

app.listen(process.env.PORT);
