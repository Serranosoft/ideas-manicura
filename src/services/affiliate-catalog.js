import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createAffiliateCatalogRepository } from "./affiliate-catalog-repository";
import { isSpainRegion } from "../domain/affiliate/market";

const DEFAULT_CATALOG_URL = "https://raw.githubusercontent.com/Serranosoft/ideas-manicura/master/affiliate-config/public/affiliate/v1/catalog.json";

export const affiliateCatalog = createAffiliateCatalogRepository({
    storage: AsyncStorage,
    url: process.env.EXPO_PUBLIC_AFFILIATE_CATALOG_URL || DEFAULT_CATALOG_URL,
});

export function isAffiliateAvailableForDevice() {
    return isSpainRegion(getLocales()[0]?.regionCode);
}

export async function getAffiliateProductsForDevice({ refresh = false } = {}) {
    if (!isAffiliateAvailableForDevice()) return [];
    if (refresh) await affiliateCatalog.refresh();
    return affiliateCatalog.getSpainProducts();
}
