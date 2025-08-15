const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
    "anpipi",
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
  ],
  numbers: [
    "con",
    "etu",
    "ha",
    "hen",
    "hu",
    "lima",
    "loku",
    "mita",
    "nanku",
    "nula",
    "saka",
    "san",
    "setan",
    "sijen",
    "tiju",
    "wan",
  ],
  time: [
    "conca",
    "kenca",
    "matin",
    "melon",
    "sikin",
    "sunkan",
    "ten",
  ],
  directions: [
    "enteken",
    "inalo",
    "jamin",
    "kali",
    "limijen",
    "malo",
    "opoki",
    "pajan",
    "pice",
    "polan",
    "sekano",
    "sopa",
    "tawawa",
    "tula",
  ],
  movement: [
    "cuma",
    "ihamo",
    "ki",
    "kilima",
    "koman",
    "laha",
    "lantan",
    "lo",
    "patun",
    "pese",
    "pucon",
    "sun",
    "titan",
  ],
  shapes: [
    "ankolo",
    "asa",
    "cenci",
    "cenpo",
    "cina",
    "cohi",
    "kiju",
    "kumon",
    "kuto",
    "laki",
    "lamo",
    "leseka",
    "macun",
    "mona",
    "mutakin",
    "niju",
    "pansin",
    "pintu",
    "poloko",
    "powele",
    "satilu",
    "sincuwan",
    "soto",
    "takilo",
    "tati",
    "tenja",
    "tolu",
    "wanku",
    "watan",
  ],
};

function jumpToWordCategory(category) {
  document.getElementById("categories").open = true;
  document.getElementById("category_" + category)?.scrollIntoView();
}

const reNewline = /[\r\n]+/;
let IKAMA_TASUWI = {};
let DICT = [];

async function getDictionary() {
  const list = document.getElementById("words");
  let plsWait = document.createElement("li");
  plsWait.innerHTML = "Loading dictionary...";
  list.replaceChildren(plsWait);

  const IKAMA_TASUWI_URL = new URL("./ikamatasuwi.tsv", window.location);
  // console.log(IKAMA_TASUWI_URL);
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
          '<a href="https://nimi.li/$1" target="_blank" class="tp"><i>$1</i></a>'
        )
        .replaceAll(
          /\{(.+?)\}/g,
          '<img class="inlineIT" src="./img/_$1.png" title="$1" loading="lazy"><a href="#word_$1"> <i>$1</i></a>'
        );
      return arr;
    })
  );
  // console.log(IKAMA_TASUWI);

  const TSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVGXFd17kcvfu__zjshqiV3kW360IclOEfEdWda_K6ZCg4TY6nW2Gwn4_bs1yQeFLwrZI1_xEvSuP0/pub?gid=0&single=true&output=tsv";
  const text = await fetch(TSV_URL).then((res) => res.text());
  plsWait.innerHTML = "Building dictionary...";
  await delay(1);

  DICT = text.trim().split(reNewline);
  // extract the headers we want
  DICT[0] = DICT[0].split("\t");
  // console.log("DICT.at(-1)", DICT.at(-1));
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
    for (let key of Object.keys(keys)) {
      if (array[keys[key]] == "-" || array[keys[key]] == "" ) {
        array[keys[key]] = undefined;
      }
    }
    return {
      word: array[keys.word],
      mainPos: array[keys.main_pos],
      def: {
        main: array[keys.def_main],
        noun: array[keys.def_noun],
        verb: array[keys.def_verb],
        mod: array[keys.def_mod],
        antonym: array[keys.antonym],
      },
      etym: {
        word: array[keys.etym_word],
        ipa: array[keys.etym_ipa],
        family: array[keys.etym_family],
        tokiMa: array[keys.toki_ma],
      },
      ikamaTasuwi: ikama_tasuwi,
    };
  });
  DICT = DICT.filter((el) => el !== undefined);
  // console.log(DICT);
  setTimeout(() => {
    populateList();
  }, 1);
  return;
}

