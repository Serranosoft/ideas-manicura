import { TestIds } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

const androidProductionIds = {
    banner: "ca-app-pub-3738413299329691/9492904106",
    interstitial: "ca-app-pub-3738413299329691/4108144669",
    appOpen: "ca-app-pub-3738413299329691/2302002382",
};

const iosProductionIds = {
    appId: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID,
    banner: process.env.EXPO_PUBLIC_IOS_ADMOB_BANNER_ID,
    interstitial: process.env.EXPO_PUBLIC_IOS_ADMOB_INTERSTITIAL_ID,
    appOpen: process.env.EXPO_PUBLIC_IOS_ADMOB_APP_OPEN_ID,
};

const hasIosProductionIds = Object.values(iosProductionIds).every(Boolean);
const productionIds = Platform.OS === "ios" ? iosProductionIds : androidProductionIds;
const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

// Never serve Android ad units (or demo ads) to a production iOS build.
export const adsEnabled =
    Platform.OS !== "ios" || hasIosProductionIds || useTestAds;

export const bannerId = useTestAds ? TestIds.ADAPTIVE_BANNER : productionIds.banner;
export const interstitialId = useTestAds ? TestIds.INTERSTITIAL : productionIds.interstitial;
export const appOpenId = useTestAds ? TestIds.APP_OPEN : productionIds.appOpen;
