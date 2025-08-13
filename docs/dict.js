const GROUPS = {
  senses: [
    "anan",
    "kun",
    "pa",
    "pata",
    "pela",
    "sapole",
    "sema",
    "tijante",
    "teka",
  ],
  animals: [
    "canwa",
    "cuwi",
    "hoton",
    "jone",
    "meja",
    "micin",
    "momu",
    "musi",
    "neje",
    "nile",
    "nin",
    "pawo",
    "pulusi",
    "suwina",
  ],
  tastes: ["kikolo", "muncu", "nankin", "nelo", "pikante", "satu", "umami"],
  colors: [
    "hunsi",
    "lanki",
    "lunti",
    "nalinca",
    "penpe",
    "pula",
    "sepo",
    "tusa",
  ],
  emotions: [
    "amo",
    "anwije",
    "hinpan",
    "ju",
    "kapan",
    "kujo",
    "kusa",
    "osole",
    "pasan",
    "saminta",
    "santi",
    "suki",
    "tajen",
    "tonko",
    "ukiki",
  ],
  numbers: [
    "etu",
    "ha",
    "hen",
    "hu",
    "lima",
    "loku",
    "nanku",
    "nula",
    "saka",
    "setan",
    "sijen",
    "tiju",
    "wan",
  ],
  time: ["kenca", "konje", "muwesi", "sunkan", "ten"],
  directions: [
    "kali",
    "lima",
    "malo",
    "opoki",
    "pajan",
    "polan",
    "sekano",
    "sopa",
    "tawawa",
    "tula",
  ],
  movement: [
    "cuma",
    "jamin",
    "ki",
    "kilima",
    "koman",
    "lo",
    "patun",
    "pucon",
    "titan",
  ],
  pronouns: ["ja", "mi", "tu", "usen"],
  body: [],
  shapes: [],
};

const reNewline = /[\r\n]+/;
let IKAMA_TASUWI = {};
let DICT = [];

async function getDictionary(event) {
  event.target.parentElement.removeChild(event.target);
  const IKAMA_TASUWI_URL = URL.parse("/ikamatasuwi.tsv", window.location);
  console.log(IKAMA_TASUWI_URL);
  const itText = await fetch(IKAMA_TASUWI_URL).then((res) => res.text());
  let itTemp = itText.split(reNewline);
  IKAMA_TASUWI = Object.fromEntries(
    Array.from(itTemp, (row) => {
      let arr = row.split("\t");
      if (arr.length == 1) {
        arr[1] = "[NOT FOUND]";
      }
      arr[1] = arr[1]
        .replaceAll(
          /`(.+?)`/g,
          '<a href="https://nimi.li/$1" target="_blank" class="tp">$1</a>'
        )
        .replaceAll(/\{(.+?)\}/g, '<a href="#word_$1">$1</a>');
      return arr;
    })
  );
  console.log(IKAMA_TASUWI);

  const TSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVGXFd17kcvfu__zjshqiV3kW360IclOEfEdWda_K6ZCg4TY6nW2Gwn4_bs1yQeFLwrZI1_xEvSuP0/pub?gid=0&single=true&output=tsv";
  const text = await fetch(TSV_URL).then((res) => res.text());
  DICT = text.split(reNewline);
  // extract the headers we want
  DICT[0] = DICT[0].split("\t");
  console.log("DICT[0]", DICT[0]);
  const keys = {
    word: DICT[0].indexOf("Word"),
    main_pos: DICT[0].indexOf("Type"),
    def_main: DICT[0].indexOf("Meaning"),
    def_noun: DICT[0].indexOf("Noun"),
    def_verb: DICT[0].indexOf("Verb"),
    def_mod: DICT[0].indexOf("Modifier"),
    etym_word: DICT[0].indexOf("Origin"),
    etym_ipa: DICT[0].indexOf("IPA"),
    etym_family: DICT[0].indexOf("Family"),
    toki_ma: DICT[0].indexOf("Tokima Word"),
    antonym: DICT[0].indexOf("Antonym"),
  };
  // remove the header row
  DICT.splice(0, 1);
  // assemble the dictionary
  DICT = Array.from(DICT, (el) => {
    let array = el.split("\t");
    let ikama_tasuwi = IKAMA_TASUWI[array[keys.word]] || "not found";
    if (array[keys.word] == "alu") {
      console.log(array);
    }
    return {
      word: array[keys.word],
      mainPos: array[keys.main_pos],
      def: {
        main: array[keys.def_main] == "-" ? undefined : array[keys.def_main],
        noun: array[keys.def_noun] == "-" ? undefined : array[keys.def_noun],
        verb: array[keys.def_verb] == "-" ? undefined : array[keys.def_verb],
        mod: array[keys.def_mod] == "-" ? undefined : array[keys.def_mod],
        antonym: array[keys.antonym] == "" ? undefined : array[keys.antonym],
      },
      etym: {
        word: array[keys.etym_word],
        ipa: array[keys.etym_ipa],
        family: array[keys.etym_family],
        tokiMa: array[keys.toki_ma] == "-" ? undefined : array[keys.toki_ma],
      },
      ikamaTasuwi: ikama_tasuwi,
    };
  });
  console.log(DICT);
  const list = document.getElementById("words");
  list.replaceChildren();
  populateList(0, 100);
  return;
}

