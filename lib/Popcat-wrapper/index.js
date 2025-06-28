const baseurl = "https://api.popcat.xyz/";

async function request(endpoint, input = "") {
  return `${baseurl}${endpoint}?${input}`;
}

export class CodeClient {
  constructor({ key }) {
    if (!key) throw new Error("Usage: new CodeClient({ key: 'your key' })");
    this.key = key;
  }
}

export const quote = (image, text, name) => {
  if (!image || !text || !name || name.length === 0)
    throw new Error(
      "[Popcat Wrapper] quote(image, text, name) => Either 'image', 'text' or 'name' parameter is missing.",
    );
  if (text.length === 0 || text.length > 125)
    return new Error(
      "[Popcat Wrapper] quote(image, text, name) => 'text' parameter must be between 1-125 characters.",
    );
  return `${baseurl}quote?image=${encodeURIComponent(image)}&text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}`;
};

export const happysad = async (text1, text2) => {
  if (!text1 || !text2)
    throw new Error(
      "[Popcat Wrapper] happysad(text1, text2) => Either 'text1' or 'text2' parameter is missing.",
    );
  return `${baseurl}happysad?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
};

export const communism = async (imageURL) => {
  if (!imageURL)
    throw new Error("[Popcat Wrapper] communism(image) => 'imageURL' parameter is missing.");
  return `${baseurl}communism?image=${imageURL}`;
};

export const randomcolor = async () => {
  return await fetch("https://api.popcat.xyz/randomcolor").then((r) => r.json());
};

export const periodicTable = async (element) => {
  if (!element)
    throw new Error("[Popcat Wrapper] periodicTable(element) ==> 'element' parameter is missing.");
  const res = await fetch(
    `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(element)}`,
  ).then((r) => r.json());
  if (res.error) throw new Error(res.error);
  return res;
};

export const jail = async function (imageURL) {
  if (!imageURL)
    throw new Error("[Popcat Wrapper] jail(imageURL) ==> 'imageURL' parameter is missing.");
  return `${baseurl}jail?image=${encodeURIComponent(imageURL)}`;
};

export const unforgivable = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] unforgivable(text) ==> 'text' parameter is missing.");
  return `${baseurl}unforgivable?text=${encodeURIComponent(text)}`;
};

export const imdb = async function (name) {
  if (!name) throw new Error("[Popcat Wrapper] imdb(name) ==> 'name' parameter is missing");
  const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(name)}`).then((r) =>
    r.json(),
  );
  if (res.error) throw new Error(res.error);
  return res;
};

export const steam = async function (name) {
  if (!name) throw new Error("[Popcat Wrapper] steam(name) ==> 'name' parameter is missing.");
  const res = await fetch(`https://api.popcat.xyz/steam?q=${encodeURIComponent(name)}`);
  const text = await res.text();
  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error);
  return json;
};

export const screenshot = async function (url) {
  if (!url) throw new Error("[Popcat Wrapper] screenshot(url) ==> 'url' parameter is missing.");
  const { isurl } = await fetch(`https://api.popcat.xyz/isurl?url=${encodeURIComponent(url)}`).then(
    (r) => r.json(),
  );
  if (isurl === false) throw new Error("[Popcat Wrapper] screenshot(url) ==> 'url' is not valid!");
  return `https://api.popcat.xyz/screenshot?url=${url}`;
};

export const shorten = async function (url, extension) {
  if (!url || !extension)
    throw new Error(
      "[Popcat Wrapper] shorten(url, extension) ==> 'url' or 'extension' parameter is missing",
    );
  const res = await fetch(
    `https://api.popcat.xyz/shorten?url=${encodeURIComponent(url)}&extension=${encodeURIComponent(extension)}`,
  );
  const text = await res.text();
  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error);
  return json.shortened;
};

export const lyrics = async function (song) {
  if (!song)
    throw new Error("[Popcat Wrapper] The field 'song' was left empty int he LYRICS function!");
  const res = await fetch(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(song)}`);
  const text = await res.text();
  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error);
  return json;
};

export const car = async function () {
  const res = await fetch(`https://api.popcat.xyz/car`);
  const text = await res.text();
  return JSON.parse(text);
};

export const showerthought = async function () {
  const res = await fetch(`https://api.popcat.xyz/showerthoughts`);
  const text = await res.text();
  return JSON.parse(text);
};

