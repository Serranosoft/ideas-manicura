import { TestIds } from "react-native-google-mobile-ads";
import { Platform } from "react-native";

const androidProductionIds = {
    banner: "ca-app-pub-3738413299329691/9492904106",
    interstitial: "ca-app-pub-3738413299329691/4108144669",
    appOpen: "ca-app-pub-3738413299329691/2302002382",
    // Rewarded ad · placement: unlocking a step-by-step guide.
    rewarded: "ca-app-pub-3738413299329691/3223745851",
};

const productionIds = Platform.OS === "ios" ? {} : androidProductionIds;
const useTestAds = Platform.OS !== "ios"
    && (__DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true");

// iOS is intentionally ad-free for now, including development builds. Keeping
// this policy here prevents the consent flow and every ad format from starting.
export const adsEnabled = Platform.OS !== "ios";

export const bannerId = useTestAds ? TestIds.ADAPTIVE_BANNER : productionIds.banner;
export const interstitialId = useTestAds ? TestIds.INTERSTITIAL : productionIds.interstitial;
export const appOpenId = useTestAds ? TestIds.APP_OPEN : productionIds.appOpen;
export const rewardedId = useTestAds ? TestIds.REWARDED : productionIds.rewarded || null;
export const guideAccessRequiresReward = adsEnabled && Boolean(rewardedId);
