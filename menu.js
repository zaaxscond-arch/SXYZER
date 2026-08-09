const config = require('../../config')
const utils = require('../lib/utils')
const DB = require('../lib/db')

module.exports = {
    name: 'menu',
    alias: ['x', 'help'],
    
    async execute({ sock, msg, sender, isGroup, isOwner }) {
        const user = DB.getUser(sender)
        const settings = DB.getSettings()
        
        const menuText = `
╔═══════════════════════════════════════╗
║     🤖 *${config.botName}*              ║
║     ⚡ Powered by ${config.developer}   ║
╠═══════════════════════════════════════╣
║  👤 *User:* ${msg.pushName}            ║
║  🎭 *Role:* ${user.role.toUpperCase()} ║
║  📊 *Level:* ${user.level}             ║
║  💬 *Messages:* ${user.msgCount}       ║
║  🌐 *Mode:* ${settings.mode.toUpperCase()}
╚═══════════════════════════════════════╝

*PILIH MENU DIBAWAH INI:*`

        const sections = [
            {
                title: '📋 MENU UTAMA',
                rows: [
                    { title: '💀 KILL GROUP', id: '/kill', desc: 'Lock & kudeta grup' },
                    { title: '⚡ CEK PING', id: '/cp', desc: 'Cek kecepatan bot' },
                    { title: '🔄 MODE BOT', id: '/mode', desc: 'Public / Self mode' },
                    { title: '👑 OWNER INFO', id: '/owner', desc: 'Info developer' },
                    { title: '🎭 ROLE & STATS', id: '/role', desc: 'Cek role & jumlah pesan' }
                ]
            }
        ]

        // Tambah menu owner
        if (isOwner) {
            sections.push({
                title: '🔒 OWNER MENU',
                rows: [
                    { title: '🖼️ CHANGE BANNER', id: '/cn', desc: 'Ganti gambar banner bot' }
                ]
            })
        }

        await utils.sendList(sock, msg.key.remoteJid, '🔥 SXYZER BOT NAVIGATION', menuText, sections, 'Pilih opsi di atas untuk melanjutkan')
    }
}