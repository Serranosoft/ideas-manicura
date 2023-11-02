import { Link, Stack } from "expo-router"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import Header from "../src/components/header"
import { useContext, useEffect, useState } from "react"
import { DataContext } from "../src/DataContext"
import { Image } from "expo-image";

export default function Favorites() {

    // Debo obtener todos los favoritos
    const { favorites } = useContext(DataContext);
    const [favoriteImages, setFavoriteImages] = useState([])

    useEffect(() => {
        buildRoutes();
    }, [])

    function buildRoutes() {
        const urlSegment = "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/";
        const extension = ".jpg";

        let url = "";
        let arr = [];
        favorites.forEach(segment => {
            url = urlSegment + segment + extension;
            arr.push(url);
        })

        setFavoriteImages(arr);
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header title={"Mis diseños favoritos"} /> }} />
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
                    <Text style={{ fontSize: 27, textAlign: "center" }}>No tienes ningún diseño guardado en favoritos</Text>

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