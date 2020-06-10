const got = require("got").default;
const cheerio = require('cheerio')
const fs = require('fs').promises;

const seasons = {
    1: 22,
    2: 24,
    3: 24,
    4: 16,
    5: 24,
    6: 22,
    7: 23,
    8: 22,
};

async function main() {
    // const res = await getEpisode(35);
    // console.log(res);
    const ids = getSeasonIds(5);
    console.log(await getEpisode(ids[12]));
    // await getSeasonHtml(2);
}

async function getEpisode(id) {
    const res = await got.post("https://watchhouseonline.net/wp-admin/admin-ajax.php", {
        form: {
            action: "doo_player_ajax",
            post: id,
            nume: 1,
            type: "tv",
        }
    }).text();
    const $ = cheerio.load(res);
    const arr = $('iframe').attr('src').split('/');
    const tmpId = arr[arr.length - 1];
    const oFinal = await got.post(`https://zidiplay.com/api/source/${tmpId}`).json();
    console.log(oFinal);
    return oFinal.data[oFinal.data.length - 1].file;
}

function getSeasonIds(id) {
    // console.log(`===== SEASON ${id}(${seasons[id]}) =====`);
    let k = 0;
    for (let j = 1; j < id; j++) {
        k += 2 * seasons[j];
    }
    // console.log(`k = ${k}`);
    const arr = {};
    for (let i = 1; i <= seasons[id] * 2; i += 2) {
        // console.log(Math.ceil(i / 2), 34 + i + k);
        arr[Math.ceil(i / 2)] = 34 + i + k;
    }
    return arr;
}

function getEpisodeId(seasonIndex, episodeIndex) {
    // console.log(`===== SEASON ${id}(${seasons[id]}) =====`);
    let k = 0;
    for (let j = 1; j < seasonIndex; j++) {
        k += 2 * seasons[j];
    }

    return k + 33 + (episodeIndex * 2);
}

async function getSeasonHtml(id) {
    const res = await got.get(`https://watchhouseonline.net/season/house-season-${id}/`).text();
    // console.log(res);
    const $ = cheerio.load(res);
    let html = "<ul>";
    $("div#seasons .episodios li").each(function (i, e) {
        html += `<li>
            <div class="thumb"><img src="${$(e).find("img").attr("src")}"></div>
            <div class="link"><a href="${getEpisodeId(id, i + 1)}">${$(e).find("a").text()}</a></div>
        </li>`;
    });
    html += "</ul>";


    await fs.writeFile(`./public/season_${id}.html`, html);

}

main().catch(e => console.log(e.message));