export const subreddit = async function (subreddit) {
  if (!subreddit)
    throw new Error(
      "[Popcat Wrapper] The field 'subeddit' was left empty in the SUBREDDIT function!",
    );
  const res = await fetch(`https://api.popcat.xyz/subreddit/${encodeURIComponent(subreddit)}`);
  const text = await res.text();
  return JSON.parse(text);
};

export const oogway = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the OOGWAY function!");
  return `https://api.popcat.xyz/oogway?text=${encodeURIComponent(text)}`;
};

export const opinion = async function (image, text) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the OPINION function!");
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the OPINION function!");
  return `https://api.popcat.xyz/opinion?image=${encodeURIComponent(image)}&text=${encodeURIComponent(text)}`;
};

export const wanted = async function (image) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the WANTED function!");
  return `https://api.popcat.xyz/wanted?image=${encodeURIComponent(image)}`;
};

export const sadcat = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the SAD CAT function. Need help? https://popcat.xyz/server",
    );
  return `${baseurl}sadcat?text=${encodeURIComponent(text)}`;
};

export const github = async function (username) {
  if (!username)
    throw new Error("[Popcat Wrapper] The field 'username' was left empty in the GITHUB function!");
  const res = await fetch(`https://api.popcat.xyz/github/${encodeURIComponent(username)}`);
  const js = await res.text();
  const obj = JSON.parse(js);
  if (obj.error) throw new Error("[Popcat Wrapper] Invalid username in the github function!");
  return obj;
};

export const weather = async function (place) {
  if (!place)
    throw new Error("[Popcat Wrapper] The field 'place' was left empty in the WEATHER function!");
  const res = await fetch(`https://api.popcat.xyz/weather?q=${encodeURIComponent(place)}`);
  const js = await res.text();
  const obj = JSON.parse(js);
  if (obj.error) throw new Error("[Popcat Wrapper] Invalid place in the weather function!");
  return obj;
};

export const lulcat = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the LUL CAT function. Need help? https://popcat.xyz/server",
    );
  const url = `${baseurl}lulcat?text=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const final = await res.json();
  return final.text;
};

export const gun = async function (image) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the GUN function!");
  const input = `image=${encodeURIComponent(image)}`;
  return await request("gun", input);
};

export const country = async function (name) {
  if (!name)
    throw new Error(
      "[Popcat Wrapper] The field 'country name' was left empty in the COUNTRY function!",
    );
  const res = await fetch(`${baseurl}countries/${encodeURIComponent(name)}`);
  const js = await res.text();
  const obj = JSON.parse(js);
  if (obj.error) throw new Error("[Popcat Wrapper] Invalid country in the COUNTRY function!");
  return obj;
};

export const banner = async function (uid) {
  if (!uid)
    throw new Error("[Popcat Wrapper] The field 'user id' was left empty in the BANNER function!");
  const res = await fetch(baseurl + "banners/" + uid);
  const obj = await res.text();
  return JSON.parse(obj);
};

export const npm = async function (pkg) {
  if (!pkg)
    throw new Error(
      "[Popcat Wrapper] The field 'package name' was left empty in the NPM function!",
    );
  const url = `https://api.popcat.xyz/npm?q=${encodeURIComponent(pkg)}`;
  const res = await fetch(url);
  const obj = await res.text();
  const js = JSON.parse(obj);
  if (js.error) throw new Error(js.error);
  else {
    return js;
  }
};

export const fact = async function () {
  const url = `https://api.popcat.xyz/fact`;
  const fa = await fetch(url);
  const fact = await fa.json();
  return fact.fact;
};

export const instagramUser = async function (username) {
  if (!username)
    throw new Error(
      "[Popcat Wrapper] The field 'username' was left empty in the instagramUser function!",
    );
  const url = `https://api.popcat.xyz/instagram?user=${username.split(" ").join("_")}`;
  const res = await fetch(url);
  const account = await res.text();
  if (account.includes("error")) throw new Error("[Popcat Wrapper] Not a valid instagram user!");
  return JSON.parse(account);
};

