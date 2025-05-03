const badwords = [
  "bazd*", "*buzi*", "cigany*", "*geci*",
  "getvás", "*fasz*", "f4sz*", "*pina*",
  "*pinák*", "hülye", "hülyék*", "hitler",
  "*pinák*", "*kurva*", "*kurvák*", "mocskos",
  "örömlány*", "idióta", "idióták", "prosti*",
  "pondró*", "ribanc*", "rühes", "riherongy",
  "tetves", "szar", "sz4r*", "szaro*",
  "szari*", "szarn*", "szart*", "szarna*",
  "szaro*", "szars*", "kutyaszar*", "macsakaszar*",
  "kiszar*", "beszar*", "összeszar*", "lószar*",
  "szétszar*", "leszar*", "beleszar*", "szuka",
  "szukák", "segg*", "sperma", "selejt*",
  "szajha", "rohadt", "pudvás", "takony",
  "taknyos", "zsidó*", "idiot*", "*bitch*",
  "*dick*", "*cunt*", "*fuck*", "*nigger*",
  "*niger*", "*pussy*", "*pussies", "*whore*",
  "*shit*", "*vagina*",
];
const strong_words = [
  "bazd*", "hitler", "cigany*", "*geci*",
  "*fasz*", "f4sz*", "*pina*", "*pinák*",
  "p1na", "p1nák", "*kurva*", "*kurvák*",
  "szar", "sz4r*", "szaro*", "szari*",
  "szarn*", "szart*", "szarna*", "szaro*",
  "szars*", "kutyaszar*", "macsakaszar*", "kiszar*",
  "beszar*", "összeszar*", "lószar*", "szétszar*",
  "leszar*", "beleszar*", "zsidó*", "*bitch*",
  "*dick*", "*cunt*", "*fuck*", "*nigger*",
  "*niger*", "*pussy*", "*pussies", "*whore*",
  "*shit*",
];

const numberEmojis = [
  {
    number: 0,
    string: "0",
    emojis: [
      "0️⃣", "🅾️", "👌", "🌀",
    ],
  }, {
    number: 1,
    string: "1",
    emojis: [
      "1️⃣", "🥇", "👆", "☝️",
    ],
  }, {
    number: 2,
    string: "2",
    emojis: [
      "2️⃣", "✌️", "🥈", "🤘",
    ],
  }, {
    number: 3,
    string: "3",
    emojis: [
      "3️⃣", "🥉", "🤟", "🚦",
    ],
  },
  {
    number: 4,
    string: "4",
    emojis: [
      "4️⃣", "🍀", "🕓", "👨‍👩‍👧‍👦",
    ],
  }, {
    number: 5,
    string: "5",
    emojis: [
      "5️⃣", "🖐", "🤚", "👋",
    ],
  }, {
    number: 6,
    string: "6",
    emojis: [
      "6️⃣", "🕕", "🔯", "✡️",
    ],
  }, {
    number: 7,
    string: "7",
    emojis: [
      "7️⃣", "🕖", "🕢", "🌈",
    ],
  },
  {
    number: 8,
    string: "8",
    emojis: [
      "8️⃣", "🎱", "🕗", "✳️",
    ],
  }, {
    number: 9,
    string: "9",
    emojis: [
      "9️⃣", "🕘", "🕤",
    ],
  },
];

export { numberEmojis, badwords, strong_words };
