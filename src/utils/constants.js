import { TestIds } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

const androidProductionIds = {
    banner: "ca-app-pub-3738413299329691/9492904106",
    interstitial: "ca-app-pub-3738413299329691/4108144669",
    appOpen: "ca-app-pub-3738413299329691/2302002382",
    // Rewarded ad · placement: unlocking a step-by-step guide.
    rewarded: "ca-app-pub-3738413299329691/3223745851",
};

const iosProductionIds = {
    banner: "ca-app-pub-3738413299329691/8371261218",
    interstitial: "ca-app-pub-3738413299329691/5665206824",
    // App-open ads are intentionally omitted on iOS to keep the experience lighter.
    appOpen: null,
    // Rewarded ad · placement: unlocking a step-by-step guide.
    rewarded: "ca-app-pub-3738413299329691/1308079288",
};

const productionIds = Platform.OS === "ios"
    ? iosProductionIds
    : androidProductionIds;
const useTestAds = Platform.OS !== "web"
    && (__DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true");

export const adsEnabled = Platform.OS === "android" || Platform.OS === "ios";

export const bannerId = useTestAds ? TestIds.ADAPTIVE_BANNER : productionIds.banner;
export const interstitialId = useTestAds ? TestIds.INTERSTITIAL : productionIds.interstitial;
export const appOpenId = Platform.OS === "android"
    ? (useTestAds ? TestIds.APP_OPEN : productionIds.appOpen)
    : null;
export const rewardedId = useTestAds ? TestIds.REWARDED : productionIds.rewarded || null;
export const guideAccessRequiresReward = adsEnabled && Boolean(rewardedId);
export const interstitialTriggerCount = Platform.OS === "ios" ? 10 : 6;
export const interstitialMinIntervalMs = Platform.OS === "ios"
    ? 5 * 60 * 1000
    : 2 * 60 * 1000;
