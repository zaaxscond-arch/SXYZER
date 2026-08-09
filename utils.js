const moment = require('moment-timezone')
const config = require('../../config')

module.exports = {
    // Format nomor JID
    formatJid(number) {
        let cleaned = number.replace(/[^0-9]/g, '')
        if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1)
        if (!cleaned.startsWith('62')) cleaned = '62' + cleaned
        return cleaned + '@s.whatsapp.net'
    },

    // Cek apakah owner
    isOwner(jid) {
        return jid === config.ownerNumber || jid.includes(config.ownerNumber.split('@')[0])
    },

    // Cek apakah grup
    isGroup(msg) {
        return msg.key.remoteJid.endsWith('@g.us')
    },

    // Get group metadata
    async getGroupInfo(sock, gid) {
        try {
            return await sock.groupMetadata(gid)
        } catch {
            return null
        }
    },

    // Format uptime
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        return `${days}d ${hours}h ${minutes}m ${secs}s`
    },

    // Get time
    getTime() {
        return moment().tz(config.timezone).format('DD/MM/YYYY HH:mm:ss')
    },

    // Parse message
    getText(msg) {
        try {
            return msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || ''
        } catch {
            return ''
        }
    },

    // Get sender
    getSender(msg) {
        return msg.key.participant || msg.key.remoteJid
    },

    // Reply function
    async reply(sock, msg, text, options = {}) {
        await sock.sendMessage(msg.key.remoteJid, {
            text,
            ...options
        }, { quoted: msg })
    },

    // Send button message
    async sendButton(sock, jid, text, buttons, footer = '') {
        const buttonMessage = {
            text,
            footer,
            buttons: buttons.map(btn => ({
                buttonId: btn.id,
                buttonText: { displayText: btn.text },
                type: 1
            })),
            headerType: 1
        }
        await sock.sendMessage(jid, buttonMessage)
    },

    // Send list message (modern navigation)
    async sendList(sock, jid, title, text, sections, footer = '') {
        const listMessage = {
            text,
            title,
            footer,
            buttonText: '🔥 KLIK DISINI',
            sections: sections.map(section => ({
                title: section.title,
                rows: section.rows.map(row => ({
                    title: row.title,
                    rowId: row.id,
                    description: row.desc
                }))
            }))
        }
        await sock.sendMessage(jid, listMessage)
    },

    // Send image with caption
    async sendImage(sock, jid, path, caption, options = {}) {
        await sock.sendMessage(jid, {
            image: { url: path },
            caption,
            ...options
        })
    }
}