function populateList(index, count) {
  const list = document.getElementById("words");
  for (let i = index; i < index + count; i++) {
    let el = document.createElement("li");
    if (i >= DICT.length) {
      return;
    }
    el.innerHTML = `
<div class="wordHead" id="word_${DICT[i].word}">
  <img src="./img/${DICT[i].word}" loading="lazy">
  <div>
    <strong>${DICT[i].word}</strong>
    <i>“${DICT[i].def.main}”</i>
  </div>
</div><div class="wordBody">
  <ul class="wordIT">
    <li><strong>Ikama Tasuwi:</strong> ${DICT[i].ikamaTasuwi}</li>
  </ul>
  <ul class="wordDef">
    ${
      DICT[i].def.noun
        ? "<li><strong>Noun:</strong> " + DICT[i].def.noun + "</li>"
        : ""
    }
    ${
      DICT[i].def.verb
        ? "<li><strong>Verb:</strong> " + DICT[i].def.verb + "</li>"
        : ""
    }
    ${
      DICT[i].def.mod
        ? "<li><strong>Modifier:</strong> " + DICT[i].def.mod + "</li>"
        : ""
    }
    ${
      DICT[i].def.antonym
        ? DICT[i].def.antonym.includes("/")
          ? "<li><strong>Antonyms:</strong> " +
            Array.from(
              DICT[i].def.antonym.split("/"),
              (v) => `<a href="#word_${v}">${v}</a>`
            ).join(", ") +
            "</li>"
          : `<li><strong>Antonym:</strong> <a href="#word_${DICT[i].def.antonym}">${DICT[i].def.antonym}</a></li>`
        : ""
    }
  </ul>
  <ul class="wordEtym">
    <li><strong>From:</strong> ${
      DICT[i].etym.ipa
        ? DICT[i].etym.word +
          ' <span class="ipa">' +
          DICT[i].etym.ipa +
          "</span>"
        : DICT[i].etym.word
    }</li>
    <li><strong>Family:</strong> ${DICT[i].etym.family || "N/A"}</li>
    ${
      DICT[i].etym.tokiMa
        ? "<li><strong>Toki Ma:</strong> " + DICT[i].etym.tokiMa + "</li>"
        : ""
    }
  </ul>
</div>`;
    list.appendChild(el);
  }
  setTimeout(() => {
    populateList(index + count, count);
  }, 1);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("getDictionary")
    .addEventListener("click", getDictionary);
});
