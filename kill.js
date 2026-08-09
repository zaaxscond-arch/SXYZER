const utils = require('../lib/utils')
const DB = require('../lib/db')

module.exports = {
    name: 'kill',
    
    async execute({ sock, msg, sender, isGroup, groupId, isOwner }) {
        if (!isGroup) {
            return await utils.reply(sock, msg, '❌ Fitur ini hanya untuk grup!')
        }

        if (!isOwner) {
            return await utils.reply(sock, msg, '🚫 Hanya owner yang bisa menggunakan fitur ini!')
        }

        const group = DB.getGroup(groupId)
        
        try {
            // Ambil metadata grup
            const metadata = await sock.groupMetadata(groupId)
            const participants = metadata.participants
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
            
            // Cek apakah bot admin
            const botParticipant = participants.find(p => p.id === botId)
            if (!botParticipant || botParticipant.admin === null) {
                return await utils.reply(sock, msg, '⚠️ Bot harus jadi admin untuk menggunakan fitur ini!')
            }

            // Lock grup
            group.locked = true
            group.mute = true
            DB.setGroup(groupId, 'locked', true)
            DB.setGroup(groupId, 'mute', true)

            // Set group settings
            await sock.groupSettingUpdate(groupId, 'announcement') // Hanya admin yang bisa chat
            
            // Kick semua member kecuali owner dan bot
            const membersToRemove = participants
                .filter(p => p.id !== sender && p.id !== botId && p.id !== config.ownerNumber)
                .map(p => p.id)

            if (membersToRemove.length > 0) {
                await sock.groupParticipantsUpdate(groupId, membersToRemove, 'remove')
            }

            // Kirim pesan ke grup
            const killText = `
╔═══════════════════════════════════════╗
║     💀 *GROUP LOCKED*                 ║
║     ⚡ By ${config.developer}         ║
╠═══════════════════════════════════════╣
║  Grup ini telah dikunci!              ║
║  Hanya admin yang bisa mengirim pesan ║
║  Member lain telah dikeluarkan        ║
╚═══════════════════════════════════════╝`

            await sock.sendMessage(groupId, { 
                text: killText,
                mentions: [sender]
            })

            // Kirim konfirmasi ke owner
            await utils.reply(sock, msg, `✅ *KILL EXECUTED*\n\n📊 Member dikeluarkan: ${membersToRemove.length}\n🔒 Grup dikunci: ON\n🤖 Bot aktif sebagai admin`)

        } catch (err) {
            throw new Error(`Gagal lock grup: ${err.message}`)
        }
    }
}