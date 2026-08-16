import { TestIds } from "react-native-google-mobile-ads";

const productionIds = {
    banner: "ca-app-pub-3738413299329691/9492904106",
    interstitial: "ca-app-pub-3738413299329691/4108144669",
    appOpen: "ca-app-pub-3738413299329691/2302002382",
};

const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

export const bannerId = useTestAds ? TestIds.ADAPTIVE_BANNER : productionIds.banner;
export const interstitialId = useTestAds ? TestIds.INTERSTITIAL : productionIds.interstitial;
export const appOpenId = useTestAds ? TestIds.APP_OPEN : productionIds.appOpen;
