const GROUPS = {
  senses: [
    "anan",
    "kun",
    "pa",
    //"pela",
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
    "nin",
    "pawo",
    "pulusi",
    "suwina",
  ],
  tastes: ["kikolo", "muncu", "nankin", "pikante", "satu", "umami"],
  colors: [
    "hunsi",
    "lunti",
    "nalinca",
    "nelo",
    "nile",
    "penpe",
    "pula",
    "sepo",
    "sunaja",
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
  DICT = text.trim().split(reNewline);
  // extract the headers we want
  DICT[0] = DICT[0].split("\t");
  console.log("DICT.at(-1)", DICT.at(-1));
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
    let ikama_tasuwi = IKAMA_TASUWI[array[keys.word]] || undefined;
    // There is an incomplete line after `tepu` in the source CSV. Skip over this, and remove undefined element later
    if (array[keys.word] == "") {
      return undefined;
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
  DICT = DICT.filter(el => el !== undefined);
  console.log(DICT);
  const list = document.getElementById("words");
  list.replaceChildren();
  populateList(0, 32);
  return;
}

function populateList(index, count) {
  const list = document.getElementById("words");
  for (let i = index; i < index + count; i++) {
    let el = document.createElement("li");
    if (i >= DICT.length) {
      return;
    }
    el.dataset.word = DICT[i].word;
    if (DICT[i].ikamaTasuwi === undefined) {
      el.classList.add("noIkamaTasuwi");
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
    <li><strong style="display: none;">Ikama Tasuwi:</strong> ${DICT[i].ikamaTasuwi || "[not found]"}</li>
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

function normalSortElements(a, b) {
  return a.dataset.word.localeCompare(b.dataset.word);
}
const LIKANU_ORDER = "ptkcwljmnshaieou";
function likanuSortElements(a, b) {
  return likanuSortRecursive(a.dataset.word, b.dataset.word);
}
function likanuSortRecursive(a, b) {
  if (a === "") {
    if (b === "") {
      return 0;
    }
    return 1;
  }
  if (b === "") {
    return -1;
  }
  const diff = LIKANU_ORDER.indexOf(a.charAt(0)) - LIKANU_ORDER.indexOf(b.charAt(0))
  if (diff === 0) {
    return likanuSortRecursive(
      a.substring(1), b.substring(1)
    );
  } else {
    return Math.sign(diff);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getDictionary();
  const search = document.getElementById("wordsSearchBox");
  search.value = "";
  search.addEventListener("input", event => {
    const v = search.value.trim().toLowerCase();
    if (v === "") {
      for (let child of list.children) {
        child.style.removeProperty("display");
      }
      return;
    }
    else {
      for (let child of list.children) {
        if (child.dataset.word.includes(v)) {
          child.style.removeProperty("display");
        } else {
          child.style.setProperty("display", "none");
        }
      }
    }
  });
  const sortLikanu = document.getElementById("sortInLikanuOrder");
  
  sortLikanu.checked = false;
  sortLikanu.addEventListener("change", event => {
    let c = Array.from(list.children);
    if (sortLikanu.checked) {
      c.sort(likanuSortElements);
    } else {
      c.sort(normalSortElements);
    }
    console.log(c);
    list.replaceChildren(
      ...c
    );
  });
});