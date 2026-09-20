function isSpainRegion(regionCode) {
    return typeof regionCode === "string" && regionCode.trim().toUpperCase() === "ES";
}

module.exports = { isSpainRegion };
