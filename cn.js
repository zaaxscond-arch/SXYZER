const config = require('../../config')
const utils = require('../lib/utils')
const DB = require('../lib/db')
const fs = require('fs-extra')
const path = require('path')
const axios = require('axios')

module.exports = {
    name: 'cn',
    
    async execute({ sock, msg, sender, isOwner, args }) {
        if (!isOwner) {
            return await utils.reply(sock, msg, '🚫 Hanya owner yang bisa ganti banner!')
        }

        // Cek apakah ada quoted image
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
        const hasImage = quoted?.imageMessage || msg.message.imageMessage

        if (!hasImage && args.length === 0) {
            return await utils.reply(sock, msg, 
                '🖼️ *CARA MENGGANTI BANNER:*\n\n' +
                '1. Kirim gambar dengan caption `/cn`\n' +
                '2. Atau reply gambar dengan `/cn`\n' +
                '3. Atau `/cn <url_gambar>`\n\n' +
                'Banner akan diterapkan global di semua grup!'
            )
        }

        try {
            let buffer

            if (msg.message.imageMessage) {
                // Direct image
                buffer = await sock.downloadMediaMessage(msg)
            } else if (quoted?.imageMessage) {
                // Quoted image
                const quotedMsg = {
                    key: {
                        remoteJid: msg.key.remoteJid,
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: msg.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quoted
                }
                buffer = await sock.downloadMediaMessage(quotedMsg)
            } else if (args[0]) {
                // URL
                const res = await axios.get(args[0], { responseType: 'arraybuffer' })
                buffer = Buffer.from(res.data, 'binary')
            }

            if (!buffer) {
                throw new Error('Gagal mendownload gambar')
            }

            // Save banner
            const bannerPath = path.join(__dirname, '../../banner.jpg')
            await fs.writeFile(bannerPath, buffer)
            
            // Update config & DB
            config.bannerPath = bannerPath
            DB.setSettings('banner', bannerPath)

            // Send confirmation with new banner
            await sock.sendMessage(msg.key.remoteJid, {
                image: buffer,
                caption: `
╔═══════════════════════════════════════╗
║     🖼️ *BANNER UPDATED*               ║
║     🤖 ${config.botName}              ║
╠═══════════════════════════════════════╣
║  ✅ Banner berhasil diperbarui!       ║
║  🌐 Berlaku global di semua grup      ║
║  ⏱️ Time: ${utils.getTime()}          ║
╚═══════════════════════════════════════╝`
            })

        } catch (err) {
            throw new Error(`Gagal update banner: ${err.message}`)
        }
    }
}