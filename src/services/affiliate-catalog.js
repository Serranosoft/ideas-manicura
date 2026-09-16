import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createAffiliateCatalogRepository } from './affiliate-catalog-repository';
import { resolveAffiliateMarket } from '../domain/affiliate/market';

export const affiliateCatalog = createAffiliateCatalogRepository({
    storage: AsyncStorage,
    url: process.env.EXPO_PUBLIC_AFFILIATE_CATALOG_URL,
});

export function getDeviceAffiliateMarket() {
    return resolveAffiliateMarket(getLocales()[0]?.regionCode);
}

export async function getAffiliateProductsForDevice({ refresh = false } = {}) {
    const market = getDeviceAffiliateMarket();
    if (!market) return [];
    if (refresh) await affiliateCatalog.refresh();
    return affiliateCatalog.getProductsForMarket(market);
}
