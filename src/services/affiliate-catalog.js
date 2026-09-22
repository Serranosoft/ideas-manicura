import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createAffiliateCatalogRepository } from "./affiliate-catalog-repository";
import { getAffiliateMarket } from "../domain/affiliate/market";

const DEFAULT_CATALOG_URL = "https://raw.githubusercontent.com/Serranosoft/ideas-manicura/master/affiliate-config/public/affiliate/v2/catalog.json";

export const affiliateCatalog = createAffiliateCatalogRepository({
    storage: AsyncStorage,
    url: process.env.EXPO_PUBLIC_AFFILIATE_CATALOG_URL || DEFAULT_CATALOG_URL,
});

export function isAffiliateAvailableForDevice() {
    return getAffiliateMarket(getLocales()[0]?.regionCode) !== null;
}

export async function getAffiliateProductsForDevice({ refresh = false } = {}) {
    const market = getAffiliateMarket(getLocales()[0]?.regionCode);
    if (!market) return [];
    if (refresh) await affiliateCatalog.refresh();
    return affiliateCatalog.getProducts(market);
}
