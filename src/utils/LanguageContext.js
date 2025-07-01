// LanguageContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './localizations';
import { getLocales } from 'expo-localization';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Idioma
    const [language, setLanguage] = useState(getLocales()[0].languageCode || "es");
    const i18n = new I18n(translations);
    i18n.locale = language;
    i18n.enableFallback = true
    i18n.defaultLocale = "es";

    useEffect(() => {
        getLanguage();
    }, [])

    async function getLanguage() {
        const language = await AsyncStorage.getItem("language");
        setLanguage(language || "es");
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