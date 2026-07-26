import { FlatList, StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image } from "expo-image";
import { AdsContext } from "../src/DataContext";
import { colors } from "../src/utils/styles";
import Header from "../src/layout/header";

export default function Gallery() {
    const params = useLocalSearchParams();
    const { name, title } = params;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setAdTrigger } = useContext(AdsContext);

    useEffect(() => {
        getImages();
    }, [name]);

    async function getImages() {
        try {
            setLoading(true);
            const categoryParam = name ? name.toLowerCase().split(" ").join("-") : "";
            const response = await fetch(`https://mollydigital.manu-scholz.com/wp-json/custom/v1/media-filtered?app=diseno-de-unas&categoria=${categoryParam}`);
            const json = await response.json();
            let urls = [];
            if (Array.isArray(json)) {
                for (let image of json) {
                    urls.push(image.url);
                }
            }
            setImages(urls);
        } catch (error) {
            console.log("Error loading gallery images:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header back={true} title={title || "Diseños"} /> }} />
            
            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <View style={styles.list}>
                    <FlatList
                        contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
                        data={images}
                        numColumns={2}
                        initialNumToRender={8}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, idx) => `${item}-${idx}`}
                        renderItem={({ item }) => {
                            return (
                                <View style={styles.itemWrapper}>
                                    <Link asChild href={{ pathname: "/image", params: { image: item } }}>
                                        <Pressable
                                            style={styles.item}
                                            onPress={() => {
                                                setAdTrigger((adTrigger) => adTrigger + 1);
                                            }}
                                        >
                                            <Image
                                                transition={500}
                                                style={styles.image}
                                                source={item}
                                                placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"}
                                            />
                                        </Pressable>
                                    </Link>
                                </View>
                            );
                        }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loaderBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    list: {
        flex: 1,
        width: "100%",
    },
    itemWrapper: {
        flex: 1,
        height: 190,
        margin: 6,
    },
    item: {
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.cardBg,
        elevation: 2,
        shadowColor: "#2C221E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    image: {
        width: "100%",
        height: "100%",
    },
});