export const drake = async function (text1, text2) {
  if (!text1) throw new Error("The field text1 was left empty in the drake function");
  if (!text2) throw new Error("The field text2 was left empty in the drake function");
  const input = `text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
  return await request("drake", input);
};

export const pooh = async function (text1, text2) {
  if (!text1) throw new Error("The field text1 was left empty in the pooh function");
  if (!text2) throw new Error("The field text2 was left empty in the pooh function");
  const input = `text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
  return await request("pooh", input);
};

export const ship = async function (image1, image2) {
  if (!image1)
    throw new Error(
      "The field image1 was left empty in the ship function. Need help? https://dsc.gg/popcatcom",
    );
  if (!image2)
    throw new Error(
      "The field image2 was left empty in the ship function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `user1=${encodeURIComponent(image1)}&user2=${encodeURIComponent(image2)}`;
  return await request("ship", input);
};

export const whowouldwin = async function (image1, image2) {
  if (!image1)
    throw new Error(
      "The field image1 was left empty in the whowouldwin function. Need help? https://dsc.gg/popcatcom",
    );
  if (!image2)
    throw new Error(
      "The field image2 was left empty in the whowouldwin function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image1=${encodeURIComponent(image1)}&image2=${encodeURIComponent(image2)}`;
  return await request("whowouldwin", input);
};

export const colorify = async function (image, color) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the colorify function. Need help? https://dsc.gg/popcatcom",
    );
  if (!color)
    throw new Error(
      "[Popcat Wrapper] The field 'color' was left empty in the colorify function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}&color=${encodeURIComponent(color)}`;
  return await request("colorify", input);
};

export const biden = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the biden function. Need help? https://dsc.gg/popcatcom",
    );
  return await request("biden", `text=${encodeURIComponent(text)}`);
};

export const joke = async function () {
  const res = await fetch("https://api.popcat.xyz/joke");
  const json = await res.json();
  return json.joke;
};

export const pikachu = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the pikachu function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  return await request("pikachu", input);
};

export const drip = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the drip function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("drip", input);
};

export const clown = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the clown function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  const res = await request("clown", input);
  return res;
};

export const translate = async function (text, to) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the translate function. Need help? https://dsc.gg/popcatcom",
    );
  if (!to)
    throw new Error(
      "[Popcat Wrapper] The field 'to' was left empty in the translate function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}&to=${encodeURIComponent(to)}`;
  const res = await fetch("https://api.popcat.xyz/translate?" + input);
  const json = await res.json();
  return json.translated;
};

export const reverse = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the reverse function");
  const res = await fetch(`https://api.popcat.xyz/reverse?text=${encodeURIComponent(text)}`);
  const json = await res.json();
  return json.text;
};

export const uncover = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the uncover function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("uncover", input);
};

export const ad = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the ad function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("ad", input);
};

export const blur = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the blur function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("blur", input);
};

export const invert = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the invert function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("invert", input);
};

export const greyscale = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the greyscale function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("greyscale", input);
};

export const alert = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the alert function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  return await request("alert", input);
};

export const caution = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the caution function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  return await request("caution", input);
};

export const colorinfo = async function (color) {
  if (!color)
    throw new Error(
      "[Popcat Wrapper] The field 'color' was left empty in the colorinfo function. Need help? https://dsc.gg/popcatcom",
    );
  let colour = color;
  if (colour.includes("#")) colour = colour.split("#")[1];
  const res = await fetch(`https://api.popcat.xyz/color/${encodeURIComponent(colour)}`);
  const json = await res.text();
  if (json.includes("error"))
    throw new Error("[Popcat Wrapper] Invalid hex in the 'colorinfo' function!");
  return JSON.parse(json);
};

export const jokeoverhead = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the jokeoverhead function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("jokeoverhead", input);
};

export const pet = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the pet function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("pet", input);
};

export const mnm = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the mnm function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("mnm", input);
};

export const mock = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the mock function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/mock?" + input);
  const json = await res.json();
  return json.text;
};

export const doublestruck = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the doublestruck function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/doublestruck?" + input);
  const json = await res.json();
  return json.text;
};

export const texttomorse = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the texttomorse function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/texttomorse?" + input);
  const json = await res.json();
  return json.morse;
};

export const wouldyourather = async function () {
  const res = await fetch("https://api.popcat.xyz/wyr");
  const json = await res.text();
  return JSON.parse(json);
};

export const randommeme = async function () {
  const res = await fetch("https://api.popcat.xyz/meme");
  const json = await res.text();
  return JSON.parse(json);
};

