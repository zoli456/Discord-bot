const en = require ("../languages/en.js")
const hu = require ("../languages/hu.js")

// https://discord.com/developers/docs/reference#locales
class localizations{
    locales = {
        'en': en,
        'hu': hu,
    }
    getLanguage(locale) {
        if (!(locale in this.locales)) { return (this.locales)['en'] }
        return (this.locales)[locale]
    }
}
module.exports = localizations;
