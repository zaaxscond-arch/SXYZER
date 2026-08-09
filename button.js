// Helper untuk tombol interaktif modern
module.exports = {
    // Create quick reply buttons
    quickReply(texts) {
        return texts.map((text, i) => ({
            quickReplyButton: {
                displayText: text,
                id: `btn_${i}`
            }
        }))
    },

    // Create URL button
    urlButton(url, text) {
        return {
            urlButton: {
                displayText: text,
                url: url
            }
        }
    },

    // Create call button
    callButton(phone, text) {
        return {
            callButton: {
                displayText: text,
                phoneNumber: phone
            }
        }
    },

    // Template message (for iOS compatibility)
    templateButtons(buttons) {
        return {
            templateMessage: {
                hydratedTemplate: {
                    hydratedContentText: '',
                    hydratedFooterText: '',
                    hydratedButtons: buttons
                }
            }
        }
    }
}