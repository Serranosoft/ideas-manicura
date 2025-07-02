import { translations } from "./localizations";

export function fetchDesigns(acronym) {
    return [
        {
            title: translations[acronym]["_mirrorTitle"],
            name: "Efecto espejo",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1751487675/efecto-espejo/unas-efecto-espejo-16_caury2.jpg",
        },
        {
            title: translations[acronym]["_summerTitle"],
            name: "Verano",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1751374684/verano/unas-verano-55_bxfjg1.jpg",
        },
        {
            title: translations[acronym]["_flowersTitle"],
            name: "Flores",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363535/flores/jevgncj0qihfvbi837qg.jpg"
        },
        {
            title: translations[acronym]["_animalprintTitle"],
            name: "Animal print",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363051/animal-print/ftcpr4fnaokeuz1d5bio.jpg"
        },
        {
            title: translations[acronym]["_coquetteTitle"],
            name: "Coquette",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363390/coquette/n9xpt96ugucakxw67pey.jpg"
        },
        {
            title: translations[acronym]["_springTitle"],
            name: "Primavera",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710364057/primavera/kdxokdo9xt2ltwiip0yv.jpg"
        },
        {
            title: translations[acronym]["_frenchTitle"],
            name: "Francesas",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363622/francesas/mts9vdfvhg4xtwre2cpz.jpg"
        },
        {
            title: translations[acronym]["_simpleTitle"],
            name: "Sencillas",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710364218/sencillas/k6slzbwln6kbkuhtmusy.jpg"
        },
        {
            title: translations[acronym]["_marbledTitle"],
            name: "Marmoleadas",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1715888600/marmoladas/dtzfb8p5zpdv8zibo2he.jpg"
        },
        {
            title: translations[acronym]["_aestheticTitle"],
            name: "Aesthetic",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710276901/aesthetic/jpb3dilopmcqrpkw3zv1.jpg"
        },
        {
            title: translations[acronym]["_darkTitle"],
            name: "Oscuras",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1751374966/oscuras/unas-oscuras-19_qgsdcj.jpg"
        },
        {
            title: translations[acronym]["_babyboomerTitle"],
            name: "Baby boomer",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363147/baby-boomer/ghzzygukcieuwzrdjcul.jpg",
        },
        {
            title: translations[acronym]["_halloweenTitle"],
            name: "Halloween",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363697/halloween/pry8n817vhvbzngkrqpf.jpg"
        },
        {
            title: translations[acronym]["_christmasTitle"],
            name: "Navidad",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710363895/navidad/lcjbmkvkbxqfjzlbkkj8.jpg"
        },
        {
            title: translations[acronym]["_valentinesdayTitle"],
            name: "San Valentin",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1710364147/san-valentin/lox38wygcjmkjt5ecbam.jpg",
        },
        {
            title: translations[acronym]["_3dTitle"],
            name: "3d",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/v1751370453/3d/unas-3d-15_oawtyq.jpg"
        },
        {
            title: translations[acronym]["_matteTitle"],
            name: "Tono mate",
            image: "https://res.cloudinary.com/drzx6gruz/image/upload/tono-mate/cru9jhqxselnrbnlaqkv"
        }
    ]
}