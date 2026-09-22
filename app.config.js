const IOS_GOOGLE_MOBILE_ADS_TEST_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => {
    // The native SDK is included for Android and requires an iOS app ID even
    // though ads are disabled there. Always use Google's sample ID on iOS so
    // an environment variable cannot accidentally enable a production app ID.
    const iosAppId = IOS_GOOGLE_MOBILE_ADS_TEST_APP_ID;

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
