const config = require('../config')
const DB = require('./lib/db')
const utils = require('./lib/utils')

// Import commands
const menu = require('./commands/menu')
const kill = require('./commands/kill')
const cp = require('./commands/cp')
const mode = require('./commands/mode')
const owner = require('./commands/owner')
const role = require('./commands/role')
const cn = require('./commands/cn')

const commands = {
    'x': menu,
    'menu': menu,
    'kill': kill,
    'cp': cp,
    'mode': mode,
    'owner': owner,
    'role': role,
    'cn': cn
}

module.exports = async (sock, msg) => {
    const text = utils.getText(msg).trim()
    const sender = utils.getSender(msg)
    const isGroup = utils.isGroup(msg)
    const groupId = isGroup ? msg.key.remoteJid : null

    // Update user data
    const pushName = msg.pushName || 'Unknown'
    DB.addMsg(sender, pushName)

    // Cek mode self
    const settings = DB.getSettings()
    if (settings.mode === 'self' && !utils.isOwner(sender)) {
        return
    }

    // Parse command
    const prefix = config.prefix
    if (!text.startsWith(prefix)) return

    const args = text.slice(prefix.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()
    const fullArgs = args.join(' ')

    // Cek command
    if (commands[cmd]) {
        DB.addCommand(cmd)
        
        const context = {
            sock,
            msg,
            sender,
            isGroup,
            groupId,
            args,
            fullArgs,
            isOwner: utils.isOwner(sender),
            pushName
        }

        try {
            await commands[cmd].execute(context)
        } catch (err) {
            console.error(`Error in /${cmd}:`, err)
            await utils.reply(sock, msg, `❌ Error: ${err.message}`)
        }
    }
}