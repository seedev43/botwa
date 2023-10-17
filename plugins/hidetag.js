module.exports = {
	name: "hidetag",
	desc: "hide tag group",
	cmd: "ht",
	async execute(ctx, m, exe) {
		try {
			const groupMetadata = m.isGroup ? await ctx.groupMetadata(m.chat).catch(e => {}) : "" 
			const participants = m.isGroup ? await groupMetadata.participants : "" 
			if(!m.isGroup) return m.reply("Bukan grup") 
			if(!m.isOwner) return m.reply("gmw") 
			ctx.sendMessage(m.chat, {text: exe ? exe : "", mentions: participants.map(a => a.id)}) 
		} catch (e) {
			ctx.sendMessage(m.chat, {text: String(e)})
		}
	}
}