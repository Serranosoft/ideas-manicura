import { FlatList, StyleSheet, View } from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import LottieView from 'lottie-react-native';
import { useContext, useEffect, useState } from "react";
import { fetchImages } from "../src/utils/data";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import Header from "../src/components/header";
import { getNotificationInfo, scheduleWeeklyNotification } from "../src/utils/notifications";
import { DataContext } from "../src/DataContext";
import { bannerId } from "../src/utils/constants";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

export default function gallery() {

    const params = useLocalSearchParams();
    const { name, qty } = params;
    const [images, setImages] = useState([]);
    const { setAdTrigger } = useContext(DataContext);

    useEffect(() => {
        if (images.length < 1) {
            fetchImages(name, qty).then((result) => setImages(result));
        }
    }, [])

    useEffect(() => {
        scheduleWeeklyNotification();
        getNotificationInfo();
    }, [])

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={`Diseño de uñas de ${name}`} /> }} />
            <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
            {
                images.length > 0 ?
                    <View style={styles.list}>
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 16 }}
                            data={images}
                            numColumns={2}
                            initialNumToRender={8}
                            renderItem={({ item, i }) => {
                                return (
                                    <View key={i} style={styles.itemWrapper}>
                                        <Link asChild href={{ pathname: "/image", params: { image: item } }}>
                                            <Pressable style={styles.item} onPress={() => {
                                                setAdTrigger((adTrigger) => adTrigger + 1);
                                            }}>
                                                <Image transition={1000} style={styles.image} source={item} placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"} />
                                            </Pressable>
                                        </Link>
                                    </View>
                                )
                            }}
                        />
                    </View>
                    :
                    <LottieView source={require("../assets/lottie/loading-animation.json")} loop={true} autoPlay={true} />

            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        alignItems: "center",
    },

    title: {
        gap: 2,
    },
    list: {
        flex: 1,
        width: "100%",
    },

    itemWrapper: {
        flex: 1,
        height: 200,
        margin: 5,
    },

    item: {
        position: "relative",
        height: "100%",
    },

    image: {
        width: "100%",
        height: "100%",
    }

})