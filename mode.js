const config = require('../../config')
const utils = require('../lib/utils')
const DB = require('../lib/db')

module.exports = {
    name: 'mode',
    
    async execute({ sock, msg, sender, isOwner }) {
        if (!isOwner) {
            return await utils.reply(sock, msg, '🚫 Hanya owner yang bisa ganti mode!')
        }

        const settings = DB.getSettings()
        const currentMode = settings.mode
        const newMode = currentMode === 'public' ? 'self' : 'public'
        
        DB.setSettings('mode', newMode)
        
        const modeText = `
╔═══════════════════════════════════════╗
║     🔄 *MODE CHANGED*                 ║
║     🤖 ${config.botName}              ║
╠═══════════════════════════════════════╣
║  📊 Mode Lama: ${currentMode.toUpperCase()}
║  ✨ Mode Baru: ${newMode.toUpperCase()}
║  ⏱️ Time: ${utils.getTime()}          ║
╚═══════════════════════════════════════╝

${newMode === 'self' ? '🔒 Bot hanya merespon owner sekarang' : '🌐 Bot merespon semua user sekarang'}`

        await utils.reply(sock, msg, modeText)
    }
}