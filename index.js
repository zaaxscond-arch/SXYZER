const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    PHONENUMBER_MCC
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const config = require('./config')
const handler = require('./src/handler')

// Setup readline untuk input nomor
const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
})

const question = (text) => new Promise((resolve) => rl.question(text, resolve))

// Logger silent
const logger = pino({ level: 'silent' })

// Inisialisasi database
const DB = require('./src/lib/db')
DB.init()

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false, // Matikan QR, pake pairing
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async () => ({ conversation: 'hello' })
    })

    // Pairing Code Logic
    if (!sock.authState.creds.registered) {
        console.log(chalk.cyan.bold(`
    ╔═══════════════════════════════════════╗
    ║     SXYZER BOT - Pairing Mode         ║
    ║     Developer: zaax                   ║
    ╚═══════════════════════════════════════╝
        `))
        
        const phoneNumber = await question(chalk.yellow('📱 Masukkan nomor bot (62xxx): '))
        
        // Validasi nomor
        const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '')
        if (!cleanedNumber || cleanedNumber.length < 10) {
            console.log(chalk.red('❌ Nomor tidak valid!'))
            process.exit(1)
        }

        // Set owner number sama kayak bot number
        config.ownerNumber = cleanedNumber + '@s.whatsapp.net'
        
        console.log(chalk.blue('⏳ Meminta pairing code...'))
        
        try {
            const code = await sock.requestPairingCode(cleanedNumber)
            console.log(chalk.green.bold(`
    ╔═══════════════════════════════════════╗
    ║  PAIRING CODE: ${code}              ║
    ╚═══════════════════════════════════════╝
            `))
            console.log(chalk.yellow('📲 Buka WhatsApp > Titik Tiga > Perangkat Tertaut > Tautkan'))
            console.log(chalk.yellow('   Masukkan kode di atas\n'))
        } catch (err) {
            console.log(chalk.red('❌ Gagal generate pairing code:', err.message))
            process.exit(1)
        }
    }

    // Connection Handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'open') {
            console.log(chalk.green.bold(`
    ╔══════════════════════════════════════════════════╗
    ║  ✅ SXYZER BOT CONNECTED                         ║
    ║  👤 Bot Number: ${sock.user.id.split(':')[0]}   ║
    ║  👑 Owner: ${config.ownerName}                  ║
    ║  🔧 Developer: ${config.developer}              ║
    ╚══════════════════════════════════════════════════╝
            `))
            rl.close()
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting...'))
                startBot()
            } else {
                console.log(chalk.red('❌ Logged out. Hapus folder session dan restart.'))
                process.exit(1)
            }
        }
    })

    // Save credentials
    sock.ev.on('creds.update', saveCreds)

    // Message Handler
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                if (!msg.key.fromMe && msg.message) {
                    await handler(sock, msg)
                }
            }
        }
    })

    // Group Participants Update
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update
        if (action === 'add') {
            for (const user of participants) {
                const groupMetadata = await sock.groupMetadata(id)
                const welcomeText = `👋 Selamat datang @${user.split('@')[0]} di *${groupMetadata.subject}*!\n\nKetik */x* untuk melihat menu bot.`
                await sock.sendMessage(id, { 
                    text: welcomeText,
                    mentions: [user]
                })
            }
        }
    })
}

startBot().catch(err => {
    console.error(chalk.red('Fatal Error:', err))
    process.exit(1)
})