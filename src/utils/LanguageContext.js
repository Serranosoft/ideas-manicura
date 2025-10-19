// LanguageContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './localizations';
import { getLocales } from 'expo-localization';
import { userPreferences } from './user-preferences';
import { scheduleWeeklyNotification } from './notifications';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {

    // Idioma
    const [language, setLanguage] = useState(null);
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
        const language = await AsyncStorage.getItem(userPreferences.LANGUAGE);
        setLanguage(language || getLocales()[0].languageCode);
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