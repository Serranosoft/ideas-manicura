import { FlatList, StyleSheet, Text, View } from "react-native";
import { Link, Stack } from "expo-router";
import { ui } from "../src/utils/styles";
import LottieView from 'lottie-react-native';
import { useMemo, useState } from "react";
import { categories_raw } from "../src/utils/data";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";

export default function List() {

    const [categories, setCategories] = useState([])
    useMemo(() => setCategories(categories_raw), [categories]);

    

    return (
        <View style={styles.container} sharedTransitionTag="first">
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.title}>
                <Text style={ui.h2}>Diseños para todas las temporadas</Text>
            </View>
            {
                categories.length > 0 ?
                    <View style={styles.list}>
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 16}}
                            data={categories}
                            numColumns={2}
                            initialNumToRender={6}
                            renderItem={({ item, i }) => {
                                return (
                                    <Animated.View key={i} style={styles.itemWrapper}>
                                        <Link asChild href={{ pathname: "/gallery", params: { name: item.name, qty: item.qty } }}>
                                            <Pressable>
                                                <View style={styles.item}>
                                                    <Image transition={1000} style={styles.image} source={item.image} placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"} />
                                                    <View style={styles.info}>
                                                        <Text style={[ui.h3, ui.bold, { color: "#fff" }]}>{item.name}</Text>
                                                    </View>
                                                </View>
                                            </Pressable>
                                        </Link>
                                    </Animated.View>
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
        paddingTop: 48,
        backgroundColor: "#fff",
    },

    title: {
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 24,
    },

    lottie: {
        width: "100%",
        aspectRatio: 1
    },

    list: {
        flex: 1,
        width: "100%",
    },

    itemWrapper: {
        flex: 1,
        height: 250,
        margin: 3,
    },

    item: {
        position: "relative",
        height: "100%",
    },

    info: {
        justifyContent: "center",
        alignItems: "center", 
        width: "100%",
        height: 85,
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    image: {
        width: "100%",
        height: "100%",
    }
})