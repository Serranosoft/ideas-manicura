export const categories_raw = [
    {
        name: "Halloween",
        qty: 23,
        image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-halloween-11.jpg",
    },
    {
        name: "Baby boomer",
        qty: 10,
        image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-baby-boomer-9.jpg",
    },
    {
        name: "Marmoladas",
        qty: 3,
        image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-marmoladas-2.jpg",
    },
    {
        name: "San Valentin",
        qty: 1,
        image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-san-valentin-1.jpg",
    },
    {
        name: "Verano",
        qty: 6,
        image: "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-verano-4.jpg",
    },
]

export async function fetchImages(category, length) {
    const images = [];
    let result = "";
    
    const urlSegment = "https://mollydigital.manu-scholz.com/wp-content/uploads/2023/10/unas-"
    const patternWithoutÑ = category.replace("ñ", "n");
    const pattern = patternWithoutÑ.replace(/ /g, '-').toLowerCase();  

    for (let i = 1; i <= length; i++) {
        result = urlSegment + pattern + "-" + i +".jpg"
        images.push(result);
    }

    return images;
}