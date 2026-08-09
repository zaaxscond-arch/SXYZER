const config = require('../../config')
const utils = require('../lib/utils')

module.exports = {
    name: 'owner',
    
    async execute({ sock, msg, sender }) {
        const ownerJid = config.ownerNumber
        const ownerNumber = ownerJid.split('@')[0]
        
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.ownerName}
ORG:${config.botName};
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`

        const ownerText = `
╔═══════════════════════════════════════╗
║     👑 *OWNER INFORMATION*            ║
║     🤖 ${config.botName}              ║
╠═══════════════════════════════════════╣
║  👤 Name: ${config.ownerName}         ║
║  🔧 Dev: ${config.developer}          ║
║  📱 Number: ${ownerNumber}            ║
║  🌐 Mode: ${config.pairingCode ? 'Pairing' : 'QR'}
╚═══════════════════════════════════════╝

Klik tombol di bawah untuk chat owner!`

        await sock.sendMessage(msg.key.remoteJid, {
            text: ownerText,
            contacts: {
                displayName: config.ownerName,
                contacts: [{ vcard }]
            }
        })
    }
}