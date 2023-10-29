import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataContext } from "../DataContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ui } from "../utils/styles";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
export default function Favorite({ image }) {

    const [isFavorite, setIsFavorite] = useState(false);
    const { favorites, setFavorites } = useContext(DataContext)
    const progress = useSharedValue(0);
    const colorChange = useAnimatedStyle(() => ({
        color: interpolateColor(progress.value, [0, 1], ['transparent', 'white']),
    }));

    // Al entrar, comprobar si es favorito o no.
    useEffect(() => {
        if (favorites) {
            setIsFavorite(favorites.includes(image));
        }
    }, [])

    // Al saber si es favorito, pintarlo o no
    useEffect(() => {
        progress.value = isFavorite ? withTiming(1, { duration: 0 }) : withTiming(0, { duration: 0 });
    }, [isFavorite])

    // Agrega o elimina favoritos del estado
    async function handleFavorite() {
        progress.value = withTiming(progress.value === 0 ? 1 : 0, { duration: 300 });
        if (!favorites.includes(image)) {
            setFavorites(favorites.concat(image))
            setIsFavorite(true);
        } else {
            let favoritesAux = [...favorites];
            favoritesAux.splice(favoritesAux.indexOf(image), 1)
            setFavorites(favoritesAux);
            setIsFavorite(false);
        }
    }

    // Cada vez que el estado se actualiza, llama a saveFavorite
    useEffect(() => {
        saveFavorite();
    }, [favorites])

    // Reemplaza el contenido de favoritos del storage con el nuevo array
    async function saveFavorite() {
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
    }

    return (
        <Pressable onPressIn={handleFavorite}>
            <View style={styles.favoriteWrapper}>
                
                <Text style={[ ui.text, { color: "#fff" } ]}>{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</Text>
                <AnimatedSvg viewBox="0 0 299.66333 300.23361" xmlns="http://www.w3.org/2000/svg" style={[styles.svg, colorChange]}>
                    <Path
                        d="M147.06 35.49l2.772 3.368 2.77-3.367c35.49-43.128 94.182-38.059 124.296 10.734 26.727 43.307 20.326 104.58-14.458 138.397L149.832 294.097 37.224 184.622C2.439 150.804-3.962 89.532 22.766 46.225 52.879-2.568 111.572-7.637 147.06 35.491z"
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="currentColor"
                        strokeWidth={12.2732}
                        strokeDasharray="none"
                        strokeOpacity={1}
                    />
                </AnimatedSvg>
            </View>
        </Pressable>
    )

}

const styles = StyleSheet.create({
    favoriteWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginRight: 4
    },
    svg: {
        width: 27,
        height: 27,
    },
})