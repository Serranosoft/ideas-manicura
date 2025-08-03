import { FlatList, StyleSheet, View } from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import LottieView from 'lottie-react-native';
import { useContext, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { AdsContext } from "../src/DataContext";
import { bannerId } from "../src/utils/constants";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import Header from "../src/layout/header";

export default function gallery() {

    const params = useLocalSearchParams();
    const { name, title } = params;
    const [images, setImages] = useState([]);
    const { setAdTrigger, adsLoaded } = useContext(AdsContext);

    useEffect(() => {
        getImages();
    }, [])

    async function getImages() {
        let images = [];
        const response = await fetch(`https://mollydigital.manu-scholz.com/wp-json/custom/v1/media-filtered?app=diseno-de-unas&categoria=${name.toLowerCase().split(" ").join("-")}`);
        const json = await response.json();
        for (let image of json) {
            images.push(image.url)
        }
        setImages(images);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back={true} title={title} /> }} />
            { adsLoaded && <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} /> }
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