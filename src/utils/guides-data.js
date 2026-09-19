const WORDPRESS_UPLOADS = "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09";

const imageSequence = (prefix, count) =>
    Array.from({ length: count }, (_, index) => `${WORDPRESS_UPLOADS}/${prefix}-${index + 1}.jpg`);

const localized = (es, en) => ({ es, en });

export const guideCategories = [
    {
        id: "babyboomer",
        title: localized("Baby Boomer", "Baby Boomer"),
        cover: `${WORDPRESS_UPLOADS}/baby-boomer-8.jpg`,
        designs: [
            {
                id: "sencillas",
                title: localized("Sencillas", "Simple"),
                cover: `${WORDPRESS_UPLOADS}/baby-boomer-8.jpg`,
                images: imageSequence("baby-boomer", 8),
            },
        ],
    },
    {
        id: "flores",
        title: localized("Flores", "Flowers"),
        cover: `${WORDPRESS_UPLOADS}/flores-margarita-6.jpg`,
        designs: [
            {
                id: "margarita",
                title: localized("Margarita", "Daisy"),
                cover: `${WORDPRESS_UPLOADS}/flores-margarita-6.jpg`,
                images: imageSequence("flores-margarita", 6),
            },
            {
                id: "relieve",
                title: localized("Flores en relieve", "Embossed flowers"),
                cover: `${WORDPRESS_UPLOADS}/relieve-6.jpg`,
                images: imageSequence("relieve", 6),
            },
        ],
    },
    {
        id: "lazos",
        title: localized("Lazos", "Bows"),
        cover: `${WORDPRESS_UPLOADS}/lazos-relleno-6.jpg`,
        designs: [
            {
                id: "oscuro",
                title: localized("Lazo oscuro", "Dark bow"),
                cover: `${WORDPRESS_UPLOADS}/lazos-oscuro-6.jpg`,
                images: imageSequence("lazos-oscuro", 6),
            },
            {
                id: "relleno",
                title: localized("Lazo relleno", "Filled bow"),
                cover: `${WORDPRESS_UPLOADS}/lazos-relleno-6.jpg`,
                images: imageSequence("lazos-relleno", 6),
            },
        ],
    },
];

const guideCopy = {
    es: {
        navGuides: "Guías",
        guidesTitle: "Guías paso a paso",
        guidesBadge: "APRENDE Y CREA",
        chooseCategory: "Elige una categoría",
        designsTitle: "Diseños",
        design: "diseño",
        designs: "diseños",
        step: "Paso",
        steps: "pasos",
        previous: "Anterior",
        next: "Siguiente",
        finish: "Terminar",
        watchAd: "Ver anuncio",
        unlocked: "Desbloqueada",
        unlockTitle: "Desbloquear guía",
        unlockMessage: "Mira un anuncio completo para desbloquear «%{guide}» durante 24 horas.",
        adNotReadyTitle: "El anuncio se está preparando",
        adNotReadyMessage: "Espera unos segundos y vuelve a tocar la guía.",
        adUnavailableTitle: "Anuncio no disponible",
        adUnavailableMessage: "Esta guía necesita un anuncio recompensado, pero todavía no está configurado.",
        adErrorTitle: "No se pudo mostrar el anuncio",
        adErrorMessage: "Comprueba tu conexión e inténtalo de nuevo.",
    },
    en: {
        navGuides: "Guides",
        guidesTitle: "Step-by-step guides",
        guidesBadge: "LEARN AND CREATE",
        chooseCategory: "Choose a category",
        designsTitle: "Designs",
        design: "design",
        designs: "designs",
        step: "Step",
        steps: "steps",
        previous: "Previous",
        next: "Next",
        finish: "Finish",
        watchAd: "Watch ad",
        unlocked: "Unlocked",
        unlockTitle: "Unlock guide",
        unlockMessage: "Watch one complete ad to unlock “%{guide}” for 24 hours.",
        adNotReadyTitle: "The ad is getting ready",
        adNotReadyMessage: "Wait a few seconds and tap the guide again.",
        adUnavailableTitle: "Ad unavailable",
        adUnavailableMessage: "This guide requires a rewarded ad, but it has not been configured yet.",
        adErrorTitle: "The ad could not be shown",
        adErrorMessage: "Check your connection and try again.",
    },
};

export function getGuideCopy(locale) {
    return String(locale || "es").toLowerCase().startsWith("es")
        ? guideCopy.es
        : guideCopy.en;
}

export function getGuideLabel(value, locale) {
    return value?.[String(locale || "es").toLowerCase().startsWith("es") ? "es" : "en"]
        || value?.es
        || "";
}

export function getGuideCategory(categoryId) {
    return guideCategories.find((category) => category.id === categoryId);
}

export function getGuideDesign(categoryId, designId) {
    return getGuideCategory(categoryId)?.designs.find((design) => design.id === designId);
}