export const welcomecard = async function welcomecard(background, avatar, text_1, text_2, text_3) {
  if (!background)
    throw new SyntaxError(
      "welcomeImage(background, avatar, text_1, text_2, text_3, color) ==> background is null.",
    );
  if (!background.startsWith("https://"))
    throw new Error(
      "[Popcat Wrapper] welcomecard(background, avatar, text_1, text_2, text_3) ==> background must be a valid URL.",
    );
  if (!background.endsWith(".png"))
    throw new Error(
      "[Popcat Wrapper] welcomecard(background, avatar, text_1, text_2, text_3) ==> background must be a PNG.",
    );
  if (!avatar)
    throw new SyntaxError(
      "welcomecard(background, avatar, text_1, text_2, text_3) ==> avatar is null",
    );
  if (!text_1)
    throw new SyntaxError(
      "welcomecard(background, avatar, text_1, text_2, text_3) ==> text_1 is null",
    );
  if (!text_2)
    throw new SyntaxError(
      "welcomecard(background, avatar, text_1, text_2, text_3) ==> text_2 is null",
    );
  if (!text_3)
    throw new SyntaxError(
      "welcomecard(background, avatar, text_1, text_2, text_3) ==> text_3 is null",
    );
  const input = `background=${encodeURIComponent(background)}&avatar=${encodeURIComponent(avatar)}&text1=${encodeURIComponent(text_1)}&text2=${encodeURIComponent(text_2)}&text3=${encodeURIComponent(text_3)}`;
  return await request("welcomecard", input);
};

export const itunes = async function (x) {
  if (!x)
    throw new Error("[Popcat Wrapper] The field 'song' was left empty in the iTunes function.");
  const res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(x)}`);
  const json = await res.text();
  if (json.includes("error")) throw new Error("[Popcat Wrapper] Song Not found on iTunes!");
  return JSON.parse(json);
};

export const chatbot = async function (x, ownername, botname) {
  if (!x)
    throw new Error("[Popcat Wrapper] The field 'content' was left empty in the chatbot function.");
  if (!ownername)
    throw new Error(
      "[Popcat Wrapper] The field 'ownername' was left empty in the chatbot function.",
    );
  if (!botname)
    throw new Error("[Popcat Wrapper] The field 'botname' was left empty in the chatbot function.");
  const res = await fetch(
    `https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(x)}&owner=${encodeURIComponent(ownername)}&botname=${encodeURIComponent(botname)}`,
  );
  const resp = await res.json();
  return resp.response;
};

export const encode = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the encode function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch(`https://api.popcat.xyz/encode?${input}`);
  const json = await res.json();
  return json.binary;
};

export const decode = async function (binary) {
  if (!binary)
    throw new Error(
      "[Popcat Wrapper] The field 'binary' was left empty in the decode function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `binary=${encodeURIComponent(binary)}`;
  const res = await fetch(`https://api.popcat.xyz/decode?${input}`);
  const json = await res.json();
  return json.text;
};

export const facts = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the facts functuion.");
  const input = `text=${encodeURIComponent(text)}`;
  return await request("facts", input);
};

export const _8ball = async function () {
  const res = await fetch("https://api.popcat.xyz/8ball");
  const json = await res.json();
  return json.answer;
};

export default {
  CodeClient,
  quote,
  happysad,
  communism,
  randomcolor,
  periodicTable,
  jail,
  unforgivable,
  imdb,
  steam,
  screenshot,
  shorten,
  lyrics,
  car,
  showerthought,
  subreddit,
  oogway,
  opinion,
  wanted,
  sadcat,
  github,
  weather,
  lulcat,
  gun,
  country,
  banner,
  npm,
  fact,
  instagramUser,
  drake,
  pooh,
  ship,
  whowouldwin,
  colorify,
  biden,
  joke,
  pikachu,
  drip,
  clown,
  translate,
  reverse,
  uncover,
  ad,
  blur,
  invert,
  greyscale,
  alert,
  caution,
  colorinfo,
  jokeoverhead,
  pet,
  mnm,
  mock,
  doublestruck,
  texttomorse,
  wouldyourather,
  randommeme,
  welcomecard,
  itunes,
  chatbot,
  encode,
  decode,
  facts,
  _8ball,
};
