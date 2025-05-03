import en from '../languages/en.js';
import hu from '../languages/hu.js';

// https://discord.com/developers/docs/reference#locales
class localizations {
  locales = {
    en: en,
    hu: hu,
  };
  getLanguage(locale) {
    if (!(locale in this.locales)) {
      return this.locales["en"];
    }
    return this.locales[locale];
  }
}
export default localizations;
