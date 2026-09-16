const EUROPE = new Set('AD AL AT BA BE BG BY CH CY CZ DE DK EE FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA'.split(' '));
const AMERICAS = new Set('AG AI AR AW BB BL BM BO BQ BR BS BZ CA CL CO CR CU CW DM DO EC FK GD GF GL GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PM PR PY SR SV SX TC TT US UY VC VE VG VI'.split(' '));
const EAST = new Set('AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE'.split(' '));

function resolveAffiliateMarket(regionCode) {
    if (typeof regionCode !== 'string') return null;
    const country = regionCode.trim().toUpperCase();
    if (country === 'ES') return 'spain';
    if (EUROPE.has(country)) return 'europe';
    if (AMERICAS.has(country)) return 'americas';
    if (EAST.has(country)) return 'east';
    return null;
}

module.exports = { resolveAffiliateMarket };
