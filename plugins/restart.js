const { exec } = require("child_process") 

module.exports = {
	name: "restart command",
	desc: "restart action",
	cmd: "rs", 
	async execute(ctx, m) {
		try {
			exec("pm2 restart all", (error, stdout, stderr) => {
				if(error) {
					message = "Error:" +error.message
				} else if(stderr) {
					message = "stderr:" +stderr
				} else {
					message = "Sukses restart"
				} 
				return ctx.sendMessage(m.key.remoteJid, {text: message})
			}) 
		} catch (error) {
			return ctx.sendMessage(m.key.remoteJid, {text: String(error)}) 
		} 
	} 
} 
	