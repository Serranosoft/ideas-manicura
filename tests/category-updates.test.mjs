import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/utils/category-updates.js", import.meta.url), "utf8");
const { applyCategoryUpdates, CATEGORY_UPDATE_SINCE } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("marca solo las categorías con subidas y conserva los datos de las tarjetas", () => {
    const categories = [
        { name: "Cat eye", title: "Cat eye", image: "cover.jpg" },
        { name: "Efecto metal", title: "Metal" },
        { name: "Flores", title: "Flowers" },
        { name: "San Valentin", title: "Valentine" },
    ];
    const result = applyCategoryUpdates(categories, { categories: [
        { category: "cat-eye", count: 2 },
        { category: "efecto-metal", count: 150 },
        { category: "san-valentin", count: 1 },
    ] });
    assert.deepEqual(result.map((item) => item.isNew), [true, true, false, true]);
    assert.equal(result[0].image, "cover.jpg");
    assert.equal(result[2].title, "Flowers");
    assert.equal(categories[0].isNew, undefined);
});

test("sin subidas o con una respuesta inválida no añade novedades", () => {
    const categories = [{ name: "Flores", isNew: true }];
    for (const payload of [null, {}, { categories: {} }, { categories: [null, {},
        { category: "flores", count: 0 }, { category: "flores", count: -1 },
        { category: "flores", count: "4" }, { category: "flores", count: 1.5 },
    ] }]) {
        assert.equal(applyCategoryUpdates(categories, payload)[0].isNew, false);
    }
});

test("el periodo empieza a medianoche del 29 de septiembre en Madrid", () => {
    assert.equal(CATEGORY_UPDATE_SINCE, "2026-09-28T22:00:00Z");
    const start = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "medium", hourCycle: "h23",
    }).format(new Date(CATEGORY_UPDATE_SINCE));
    assert.equal(start, "29/09/2026, 00:00:00");
});
