import emojiFlags from 'emoji-flags'
import _ from 'lodash'
import i18n, { type Config } from 'sveltekit-i18n'

type ParserPayload = { [key: string]: number | string }

function detectBrowserLocale(): string {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('locale')
        if (saved) return saved
    }

    if (typeof navigator !== 'undefined') {
        const lang = navigator.language.toLowerCase()

        if (lang.startsWith('pt')) return 'pt'
        if (lang.startsWith('es')) return 'es'
        if (lang.startsWith('de')) return 'de'
        if (lang.startsWith('zh')) return 'zh-cn'
    }

    return 'en'
}

export const availableLocales: Record<string, [string, string]> = {
    en: ['English', emojiFlags.GB.emoji],
    de: ['Deutsch', emojiFlags.DE.emoji],
    es: ['Español', emojiFlags.ES.emoji],
    'zh-cn': ['中文', emojiFlags.CN.emoji],
    pt: ['Português', emojiFlags.BR.emoji]
}

export const fallbackLocale = 'en'
const initLocale = detectBrowserLocale()

const localeFiles = Object.assign(
    import.meta.glob('./*/*.json'),
    import.meta.glob('./*/*/*.json'),
    import.meta.glob('./*/*/*/*.json')
)

const localeFileKeys = ['ui', 'achievements', 'quests/index']

import quests from '$lib/assets/quests/index.json'

_.each(quests, (questObject) => {
    localeFileKeys.push(`quests/${questObject.id}/elements`)
    localeFileKeys.push(`quests/${questObject.id}/groups`)
})

const loaders: Config['loaders'] = Object.keys(availableLocales).flatMap(locale =>
    localeFileKeys.map(key => ({
        locale,
        key,
        loader: () =>
            localeFiles[`./${locale}/${key}.json`]().then(module =>
                _.get(module, 'default', null) as object
            )
    }))
)

const translationConfig: Config<ParserPayload> = {
    initLocale,
    fallbackLocale,
    loaders
}

export const { t, locale, locales, loading, loadTranslations } = new i18n(translationConfig)

if (typeof window !== 'undefined') {
    locale.subscribe(value => {
        localStorage.setItem('locale', value)
    })
}