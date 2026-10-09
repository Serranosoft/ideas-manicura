const WORDPRESS_UPLOADS = "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/09";
const WORDPRESS_UPLOADS_OCTOBER = "https://mollydigital.manu-scholz.com/wp-content/uploads/2026/10";

const localized = (es, en) => ({ es, en });

const material = (id, es, en, productId) => ({
    id,
    name: localized(es, en),
    ...(productId ? { productId } : {}),
});

const buildSteps = (prefix, definitions, uploadsBase = WORDPRESS_UPLOADS) => definitions.map(([
    imageNumber,
    instructionEs,
    instructionEn,
    toolEs,
    toolEn,
]) => ({
    image: `${uploadsBase}/${prefix}-${imageNumber}.jpg`,
    instruction: localized(instructionEs, instructionEn),
    tool: localized(toolEs, toolEn),
}));

export const guideCategories = [
    {
        id: "halloween",
        title: localized("Halloween", "Halloween"),
        cover: `${WORDPRESS_UPLOADS_OCTOBER}/halloween-calabaza-animada-7.jpg`,
        designs: [
            {
                id: "calabaza-animada",
                title: localized("Calabaza animada", "Animated pumpkin"),
                cover: `${WORDPRESS_UPLOADS_OCTOBER}/halloween-calabaza-animada-7.jpg`,
                filters: ["halloween"],
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Gel nude, naranja con glitter, blanco, negro y rosa", "Nude, orange glitter, white, black and pink gel", "painting_gel_biutee_12_colores"),
                    material("brushes", "Pincel liner, pincel fino y dotting tool", "Liner brush, fine detail brush and dotting tool", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("halloween-calabaza-animada", [
                    [1, "Sobre la base nude, dibuja una punta naranja con dos curvas que se unan en el centro.", "Over the nude base, paint an orange tip with two curves meeting in the centre.", "Pincel fino y gel naranja", "Fine brush and orange gel"],
                    [2, "Cubre la forma naranja con una capa uniforme de glitter y cura.", "Cover the orange shape with an even layer of glitter, then cure.", "Gel naranja con glitter y lámpara", "Orange glitter gel and lamp"],
                    [3, "Perfila la calabaza en negro y traza dos líneas curvas desde el centro hasta la punta.", "Outline the pumpkin in black and paint two curved lines from the centre to the tip.", "Pincel liner y gel negro", "Liner brush and black gel"],
                    [4, "Añade un pequeño tallo negro inclinado en la parte superior de la calabaza.", "Add a small angled black stem at the top of the pumpkin.", "Pincel de detalle y gel negro", "Detail brush and black gel"],
                    [5, "Modela la silueta blanca del fantasma sobre la calabaza, dejando una curva para la cabeza.", "Paint the white ghost silhouette above the pumpkin, shaping a rounded head.", "Pincel fino y gel blanco", "Fine brush and white gel"],
                    [6, "Completa los brazos del fantasma y coloca dos ojos negros ovalados.", "Complete the ghost's arms and add two oval black eyes.", "Pincel fino, dotting tool y gel negro", "Fine brush, dotting tool and black gel"],
                    [7, "Dibuja la boca y las mejillas rosas; añade estrellas y puntos blancos, cura y sella.", "Paint the mouth and pink cheeks; add white stars and dots, cure and seal.", "Pincel liner, dotting tool y top coat", "Liner brush, dotting tool and top coat"],
                ], WORDPRESS_UPLOADS_OCTOBER),
            },
            {
                id: "murcielagos",
                title: localized("Murciélagos", "Bats"),
                cover: `${WORDPRESS_UPLOADS_OCTOBER}/halloween-murcielagos-4.jpg`,
                filters: ["halloween"],
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Gel blanco y gel negro", "White gel and black gel", "gel_liner_aimeili_6_colores"),
                    material("brushes", "Pincel liner fino y dotting tool", "Fine liner brush and dotting tool", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("halloween-murcielagos", [
                    [1, "Aplica y cura una base blanca; coloca dos puntos negros separados para los cuerpos.", "Apply and cure a white base; add two separate black dots for the bodies.", "Dotting tool y gel negro", "Dotting tool and black gel"],
                    [2, "Desde cada cuerpo, traza dos líneas curvas para marcar la apertura de las alas.", "From each body, draw two curved lines to mark the wingspan.", "Pincel liner fino", "Fine liner brush"],
                    [3, "Dibuja el borde dentado de las alas y añade dos orejas pequeñas a cada murciélago.", "Draw the scalloped wing edges and add two small ears to each bat.", "Pincel liner fino", "Fine liner brush"],
                    [4, "Rellena las siluetas en negro, corrige el contorno, cura y sella el diseño.", "Fill the silhouettes in black, refine the outline, cure and seal the design.", "Pincel fino, lámpara y top coat", "Fine brush, lamp and top coat"],
                ], WORDPRESS_UPLOADS_OCTOBER),
            },
            {
                id: "sangre",
                title: localized("Efecto sangre", "Blood effect"),
                cover: `${WORDPRESS_UPLOADS_OCTOBER}/halloween-sangre-6.jpg`,
                filters: ["halloween"],
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Gel nude y gel rojo oscuro", "Nude gel and dark red gel", "painting_gel_biutee_12_colores"),
                    material("brushes", "Pincel liner y dotting tool", "Liner brush and dotting tool", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("halloween-sangre", [
                    [1, "Prepara la uña y aplica una primera capa fina de gel nude.", "Prep the nail and apply the first thin coat of nude gel.", "Gel nude y pincel del esmalte", "Nude gel and polish brush"],
                    [2, "Aplica una segunda capa para igualar el color y cura por completo.", "Apply a second coat to even out the colour and cure fully.", "Gel nude y lámpara UV/LED", "Nude gel and UV/LED lamp"],
                    [3, "Coloca varias gotas de gel rojo a distintas alturas cerca del borde superior.", "Place several drops of red gel at different heights near the upper edge.", "Dotting tool y gel rojo", "Dotting tool and red gel"],
                    [4, "Une cada gota con el borde de la uña y rellena la franja superior para crear el goteo.", "Join each drop to the nail edge and fill the upper band to create the drip effect.", "Pincel liner y gel rojo", "Liner brush and red gel"],
                    [5, "Suaviza las uniones y refuerza las gotas para que tengan un volumen uniforme.", "Smooth the joins and reinforce the drops so they have even volume.", "Pincel fino", "Fine detail brush"],
                    [6, "Deja nivelar el gel, cura el diseño y sella toda la uña con top coat.", "Let the gel self-level, cure the design and seal the whole nail with top coat.", "Lámpara UV/LED y top coat", "UV/LED lamp and top coat"],
                ], WORDPRESS_UPLOADS_OCTOBER),
            },
            {
                id: "telarana",
                title: localized("Telaraña brillante", "Glitter spiderweb"),
                cover: `${WORDPRESS_UPLOADS_OCTOBER}/halloween-telarana-7.jpg`,
                filters: ["halloween"],
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Gel nude y gel negro", "Nude gel and black gel", "painting_gel_biutee_12_colores"),
                    material("glitter", "Gel liner o glitter plateado fino", "Silver liner gel or fine silver glitter", "gel_liner_aimeili_6_colores"),
                    material("brushes", "Pincel liner extrafino", "Extra-fine liner brush", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("halloween-telarana", [
                    [1, "Sobre la base nude, elige una esquina y traza tres líneas radiales largas.", "Over the nude base, choose one corner and draw three long radial lines.", "Pincel liner y gel negro", "Liner brush and black gel"],
                    [2, "Añade una cuarta guía hacia el lateral para completar la estructura de la telaraña.", "Add a fourth guide toward the side to complete the web structure.", "Pincel liner fino", "Fine liner brush"],
                    [3, "Une las primeras guías con arcos cortos y curvados cerca del punto de origen.", "Join the first guides with short curved arcs near the starting point.", "Pincel liner extrafino", "Extra-fine liner brush"],
                    [4, "Continúa los arcos hacia el centro manteniendo una separación regular.", "Continue the arcs toward the centre, keeping their spacing even.", "Pincel liner extrafino", "Extra-fine liner brush"],
                    [5, "Completa las uniones hasta el extremo derecho y el borde inferior.", "Complete the joins up to the right edge and lower border.", "Pincel liner extrafino", "Extra-fine liner brush"],
                    [6, "Repasa las líneas para igualar el grosor y corrige cualquier unión irregular.", "Go over the lines to even out their thickness and refine any uneven joins.", "Pincel liner y gel negro", "Liner brush and black gel"],
                    [7, "Cubre la telaraña con glitter plateado fino, cura y sella sin invadir la base nude.", "Cover the web with fine silver glitter, cure and seal without flooding the nude base.", "Glitter plateado, lámpara y top coat", "Silver glitter, lamp and top coat"],
                ], WORDPRESS_UPLOADS_OCTOBER),
            },
        ],
    },
    {
        id: "babyboomer",
        title: localized("Baby Boomer", "Baby Boomer"),
        cover: `${WORDPRESS_UPLOADS}/baby-boomer-8.jpg`,
        designs: [
            {
                id: "sencillas",
                title: localized("Sencillas", "Simple"),
                cover: `${WORDPRESS_UPLOADS}/baby-boomer-8.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Esmaltes rosa translúcido y blanco lechoso", "Sheer pink and milky white polish", "set_baby_boomer_vishine"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                    material("files", "Lima fina o buffer", "Fine file or buffer", "set_limas_multigrano"),
                    material("brushes", "Pincel para degradado u ombré", "Gradient or ombré brush", "pinceles_nail_art_sularpek"),
                    material("wipes", "Toallitas sin pelusa y limpiador", "Lint-free wipes and cleanser", "cleaner_celulosas_nail"),
                ],
                steps: buildSteps("baby-boomer", [
                    [1, "Da forma a la uña y elimina el brillo de la superficie con movimientos suaves.", "Shape the nail and gently remove the surface shine.", "Lima fina o buffer", "Fine file or buffer"],
                    [2, "Aplica una capa fina de base transparente sin tocar la cutícula y cura.", "Apply a thin clear base coat without touching the cuticle, then cure.", "Pincel del esmalte y lámpara UV/LED", "Polish brush and UV/LED lamp"],
                    [3, "Extiende el tono rosa lechoso desde la cutícula hacia el centro, dejando la punta más ligera.", "Brush the milky pink shade from the cuticle toward the centre, keeping the tip lighter.", "Esmalte rosa translúcido y pincel", "Sheer pink polish and brush"],
                    [4, "Deposita blanco lechoso en el borde libre, concentrando el color en la punta.", "Apply milky white to the free edge, concentrating the colour at the tip.", "Esmalte blanco lechoso y pincel", "Milky white polish and brush"],
                    [5, "Difumina la unión entre el blanco y el rosa con toques cortos hacia el centro.", "Blend the white into the pink with short strokes toward the centre.", "Pincel degradado u ombré", "Gradient or ombré brush"],
                    [6, "Cura el degradado y comprueba que la transición sea suave; repite una capa fina si necesita cobertura.", "Cure the gradient and check that the transition is smooth; add one thin coat if more coverage is needed.", "Lámpara UV/LED", "UV/LED lamp"],
                    [7, "Perfecciona los laterales y el borde libre para recuperar una forma limpia y uniforme.", "Refine the sidewalls and free edge to restore a clean, even shape.", "Lima fina", "Fine nail file"],
                    [8, "Sella toda la uña y el borde libre para aportar brillo y proteger el degradado.", "Seal the whole nail and free edge to add shine and protect the gradient.", "Top coat y pincel", "Top coat and brush"],
                ]),
            },
        ],
    },
    {
        id: "flores",
        title: localized("Flores", "Flowers"),
        cover: `${WORDPRESS_UPLOADS}/flores-margarita-6.jpg`,
        designs: [
            {
                id: "margarita",
                title: localized("Margarita", "Daisy"),
                cover: `${WORDPRESS_UPLOADS}/flores-margarita-6.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("colors", "Gel blanco y gel amarillo", "White gel and yellow gel", "painting_gel_biutee_12_colores"),
                    material("brushes", "Pincel liner, pincel de detalle y dotting tool", "Liner brush, detail brush, and dotting tool", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("flores-margarita", [
                    [1, "Marca cuatro líneas finas en forma de cruz para repartir los primeros pétalos.", "Paint four fine guide lines in a cross to space the first petals.", "Pincel liner fino y gel blanco", "Fine liner brush and white gel"],
                    [2, "Añade cuatro líneas diagonales para completar ocho guías alrededor del centro.", "Add four diagonal lines to create eight evenly spaced guides around the centre.", "Pincel liner fino", "Fine liner brush"],
                    [3, "Deposita una gota de gel blanco en el extremo exterior de cada guía.", "Place a drop of white gel at the outer end of every guide.", "Punzón o dotting tool", "Dotting tool"],
                    [4, "Arrastra una de las gotas hacia el centro para convertirla en un pétalo alargado.", "Drag one drop toward the centre to turn it into an elongated petal.", "Pincel fino de detalle", "Fine detail brush"],
                    [5, "Repite el arrastre en las ocho gotas procurando que todos los pétalos terminen en el mismo centro.", "Repeat on all eight drops, making every petal meet at the same centre point.", "Pincel fino de detalle", "Fine detail brush"],
                    [6, "Coloca un punto amarillo en el centro, cura el diseño y séllalo.", "Add a yellow dot in the centre, cure the design and seal it.", "Dotting tool, gel amarillo y top coat", "Dotting tool, yellow gel and top coat"],
                ]),
            },
            {
                id: "relieve",
                title: localized("Flores en relieve", "Embossed flowers"),
                cover: `${WORDPRESS_UPLOADS}/relieve-6.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("pearly-gel", "Gel rosa nacarado", "Pearly pink gel", "gel_nacarado_rosalind_6_colores"),
                    material("3d-gel", "Gel 3D para modelar", "3D sculpting gel", "gel_3d_sularpek"),
                    material("silicone-brush", "Pincel de silicona o pincel para gel 3D", "Silicone tool or 3D gel brush", "pinceles_silicona_hanyousheng"),
                    material("brushes", "Pincel fino, espátula y dotting tool", "Fine brush, spatula, and dotting tool", "pinceles_nail_art_sularpek"),
                    material("strass", "Microperlas doradas y lápiz de cera", "Gold microbeads and wax pencil", "strass_beadsland_dorado"),
                    material("gem-glue", "Gel adhesivo para gemas", "Gem adhesive gel", "pegamento_strass_makartt"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("relieve", [
                    [1, "Coloca cinco perlas iguales de gel 3D formando un círculo y dejando libre el centro.", "Place five equal beads of 3D gel in a circle, leaving the centre clear.", "Gel 3D y espátula o dotting tool", "3D gel and spatula or dotting tool"],
                    [2, "Presiona y estira la primera perla desde el centro hacia fuera para formar un pétalo con relieve.", "Press and pull the first bead outward from the centre to shape a raised petal.", "Pincel de silicona o pincel para gel 3D", "Silicone tool or 3D gel brush"],
                    [4, "Modela las cuatro perlas restantes y marca una hendidura central en cada pétalo.", "Shape the remaining four beads and press a centre groove into every petal.", "Pincel de silicona o pincel para gel 3D", "Silicone tool or 3D gel brush"],
                    [5, "Añade un toque rosa nacarado dentro de cada pétalo para dar profundidad.", "Add a pearly pink accent inside every petal to create depth.", "Pincel fino y gel nacarado", "Fine brush and pearly gel"],
                    [6, "Fija tres microperlas doradas en el centro, cura y sella solo alrededor para conservar el relieve.", "Fix three gold microbeads in the centre, cure, and seal only around them to preserve the texture.", "Lápiz de cera, gel para gemas y lámpara", "Wax pencil, gem gel and lamp"],
                ]),
            },
        ],
    },
    {
        id: "lazos",
        title: localized("Lazos", "Bows"),
        cover: `${WORDPRESS_UPLOADS}/lazos-relleno-3.jpg`,
        designs: [
            {
                id: "oscuro",
                title: localized("Lazo oscuro", "Dark bow"),
                cover: `${WORDPRESS_UPLOADS}/lazos-oscuro-4.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("gels", "Gel negro y dorado para luces y sombras", "Black and gold gel for highlights and shadows", "gel_liner_aimeili_6_colores"),
                    material("brushes", "Pincel liner, pincel fino y dotting tool", "Liner brush, fine brush, and dotting tool", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("lazos-oscuro", [
                    [6, "Marca el centro del lazo y cuatro puntos exteriores para mantener la composición simétrica.", "Mark the bow centre and four outer points to keep the design symmetrical.", "Dotting tool y gel negro", "Dotting tool and black gel"],
                    [2, "Une los puntos con líneas curvas para dibujar el contorno de las dos lazadas superiores.", "Join the dots with curved lines to outline the two upper loops.", "Pincel liner fino", "Fine liner brush"],
                    [3, "Rellena las lazadas en negro y dibuja las dos cintas largas desde el centro hacia la punta.", "Fill the loops in black and paint the two long tails from the centre toward the tip.", "Pincel fino y gel negro", "Fine brush and black gel"],
                    [5, "Cubre la silueta del lazo con una capa uniforme de gel dorado y cura.", "Cover the bow shape with an even layer of gold gel, then cure.", "Pincel fino y gel dorado", "Fine brush and gold gel"],
                    [1, "Añade los detalles interiores negros, refuerza el centro y sella el diseño completo.", "Add the black inner details, reinforce the centre and seal the complete design.", "Pincel liner, dotting tool y top coat", "Liner brush, dotting tool and top coat"],
                    [4, "Traza líneas finas más oscuras sobre el dorado para marcar los pliegues y el volumen.", "Paint fine darker lines over the gold to define folds and volume.", "Pincel liner y gel oscuro", "Liner brush and dark gel"],
                ]),
            },
            {
                id: "relleno",
                title: localized("Lazo relleno", "Filled bow"),
                cover: `${WORDPRESS_UPLOADS}/lazos-relleno-3.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("gels", "Gel rojo, negro y blanco para crear luces y sombras", "Red, black, and white gel for highlights and shadows", "painting_gel_biutee_12_colores"),
                    material("brushes", "Pincel liner y pincel fino de detalle", "Liner brush and fine detail brush", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("lazos-relleno", [
                    [1, "Dibuja el centro y el contorno de las dos lazadas superiores con líneas finas.", "Draw the centre and outline the two upper loops with fine lines.", "Pincel liner y gel rojo", "Liner brush and red gel"],
                    [2, "Añade una curva interior debajo de cada lazada para definir el pliegue inferior.", "Add an inner curve beneath each loop to define its lower fold.", "Pincel liner fino", "Fine liner brush"],
                    [5, "Desde el centro, dibuja las dos cintas largas y afina sus extremos hacia la punta.", "Draw the two long tails from the centre and taper their ends toward the tip.", "Pincel liner fino", "Fine liner brush"],
                    [4, "Rellena todo el lazo con rojo procurando conservar un contorno limpio.", "Fill the entire bow with red while keeping a clean outline.", "Pincel fino y gel rojo", "Fine brush and red gel"],
                    [6, "Añade sombras rojas más profundas en los bordes interiores para crear volumen.", "Add deeper red shading along the inner edges to create volume.", "Pincel de detalle y gel rojo oscuro", "Detail brush and dark red gel"],
                    [3, "Dibuja reflejos blancos en lazadas, centro y cintas; cura y sella el resultado.", "Paint white highlights on the loops, centre and tails; cure and seal the result.", "Pincel liner ultrafino, gel blanco y top coat", "Ultra-fine liner, white gel and top coat"],
                ]),
            },
        ],
    },
    {
        id: "francesas",
        title: localized("Francesas", "French manicures"),
        cover: `${WORDPRESS_UPLOADS}/francesas-cuadradas-4.jpg`,
        designs: [
            {
                id: "cuadradas",
                title: localized("Francesas cuadradas", "Square French manicure"),
                cover: `${WORDPRESS_UPLOADS}/francesas-cuadradas-4.jpg`,
                materials: [
                    material("kit", "Base y top coat", "Base coat and top coat", "kit_semipermanente_jodsone_36_piezas"),
                    material("white-gel", "Gel blanco", "White gel", "gel_liner_aimeili_6_colores"),
                    material("files", "Lima para dar forma cuadrada", "File for shaping a square nail", "set_limas_multigrano"),
                    material("brushes", "Pincel liner y pincel plano fino", "Liner brush and small flat brush", "pinceles_nail_art_sularpek"),
                    material("lamp", "Lámpara UV/LED", "UV/LED lamp", "lampara_uv_led_sunuv"),
                ],
                steps: buildSteps("francesas-cuadradas", [
                    [1, "Traza una línea horizontal fina a la altura donde quieres que empiece la punta francesa.", "Paint a thin horizontal line where you want the French tip to begin.", "Pincel liner y gel blanco", "Liner brush and white gel"],
                    [2, "Dibuja una diagonal desde un lateral de la uña hasta cruzar la línea guía.", "Draw a diagonal from one side of the nail across the guide line.", "Pincel liner fino", "Fine liner brush"],
                    [3, "Repite la diagonal desde el lado contrario para formar una V simétrica.", "Repeat the diagonal from the opposite side to form a symmetrical V.", "Pincel liner fino", "Fine liner brush"],
                    [4, "Rellena de blanco el exterior de la V, corrige los bordes, cura y sella.", "Fill the area outside the V in white, refine the edges, cure and seal.", "Pincel plano fino, gel blanco y top coat", "Small flat brush, white gel and top coat"],
                ]),
            },
        ],
    },
];

const guideCopy = {
    es: {
        navGuides: "Guías",
        guidesTitle: "Guías paso a paso",
        guidesBadge: "APRENDE Y CREA",
        chooseCategory: "Elige una categoría",
        filterAll: "Todos",
        filterHalloween: "Halloween",
        noFilteredGuides: "Todavía no hay tutoriales en este filtro.",
        designsTitle: "Diseños",
        design: "diseño",
        designs: "diseños",
        step: "Paso",
        steps: "pasos",
        whatToDo: "Qué hacer",
        tool: "Herramienta o material",
        materialsTitle: "Qué necesitas",
        materialsIntro: "Prepara estos materiales antes de empezar.",
        materialsShort: "Materiales",
        startGuide: "Empezar guía",
        viewProduct: "Ver en Amazon",
        affiliateProduct: "Producto recomendado",
        affiliateDisclosure: "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables. No necesitas comprar nada para seguir esta guía.",
        openProductError: "No se pudo abrir el producto.",
        previous: "Anterior",
        next: "Siguiente",
        finish: "Terminar",
        watchAd: "Ver anuncio",
        unlocked: "Desbloqueada",
        unlockTitle: "Desbloquear guía",
        unlockMessage: "Mira un anuncio completo para desbloquear «%{guide}» durante 24 horas.",
        rewardAccess: "Acceso durante 24 horas",
        close: "Cerrar",
        adNotReadyTitle: "El anuncio se está preparando",
        adNotReadyMessage: "Espera unos segundos y vuelve a tocar la guía.",
        adUnavailableTitle: "Anuncio no disponible",
        adUnavailableMessage: "Esta guía necesita un anuncio recompensado, pero todavía no está configurado.",
        adErrorTitle: "No se pudo mostrar el anuncio",
        adErrorMessage: "Comprueba tu conexión e inténtalo de nuevo.",
    },
    en: {
        navGuides: "Guides",
        guidesTitle: "Step-by-step guides",
        guidesBadge: "LEARN AND CREATE",
        chooseCategory: "Choose a category",
        filterAll: "All",
        filterHalloween: "Halloween",
        noFilteredGuides: "There are no tutorials in this filter yet.",
        designsTitle: "Designs",
        design: "design",
        designs: "designs",
        step: "Step",
        steps: "steps",
        whatToDo: "What to do",
        tool: "Tool or material",
        materialsTitle: "What you need",
        materialsIntro: "Get these materials ready before you begin.",
        materialsShort: "Materials",
        startGuide: "Start guide",
        viewProduct: "View on Amazon",
        affiliateProduct: "Recommended product",
        affiliateDisclosure: "As an Amazon Associate I earn from qualifying purchases. You do not need to buy anything to follow this guide.",
        openProductError: "The product could not be opened.",
        previous: "Previous",
        next: "Next",
        finish: "Finish",
        watchAd: "Watch ad",
        unlocked: "Unlocked",
        unlockTitle: "Unlock guide",
        unlockMessage: "Watch one complete ad to unlock “%{guide}” for 24 hours.",
        rewardAccess: "24-hour access",
        close: "Close",
        adNotReadyTitle: "The ad is getting ready",
        adNotReadyMessage: "Wait a few seconds and tap the guide again.",
        adUnavailableTitle: "Ad unavailable",
        adUnavailableMessage: "This guide requires a rewarded ad, but it has not been configured yet.",
        adErrorTitle: "The ad could not be shown",
        adErrorMessage: "Check your connection and try again.",
    },
};

export function getGuideCopy(locale) {
    return String(locale || "es").toLowerCase().startsWith("es")
        ? guideCopy.es
        : guideCopy.en;
}

export function getGuideLabel(value, locale) {
    return value?.[String(locale || "es").toLowerCase().startsWith("es") ? "es" : "en"]
        || value?.es
        || "";
}

export function getGuideCategory(categoryId) {
    return guideCategories.find((category) => category.id === categoryId);
}

export function guideMatchesFilter(design, filterId) {
    return !filterId
        || filterId === "all"
        || (Array.isArray(design?.filters) && design.filters.includes(filterId));
}

export function getGuideDesign(categoryId, designId) {
    return getGuideCategory(categoryId)?.designs.find((design) => design.id === designId);
}