function populateList() {
  const list = document.getElementById("words");
  list.replaceChildren();
  for (let i = 0; i < DICT.length; i++) {
    let el = document.createElement("li");
    el.dataset.word = DICT[i].word;
    let wordSets = [];
    if (
      DICT[i].ikamaTasuwi === undefined
      ||
      DICT[i].ikamaTasuwi.includes("[WIP]")
    ) {
      el.classList.add("noIkamaTasuwi");
    } else {
      for (let category of Object.keys(GROUPS)) {
        if (GROUPS[category].includes(DICT[i].word)) {
          wordSets.push(category);
        }
      }
    }
    el.innerHTML = `
<div class="wordHead" id="word_${DICT[i].word}">
  <img src="./img/_${DICT[i].word}.png" loading="lazy">
  <div>
    <strong>${DICT[i].word}</strong>
    <i>“${DICT[i].def.main}”</i>
  </div>
</div><div class="wordBody">
  <ul class="wordIT">
    <li><strong style="display: none;">Ikama Tasuwi:</strong> ${
      (
        DICT[i].ikamaTasuwi.includes("[WIP]") ?
        Array.from(DICT[i].ikamaTasuwi.split("[WIP]"), e => e.trim()).join('<br /><span class="wip">') + "</span>" :
        DICT[i].ikamaTasuwi
      ) || "[not found]"
    }${wordSets.length > 0 ? "<br>" + Array.from(
      wordSets, set => `<button type="button" class="wordCategoryButton" onclick="jumpToWordCategory('${set}');">${set}</button>`
    ).join("") : ""}</li>
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
        ? `<li class="antonym"><strong>Antonym${DICT[i].def.antonym.includes("/") ? "s" : ""}:</strong> ` +
            Array.from(DICT[i].def.antonym.split("/"), (v) => {
              return Array.from(
                v.split(" "),
                (word) =>
                  `<img class="inlineIT" src="./img/_${word}.png" title="${word}" loading="lazy">&nbsp;<a href="#word_${word}"><i>${word}</i></a>`
              ).join(" ");
            }).join(", ") +
            "</li>"
        : ""
    }
  </ul>
  <ul class="wordEtym">${
    DICT[i].etym.word !== undefined ?
    `<li><strong>From:</strong> ${
      DICT[i].etym.ipa
        ? DICT[i].etym.word +
          ' <span class="ipa">' +
          DICT[i].etym.ipa +
          "</span>"
        : DICT[i].etym.word
    }</li><li><strong>Family:</strong> ${
      DICT[i].etym.family || "N/A"
    }</li>` : "<li><strong>A priori</strong></li>"}
    ${
      DICT[i].etym.tokiMa
        ? "<li><strong>Toki Ma:</strong> " + DICT[i].etym.tokiMa + "</li>"
        : ""
    }
  </ul>
</div>`;
    list.appendChild(el);
  }
}

