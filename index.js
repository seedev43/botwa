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
const express = require("express");
const app = express();
const P = require("pino");
const serializeMsg = require("./system/serialize.js");
const message = require("./system/message.js");
const Connection = require("./system/lib.conn.js");

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
      // conn.sendMessage("6289665362153@s.whatsapp.net", { text: "BOT AKTIF!" });
      console.log("BOT STARTED!");
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("messages.upsert", async (msg) => {
    let n = msg.messages[0];
    if (!n.message) return;
    const newConn = await Connection(conn);
    const m = await serializeMsg(newConn, n);
    await message(newConn, m);
  });
};

startBot();

app.listen(process.env.PORT);
