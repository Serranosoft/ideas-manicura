// LanguageContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './localizations';
import { getLocales } from 'expo-localization';
import { userPreferences } from './user-preferences';
import { scheduleWeeklyNotification } from './notifications';
import { getDeviceLocale, normalizeLocale } from './supported-locales';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {

    // Idioma
    const [langRdy, setLangRdy] = useState(false);
    const [language, setLanguageState] = useState(getDeviceLocale(getLocales()[0]));
    const i18n = new I18n(translations);
    if (language) i18n.locale = language;
    i18n.enableFallback = true
    i18n.defaultLocale = "es";

    useEffect(() => {
        getLanguage();
    }, [])

    // Al terminar de configurar el idioma se lanza notificación
    useEffect(() => {
        if (language) {
            scheduleWeeklyNotification(i18n);
        }
    }, [language])

    async function getLanguage() {
        const storedLanguage = await AsyncStorage.getItem(userPreferences.LANGUAGE);
        setLanguageState(storedLanguage
            ? normalizeLocale(storedLanguage)
            : getDeviceLocale(getLocales()[0]));
        setLangRdy(true);
    }

    function setLanguage(locale) {
        setLanguageState(normalizeLocale(locale));
    }

    return (
        <LanguageContext.Provider value={{ language: i18n, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
    return context;
};
