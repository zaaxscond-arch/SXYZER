const fs = require('fs-extra')
const path = require('path')
const config = require('../../config')

class Database {
    constructor() {
        this.file = config.database
        this.data = {
            users: {},
            groups: {},
            settings: {
                mode: 'public', // public / self
                banner: config.bannerPath
            },
            stats: {
                totalMsg: 0,
                commands: {}
            }
        }
    }

    init() {
        if (fs.existsSync(this.file)) {
            this.data = fs.readJsonSync(this.file)
        } else {
            this.save()
        }
    }

    save() {
        fs.writeJsonSync(this.file, this.data, { spaces: 2 })
    }

    // User management
    getUser(jid) {
        if (!this.data.users[jid]) {
            this.data.users[jid] = {
                name: '',
                msgCount: 0,
                role: 'user',
                xp: 0,
                level: 1,
                registered: false,
                banned: false,
                lastMsg: 0
            }
            this.save()
        }
        return this.data.users[jid]
    }

    addMsg(jid, name) {
        const user = this.getUser(jid)
        user.msgCount++
        user.name = name || user.name
        user.lastMsg = Date.now()
        
        // Leveling system
        const xpNeeded = user.level * 100
        user.xp += Math.floor(Math.random() * 10) + 5
        if (user.xp >= xpNeeded) {
            user.level++
            user.xp = 0
        }
        
        this.data.stats.totalMsg++
        this.save()
        return user
    }

    // Group management
    getGroup(gid) {
        if (!this.data.groups[gid]) {
            this.data.groups[gid] = {
                name: '',
                antilink: false,
                antispam: false,
                welcome: true,
                mute: false,
                locked: false
            }
            this.save()
        }
        return this.data.groups[gid]
    }

    setGroup(gid, key, value) {
        const group = this.getGroup(gid)
        group[key] = value
        this.save()
    }

    // Settings
    getSettings() {
        return this.data.settings
    }

    setSettings(key, value) {
        this.data.settings[key] = value
        this.save()
    }

    // Stats
    addCommand(cmd) {
        if (!this.data.stats.commands[cmd]) {
            this.data.stats.commands[cmd] = 0
        }
        this.data.stats.commands[cmd]++
        this.save()
    }
}

module.exports = new Database()