function normalSortElements(a, b) {
  if (typeof a !== "string") {a = a.dataset.word;}
  if (typeof b !== "string") {b = b.dataset.word;}
  return a.localeCompare(b);
}
const LIKANU_ORDER = "ptkcwljmnshNaieou";
const CODA_N = /([aeiou])n($|[^aeiou])/g;
function likanuSortElements(a, b) {
  if (typeof a !== "string") {a = a.dataset.word;}
  if (typeof b !== "string") {b = b.dataset.word;}
  return likanuSortRecursive(
    a.replaceAll(CODA_N, "$1N$2"),
    b.replaceAll(CODA_N, "$1N$2")
  );
}
function likanuSortRecursive(a, b) {
  if (a === "") {
    if (b === "") {
      return 0;
    }
    return -1;
  }
  if (b === "") {
    return 1;
  }
  const diff =
    LIKANU_ORDER.indexOf(a.charAt(0)) - LIKANU_ORDER.indexOf(b.charAt(0));
  if (diff === 0) {
    return likanuSortRecursive(a.substring(1), b.substring(1));
  } else {
    return Math.sign(diff);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("words");
  getDictionary();
  const search = document.getElementById("wordsSearchBox");
  search.value = "";
  search.addEventListener("input", (event) => {
    const v = search.value.trim().toLowerCase();
    if (v === "") {
      for (let child of list.children) {
        child.style.removeProperty("display");
      }
      return;
    } else {
      for (let child of list.children) {
        if (child.dataset.word.includes(v)) {
          child.style.removeProperty("display");
        } else {
          child.style.setProperty("display", "none");
        }
      }
    }
  });
  search.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
      let searchQuery = search.value.trim().toLowerCase();
      search.value = "";
      for (let child of list.children) {
        child.style.removeProperty("display");
      }
      let match = document.getElementById("word_" + searchQuery);
      if (!match) {
        let compFunc = sortLikanu.checked
          ? likanuSortElements
          : normalSortElements;
        for (let child of list.children) {
          if (compFunc(searchQuery, child.dataset.word) < 0) {
            match = child;
            break;
          }
        }
      }
      setTimeout(() => {
        match.scrollIntoView();
      }, 10);
    }
  });

  const sortLikanu = document.getElementById("sortInLikanuOrder");

  sortLikanu.checked = false;
  sortLikanu.addEventListener("change", (event) => {
    let c = Array.from(list.children);
    if (sortLikanu.checked) {
      c.sort(likanuSortElements);
    } else {
      c.sort(normalSortElements);
    }
    console.log(c);
    list.replaceChildren(...c);
  });

  const testInput = document.getElementById("ikamaTasuwiTryout");
  const testOutput = document.getElementById("ikamaTasuwiPreview");
  let testTimeout = -1;
  testInput.addEventListener("input", event => {
    if (testTimeout !== -1) {
      clearTimeout(testTimeout);
    }
    testTimeout = setTimeout(() => {
      testOutput.innerHTML = "";
      let splitBySpaces = testInput.value.split(/([a-z]+)/g);
      console.log(splitBySpaces);
      // odd indices: word was found?
      // even indices: whitespace only?
      let flag = Array.from(splitBySpaces, (v, k) =>
        (k % 2) ? (
          // potential word
          DICT.some(dictEntry => dictEntry.word === v)
        ) : (
          // whitespace/punctuation
          v.trim() === ""
        )
      );
      console.log(flag);
      const spanIt = text => {
        let span = document.createElement("SPAN");
        span.innerText = text;
        return span;
      }
      const imgIt = v => {
        let img = document.createElement("IMG");
        img.title = v;
        img.src = "./img/_" + v + ".png";
        img.loading = "lazy";
        return img;
      }
      for (let i = 0; i < splitBySpaces.length; i++) {
        if (i % 2) {
          // potential word
          if (flag[i]) {
            testOutput.appendChild(imgIt(splitBySpaces[i]));
          } else {
            testOutput.appendChild(spanIt(splitBySpaces[i]));
          }
        } else {
          // whitespace/punctuation
          if (flag[i] && (flag[i - 1] || flag[i + i])) {
            continue;
          } else {
            testOutput.appendChild(spanIt(splitBySpaces[i]));
          }
        }
      }
      // merge consecutive spans
      let i = testOutput.children.length;
      while (i > 1) {
        i--;
        if (testOutput.children[i].nodeName !== "SPAN") {
          continue;
        }
        if (testOutput.children[i - 1].nodeName !== "SPAN") {
          testOutput.children[i].innerText = testOutput.children[i].innerText.trim();
          continue;
        }
        testOutput.children[i - 1].innerText += testOutput.children[i].innerText;
        testOutput.removeChild(testOutput.children[i]);
      }
    }, 700);
  });
});
