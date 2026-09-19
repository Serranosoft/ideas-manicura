import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState } from "react-native";
import MobileAds, {
    AdEventType,
    AdsConsent,
    AdsConsentPrivacyOptionsRequirementStatus,
    AppOpenAd,
    useInterstitialAd,
    useRewardedAd,
} from "react-native-google-mobile-ads";
import { adsEnabled, appOpenId, interstitialId, rewardedId } from "../utils/constants";

const APP_OPEN_EXPIRATION_MS = 4 * 60 * 60 * 1000;
const APP_OPEN_MIN_INTERVAL_MS = 4 * 60 * 1000;
const MIN_BACKGROUND_TIME_MS = 15 * 1000;
const INTERSTITIAL_MIN_INTERVAL_MS = 2 * 60 * 1000;
const AD_RETRY_DELAY_MS = 30 * 1000;

const AdsHandler = forwardRef((props, ref) => {
    const [consentResolved, setConsentResolved] = useState(false);
    const [requestNonPersonalizedAdsOnly, setRequestNonPersonalizedAdsOnly] =
        useState(true);
    const adRequestOptions = useMemo(
        () => ({ requestNonPersonalizedAdsOnly }),
        [requestNonPersonalizedAdsOnly]
    );
    const {
        isLoaded: isInterstitialLoaded,
        isClosed: isInterstitialClosed,
        isShowing: isInterstitialShowing,
        error: interstitialError,
        load: loadInterstitial,
        show: showInterstitial,
    } = useInterstitialAd(
        adsEnabled && consentResolved ? interstitialId : null,
        adRequestOptions
    );
    const {
        isLoaded: isRewardedLoaded,
        isClosed: isRewardedClosed,
        isShowing: isRewardedShowing,
        isEarnedReward,
        error: rewardedError,
        load: loadRewarded,
        show: showRewarded,
    } = useRewardedAd(
        adsEnabled && consentResolved && rewardedId ? rewardedId : null,
        adRequestOptions
    );

    const sdkStartedRef = useRef(false);
    const lastInterstitialShownAtRef = useRef(0);
    const lastAppOpenShownAtRef = useRef(0);
    const appOpenAdRef = useRef(null);
    const appOpenLoadedAtRef = useRef(0);
    const appOpenIsLoadingRef = useRef(false);
    const appOpenIsShowingRef = useRef(false);
    const currentAppStateRef = useRef(AppState.currentState);
    const backgroundStartedAtRef = useRef(0);
    const appOpenBlockedRef = useRef(props.appOpenBlocked);
    const showOpenAdRef = useRef(props.showOpenAd);
    const appOpenRetryTimeoutRef = useRef(null);
    const interstitialRetryTimeoutRef = useRef(null);
    const rewardedRetryTimeoutRef = useRef(null);
    const rewardedResolveRef = useRef(null);
    const rewardedEarnedRef = useRef(false);

    useEffect(() => {
        appOpenBlockedRef.current = props.appOpenBlocked;
    }, [props.appOpenBlocked]);

    useEffect(() => {
        showOpenAdRef.current = props.showOpenAd;
    }, [props.showOpenAd]);

    useEffect(() => {
        async function prepareAds() {
            if (!adsEnabled) return;

            try {
                await AdsConsent.requestInfoUpdate();
                const consentInfo = await AdsConsent.loadAndShowConsentFormIfRequired();
                updatePrivacyOptionsRequirement(consentInfo);
            } catch (error) {
                console.error("Consent gathering failed:", error);
                const consentInfo = await AdsConsent.getConsentInfo();
                updatePrivacyOptionsRequirement(consentInfo);
            }

            await updateAdRequestConsent();
            setConsentResolved(true);
        }

        prepareAds();
    }, []);

    useEffect(() => {
        if (!consentResolved) return;

        startGoogleMobileAdsSDK();
    }, [consentResolved]);

    function updatePrivacyOptionsRequirement(consentInfo) {
        props.setPrivacyOptionsRequired(
            consentInfo.privacyOptionsRequirementStatus ===
                AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
        );
    }

    async function updateAdRequestConsent() {
        let shouldRequestNonPersonalizedAds = true;

        try {
            const gdprApplies = await AdsConsent.getGdprApplies();

            if (!gdprApplies) {
                shouldRequestNonPersonalizedAds = false;
            } else {
                const {
                    createAPersonalisedAdsProfile,
                    selectPersonalisedAds,
                } = await AdsConsent.getUserChoices();

                shouldRequestNonPersonalizedAds = !(
                    createAPersonalisedAdsProfile && selectPersonalisedAds
                );
            }
        } catch (error) {
            console.error("Unable to read ad personalization consent:", error);
        }

        setRequestNonPersonalizedAdsOnly(shouldRequestNonPersonalizedAds);
        props.setRequestNonPersonalizedAdsOnly(shouldRequestNonPersonalizedAds);
    }

    async function startGoogleMobileAdsSDK() {
        const { canRequestAds } = await AdsConsent.getConsentInfo();
        if (!canRequestAds || sdkStartedRef.current) return;

        sdkStartedRef.current = true;
        await MobileAds().initialize();
        props.setAdsLoaded(true);
        loadAppOpenAd();
    }

    useEffect(() => {
        if (!props.adsLoaded) return;

        loadInterstitial();
        if (rewardedId) loadRewarded();
    }, [props.adsLoaded, loadInterstitial, loadRewarded]);

    useEffect(() => {
        props.setRewardedAdLoaded(Boolean(isRewardedLoaded));
    }, [isRewardedLoaded]);

    useEffect(() => {
        if (!sdkStartedRef.current) return;

        resetAppOpenAd();
        loadAppOpenAd();
    }, [requestNonPersonalizedAdsOnly]);

    useEffect(() => {
        if (isInterstitialClosed) {
            loadInterstitial();
        }
    }, [isInterstitialClosed, loadInterstitial]);

    useEffect(() => {
        if (!interstitialError) return;

        clearTimeout(interstitialRetryTimeoutRef.current);
        interstitialRetryTimeoutRef.current = setTimeout(
            loadInterstitial,
            AD_RETRY_DELAY_MS
        );

        return () => clearTimeout(interstitialRetryTimeoutRef.current);
    }, [interstitialError, loadInterstitial]);

    useEffect(() => {
        if (isEarnedReward) rewardedEarnedRef.current = true;
    }, [isEarnedReward]);

    useEffect(() => {
        if (!isRewardedClosed) return;

        completeRewardedRequest(rewardedEarnedRef.current ? "earned" : "dismissed");
        loadRewarded();
    }, [isRewardedClosed, loadRewarded]);

    useEffect(() => {
        if (!rewardedError) return;

        completeRewardedRequest("error");
        clearTimeout(rewardedRetryTimeoutRef.current);
        rewardedRetryTimeoutRef.current = setTimeout(
            loadRewarded,
            AD_RETRY_DELAY_MS
        );

        return () => clearTimeout(rewardedRetryTimeoutRef.current);
    }, [rewardedError, loadRewarded]);

    function completeRewardedRequest(status) {
        const resolve = rewardedResolveRef.current;
        rewardedResolveRef.current = null;
        rewardedEarnedRef.current = false;
        resolve?.({ status });
    }

    function tryShowRewardedAd() {
        if (!rewardedId) return Promise.resolve({ status: "not-configured" });
        if (!adsEnabled) return Promise.resolve({ status: "disabled" });
        if (rewardedResolveRef.current || isRewardedShowing) {
            return Promise.resolve({ status: "busy" });
        }
        if (!isRewardedLoaded || AppState.currentState !== "active") {
            if (!isRewardedLoaded) loadRewarded();
            return Promise.resolve({ status: "not-ready" });
        }

        rewardedEarnedRef.current = false;
        return new Promise((resolve) => {
            rewardedResolveRef.current = resolve;
            try {
                showRewarded();
            } catch {
                completeRewardedRequest("error");
                loadRewarded();
            }
        });
    }

    function tryShowInterstitialAd() {
        const enoughTimeHasPassed =
            Date.now() - lastInterstitialShownAtRef.current >= INTERSTITIAL_MIN_INTERVAL_MS;

        if (
            !isInterstitialLoaded ||
            isInterstitialShowing ||
            AppState.currentState !== "active" ||
            !enoughTimeHasPassed
        ) {
            if (!isInterstitialLoaded && !isInterstitialShowing) loadInterstitial();
            return false;
        }

        try {
            showInterstitial();
            lastInterstitialShownAtRef.current = Date.now();
            return true;
        } catch {
            loadInterstitial();
            return false;
        }
    }

    function isAppOpenFresh() {
        return (
            appOpenAdRef.current &&
            appOpenLoadedAtRef.current > 0 &&
            Date.now() - appOpenLoadedAtRef.current < APP_OPEN_EXPIRATION_MS
        );
    }

    function resetAppOpenAd() {
        appOpenAdRef.current?.removeAllListeners();
        appOpenAdRef.current = null;
        appOpenLoadedAtRef.current = 0;
        appOpenIsLoadingRef.current = false;
        appOpenIsShowingRef.current = false;
    }

    function loadAppOpenAd() {
        if (appOpenIsLoadingRef.current || isAppOpenFresh()) return;

        resetAppOpenAd();
        appOpenIsLoadingRef.current = true;
        const appOpenAd = AppOpenAd.createForAdRequest(
            appOpenId,
            adRequestOptions
        );
        appOpenAdRef.current = appOpenAd;

        appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
            appOpenIsLoadingRef.current = false;
            appOpenLoadedAtRef.current = Date.now();
        });
        appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
            appOpenIsShowingRef.current = true;
        });
        appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
            resetAppOpenAd();
            loadAppOpenAd();
        });
        appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
            resetAppOpenAd();
            clearTimeout(appOpenRetryTimeoutRef.current);
            appOpenRetryTimeoutRef.current = setTimeout(
                loadAppOpenAd,
                AD_RETRY_DELAY_MS
            );
        });
        appOpenAd.load();
    }

    function tryShowAppOpenAd() {
        if (!showOpenAdRef.current) {
            props.setShowOpenAd(true);
            return false;
        }

        const enoughTimeHasPassed =
            Date.now() - lastAppOpenShownAtRef.current >= APP_OPEN_MIN_INTERVAL_MS;

        if (
            appOpenBlockedRef.current ||
            appOpenIsShowingRef.current ||
            !isAppOpenFresh() ||
            !enoughTimeHasPassed
        ) {
            if (!isAppOpenFresh()) loadAppOpenAd();
            return false;
        }

        lastAppOpenShownAtRef.current = Date.now();
        appOpenIsShowingRef.current = true;
        appOpenAdRef.current.show().catch(() => {
            resetAppOpenAd();
            loadAppOpenAd();
        });
        return true;
    }

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            const previousAppState = currentAppStateRef.current;

            if (previousAppState === "active" && nextAppState !== "active") {
                backgroundStartedAtRef.current = Date.now();
            }

            if (previousAppState !== "active" && nextAppState === "active") {
                const backgroundDuration = Date.now() - backgroundStartedAtRef.current;
                if (props.adsLoaded && backgroundDuration >= MIN_BACKGROUND_TIME_MS) {
                    tryShowAppOpenAd();
                }
            }

            currentAppStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, [props.adsLoaded]);

    useEffect(() => {
        return () => {
            clearTimeout(appOpenRetryTimeoutRef.current);
            clearTimeout(interstitialRetryTimeoutRef.current);
            clearTimeout(rewardedRetryTimeoutRef.current);
            completeRewardedRequest("error");
            resetAppOpenAd();
        };
    }, []);

    useImperativeHandle(ref, () => ({
        loadInterstitialAd: loadInterstitial,
        tryShowInterstitialAd,
        tryShowRewardedAd,
        async showPrivacyOptionsForm() {
            const consentInfo = await AdsConsent.showPrivacyOptionsForm();
            updatePrivacyOptionsRequirement(consentInfo);
            await updateAdRequestConsent();
        },
    }));

    return null;
});

export default AdsHandler;
