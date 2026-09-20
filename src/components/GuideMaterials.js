import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { isHttpsUrl } from "../domain/affiliate/catalog-schema";
import {
    getAffiliateProductsForDevice,
    isAffiliateAvailableForDevice,
} from "../services/affiliate-catalog";
import { getGuideLabel } from "../utils/guides-data";
import { colors } from "../utils/styles";

function CheckIcon() {
    return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accentDark} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <Path d="m5 12 4 4L19 6" />
        </Svg>
    );
}

function ExternalLinkIcon() {
    return (
        <Svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </Svg>
    );
}

export default function GuideMaterials({ materials = [], copy, locale }) {
    const [affiliateEnabled] = useState(() => isAffiliateAvailableForDevice());
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(affiliateEnabled);
    const [openFailed, setOpenFailed] = useState(false);

    useEffect(() => {
        let active = true;
        if (!affiliateEnabled) return undefined;

        getAffiliateProductsForDevice()
            .then((nextProducts) => {
                if (!active) return;
                setProducts(nextProducts);
            })
            .catch(() => undefined)
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [affiliateEnabled]);

    const productsById = useMemo(
        () => new Map(products.map((entry) => [entry.productId, entry])),
        [products],
    );
    const hasAffiliateLinks = materials.some((item) => productsById.has(item.productId));

    async function openProduct(url) {
        setOpenFailed(false);
        try {
            if (!isHttpsUrl(url)) throw new Error("Invalid product URL");
            await Linking.openURL(url);
        } catch {
            setOpenFailed(true);
        }
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headingBlock}>
                <Text style={styles.eyebrow}>{copy.materialsShort}</Text>
                <Text style={styles.title}>{copy.materialsTitle}</Text>
                <Text style={styles.intro}>{copy.materialsIntro}</Text>
            </View>

            <View style={styles.listCard}>
                {materials.map((item, index) => {
                    const affiliate = productsById.get(item.productId);
                    return (
                        <View
                            key={item.id}
                            style={[styles.materialRow, index > 0 && styles.materialRowBorder]}
                        >
                            <View style={styles.checkWrap}>
                                <CheckIcon />
                            </View>
                            <View style={styles.materialCopy}>
                                <Text style={styles.materialName}>{getGuideLabel(item.name, locale)}</Text>
                                {affiliate && (
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {copy.affiliateProduct}: {affiliate.product.displayName}
                                    </Text>
                                )}
                            </View>
                            {affiliate && (
                                <TouchableOpacity
                                    style={styles.productButton}
                                    activeOpacity={0.8}
                                    accessibilityRole="link"
                                    accessibilityLabel={`${copy.viewProduct}: ${affiliate.product.displayName}`}
                                    onPress={() => openProduct(affiliate.offer.url)}
                                >
                                    <Text style={styles.productButtonText}>{copy.viewProduct}</Text>
                                    <ExternalLinkIcon />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>

            {loading && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={colors.accentDark} />
                </View>
            )}
            {openFailed && <Text style={styles.feedback}>{copy.openProductError}</Text>}
            {hasAffiliateLinks && <Text style={styles.disclosure}>{copy.affiliateDisclosure}</Text>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 18,
    },
    headingBlock: {
        paddingHorizontal: 4,
        marginBottom: 18,
    },
    eyebrow: {
        color: colors.accentDark,
        fontFamily: "ancizar-bold",
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        marginTop: 5,
        color: colors.textDark,
        fontFamily: "ancizar-bold",
        fontSize: 30,
        lineHeight: 35,
    },
    intro: {
        marginTop: 5,
        color: colors.textMuted,
        fontFamily: "ancizar-regular",
        fontSize: 16,
        lineHeight: 22,
    },
    listCard: {
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 22,
        backgroundColor: colors.cardBg,
    },
    materialRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        minHeight: 68,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    materialRowBorder: {
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
    },
    checkWrap: {
        width: 32,
        height: 32,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        backgroundColor: colors.badgeBg,
    },
    materialCopy: {
        flex: 1,
    },
    materialName: {
        color: colors.textDark,
        fontFamily: "ancizar-medium",
        fontSize: 15,
        lineHeight: 19,
    },
    productName: {
        marginTop: 3,
        color: colors.textMuted,
        fontFamily: "ancizar-regular",
        fontSize: 11,
        lineHeight: 14,
    },
    productButton: {
        maxWidth: 112,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 9,
        borderRadius: 18,
        backgroundColor: colors.accentDark,
    },
    productButtonText: {
        color: colors.white,
        fontFamily: "ancizar-bold",
        fontSize: 11,
        textAlign: "center",
    },
    loadingRow: {
        alignItems: "center",
        paddingTop: 16,
    },
    feedback: {
        marginTop: 14,
        paddingHorizontal: 4,
        color: colors.textMuted,
        fontFamily: "ancizar-regular",
        fontSize: 12,
        lineHeight: 17,
        textAlign: "center",
    },
    disclosure: {
        marginTop: 16,
        paddingHorizontal: 4,
        color: colors.textMuted,
        fontFamily: "ancizar-regular",
        fontSize: 11,
        lineHeight: 16,
        textAlign: "center",
    },
});
