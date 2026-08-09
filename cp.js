const utils = require('../lib/utils')

module.exports = {
    name: 'cp',
    
    async execute({ sock, msg }) {
        const start = Date.now()
        
        // Test dengan kirim pesan pending
        const sent = await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Testing...' })
        
        const end = Date.now()
        const ping = end - start
        
        // Hapus pesan testing
        await sock.sendMessage(msg.key.remoteJid, { delete: sent.key })
        
        const pingText = `
╔═══════════════════════════════════════╗
║     ⚡ *PING TEST*                    ║
║     🤖 ${config.botName}              ║
╠═══════════════════════════════════════╣
║  📡 Latency: ${ping}ms                ║
║  🟢 Status: ${ping < 100 ? 'EXCELLENT' : ping < 300 ? 'GOOD' : 'NORMAL'}
║  ⏱️ Time: ${utils.getTime()}          ║
╚═══════════════════════════════════════╝`

        await utils.reply(sock, msg, pingText)
    }
}