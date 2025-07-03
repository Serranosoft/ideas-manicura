import { FlatList, StyleSheet, Text, View } from "react-native";
import { Link, Stack, useFocusEffect } from "expo-router";
import { ui } from "../src/utils/styles";
import LottieView from 'lottie-react-native';
import { useCallback, useContext, useState } from "react";
import { fetchDesigns } from "../src/utils/data";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { DataContext } from "../src/DataContext";
import { useLanguage } from "../src/utils/LanguageContext";
import Header from "../src/layout/header";


export default function List() {

    const [categories, setCategories] = useState([])
    const { setAdTrigger } = useContext(DataContext);
    const { language } = useLanguage();


    useFocusEffect(
        useCallback(() => {
            const aux_categories = fetchDesigns(language._locale);
            setCategories(aux_categories);
        }, [language])
    );

    return (
        <View style={styles.container} sharedTransitionTag="first">
            <Stack.Screen options={{ header: () => <Header title={language.t("_homeTitle")} /> }} /> 
            {
                categories.length > 0 ?
                    <View style={styles.list}>
                        <FlatList
                            contentContainerStyle={{ padding: 12 }}
                            data={categories}
                            numColumns={2}
                            initialNumToRender={6}
                            renderItem={({ item, i }) => {
                                return (
                                    <Animated.View key={i} style={styles.itemWrapper}>
                                        <Link asChild href={{ pathname: "/gallery", params: { name: item.name, title: item.title } }}>
                                            <Pressable onPress={() => setAdTrigger((adTrigger) => adTrigger + 1)}>
                                                <View style={styles.item}>
                                                    <Image transition={1000} style={styles.image} source={item.image} placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"} />
                                                    <View style={styles.info}>
                                                        <Text style={[ui.h3, ui.bold, { color: "#fff" }]}>{item.title}</Text>
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
        paddingTop: 16,
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
        height: 200,
        margin: 6,
    },

    item: {
        position: "relative",
        height: "100%",
    },

    info: {
        justifyContent: "center",
        alignItems: "center", 
        width: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8
    },

    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8
    }
})