const IOS_GOOGLE_MOBILE_ADS_TEST_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => {
    // The native SDK requires an iOS app ID even when ads are disabled. The
    // sample ID is safe and the JS layer stays disabled in production until
    // the iOS app ID and the three ad-unit environment variables are configured.
    const iosAppId =
        process.env.EXPO_PUBLIC_IOS_ADMOB_APP_ID || IOS_GOOGLE_MOBILE_ADS_TEST_APP_ID;

    return {
        ...config,
        plugins: config.plugins.map((plugin) => {
            if (!Array.isArray(plugin) || plugin[0] !== "react-native-google-mobile-ads") {
                return plugin;
            }

            return [
                plugin[0],
                {
                    ...plugin[1],
                    iosAppId,
                },
            ];
        }),
    };
};
