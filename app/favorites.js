import { Link, Stack } from "expo-router"
import { FlatList, PixelRatio, Pressable, StyleSheet, Text, View } from "react-native"
import { useContext, useEffect, useState } from "react"
import { DataContext } from "../src/DataContext"
import { Image } from "expo-image";
import { useLanguage } from "../src/utils/LanguageContext"
import Header from "../src/layout/header";


const fontScale = PixelRatio.getFontScale();
const getFontSize = size => size / fontScale;


export default function Favorites() {

    const { language } = useLanguage();
    
    // Debo obtener todos los favoritos
    const { favorites } = useContext(DataContext);
    const [favoriteImages, setFavoriteImages] = useState([])

    useEffect(() => setFavoriteImages([...favorites]), [])

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={language.t("_myFavorites")} /> }} />
            {
                favoriteImages.length > 0 ?
                    <View style={styles.list}>
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 16 }}
                            data={favoriteImages}
                            numColumns={2}
                            initialNumToRender={6}
                            renderItem={({ item, i }) => {
                                return (
                                    <View key={i} style={styles.itemWrapper}>
                                        <Link asChild href={{ pathname: "/image", params: { image: item } }}>
                                            <Pressable style={styles.item}>
                                                <Image transition={1000} style={styles.image} source={item} placeholder={"L8FOP=~UKOxt$mI9IAbGBQw[%MRk"} />
                                            </Pressable>
                                        </Link>
                                    </View>
                                )
                            }}
                        />
                    </View>
                    :
                    <Text style={{ fontSize: getFontSize(27), textAlign: "center" }}>{language.t("_noFavorites")}</Text>

            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        alignItems: "center",
        justifyContent: "center"
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