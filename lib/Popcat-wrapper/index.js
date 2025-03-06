const baseurl = "https://api.popcat.xyz/";

async function request(endpoint, input = "") {
  return `${baseurl}${endpoint}?${input}`;
}
class CodeClient {
  constructor({ key }) {
    if (!key) throw new Error("Usage: new CodeClient({ key: 'your key' })");
    this.key = key;
  }
  async createBin({ title, description, code }) {
    return "This function has been deprecated!";
    //  if(!title) throw new Error("The property 'title' was left in the options! Please refer to https://npmjs.com/package/popcat-wrapper")
    //  if(!description) throw new Error("The property 'description' was left in the options! Please refer to https://npmjs.com/package/popcat-wrapper")
    //  if(!code) throw new Error("The property 'code' was left in the options! Please refer to https://npmjs.com/package/popcat-wrapper")

    // const res = await fetch("https://code.popcat.xyz/api/create", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     title,
    //     description,
    //     code
    //   }),
    //   headers: {'Content-Type': 'application/json','token': this.key}
    // })
    // const json = await res.json()
    // if(json.error) throw new Error(json.error)
    // return json.url;
  }
}

module.exports.quote = (image, text, name) => {
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

module.exports.happysad = async (text1, text2) => {
  if (!text1 || !text2)
    throw new Error(
      "[Popcat Wrapper] happysad(text1, text2) => Either 'text1' or 'text2' parameter is missing.",
    );
  const url = `${baseurl}happysad?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
};

module.exports.communism = async (imageURL) => {
  if (!imageURL)
    throw new Error("[Popcat Wrapper] communism(image) => 'imageURL' parameter is missing.");
  return `${baseurl}communism?image=${imageURL}`;
};

module.exports.randomcolor = async () => {
  return await fetch("https://api.popcat.xyz/randomcolor").then((r) => r.json());
};

module.exports.periodicTable = async (element) => {
  if (!element)
    throw new Error("[Popcat Wrapper] periodicTable(element) ==> 'element' parameter is missing.");
  const res = await fetch(
    `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(element)}`,
  ).then((r) => r.json());
  if (res.error) throw new Error(res.error);
  return res;
};

module.exports.jail = async function (imageURL) {
  if (!imageURL)
    throw new Error("[Popcat Wrapper] jail(imageURL) ==> 'imageURL' parameter is missing.");
  return `${baseurl}jail?image=${encodeURIComponent(imageURL)}`;
};

module.exports.unforgivable = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] unforgivable(text) ==> 'text' parameter is missing.");
  return `${baseurl}unforgivable?text=${encodeURIComponent(text)}`;
};

module.exports.imdb = async function (name) {
  if (!name) throw new Error("[Popcat Wrapper] imdb(name) ==> 'name' parameter is missing");
  const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(name)}`).then((r) =>
    r.json(),
  );
  if (res.error) throw new Error(res.error);
  return res;
};
module.exports.steam = async function (name) {
  if (!name) throw new Error("[Popcat Wrapper] steam(name) ==> 'name' parameter is missing.");
  const res = await fetch(`https://api.popcat.xyz/steam?q=${encodeURIComponent(name)}`);
  const text = await res.text();
  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error);
  return json;
};
module.exports.screenshot = async function (url) {
  if (!url) throw new Error("[Popcat Wrapper] screenshot(url) ==> 'url' parameter is missing.");
  const { isurl } = await fetch(`https://api.popcat.xyz/isurl?url=${encodeURIComponent(url)}`).then(
    (r) => r.json(),
  );
  if (isurl === false) throw new Error("[Popcat Wrapper] screenshot(url) ==> 'url' is not valid!");
  return `https://api.popcat.xyz/screenshot?url=${url}`;
};
module.exports.shorten = async function (url, extension) {
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
module.exports.lyrics = async function (song) {
  if (!song)
    throw new Error("[Popcat Wrapper] The field 'song' was left empty int he LYRICS function!");
  const res = await fetch(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(song)}`);
  const text = await res.text();
  const json = JSON.parse(text);
  if (json.error) throw new Error(json.error);
  return json;
};

module.exports.car = async function () {
  const res = await fetch(`https://api.popcat.xyz/car`);
  const text = await res.text();
  return JSON.parse(text);
};
module.exports.showerthought = async function () {
  const res = await fetch(`https://api.popcat.xyz/showerthoughts`);
  const text = await res.text();
  return JSON.parse(text);
};
module.exports.subreddit = async function (subreddit) {
  if (!subreddit)
    throw new Error(
      "[Popcat Wrapper] The field 'subeddit' was left empty in the SUBREDDIT function!",
    );
  const res = await fetch(`https://api.popcat.xyz/subreddit/${encodeURIComponent(subreddit)}`);
  const text = await res.text();
  return JSON.parse(text);
};
module.exports.oogway = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the OOGWAY function!");
  return `https://api.popcat.xyz/oogway?text=${encodeURIComponent(text)}`;
};
module.exports.opinion = async function (image, text) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the OPINION function!");
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the OPINION function!");
  return `https://api.popcat.xyz/opinion?image=${encodeURIComponent(image)}&text=${encodeURIComponent(text)}`;
};
module.exports.wanted = async function (image) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the WANTED function!");
  return `https://api.popcat.xyz/wanted?image=${encodeURIComponent(image)}`;
};
module.exports.sadcat = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the SAD CAT function. Need help? https://popcat.xyz/server",
    );
  return `${baseurl}sadcat?text=${encodeURIComponent(text)}`;
};
module.exports.github = async function (username) {
  if (!username)
    throw new Error("[Popcat Wrapper] The field 'username' was left empty in the GITHUB function!");
  const res = await fetch(`https://api.popcat.xyz/github/${encodeURIComponent(username)}`);
  const js = await res.text();
  const obj = JSON.parse(js);
  if (obj.error) throw new Error("[Popcat Wrapper] Invalid username in the github function!");
  return obj;
};
module.exports.weather = async function (place) {
  if (!place)
    throw new Error("[Popcat Wrapper] The field 'place' was left empty in the WEATHER function!");
  const res = await fetch(`https://api.popcat.xyz/weather?q=${encodeURIComponent(place)}`);
  const js = await res.text();
  const obj = JSON.parse(obj);
  if (obj.error) throw new Error("[Popcat Wrapper] Invalid place in the weather function!");
  return obj;
};
module.exports.lulcat = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the LUL CAT function. Need help? https://popcat.xyz/server",
    );
  const url = `${baseurl}lulcat?text=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const final = await res.json();
  return final.text;
};
module.exports.gun = async function (image) {
  if (!image)
    throw new Error("[Popcat Wrapper] The field 'image' was left empty in the GUN function!");
  const input = `image=${encodeURIComponent(image)}`;
  return await request("gun", input);
};
module.exports.country = async function (name) {
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
module.exports.banner = async function (uid) {
  if (!uid)
    throw new Error("[Popcat Wrapper] The field 'user id' was left empty in the BANNER function!");
  const res = await fetch(baseurl + "banners/" + uid);
  const obj = await res.text();
  return JSON.parse(obj);
};
module.exports.npm = async function (pkg) {
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
module.exports.fact = async function () {
  const url = `https://api.popcat.xyz/fact`;
  const fa = await fetch(url);
  const fact = await fa.json();
  return fact.fact;
};
module.exports.instagramUser = async function (username) {
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
module.exports.drake = async function (text1, text2) {
  if (!text1) throw new Error("The field text1 was left empty in the drake function");
  if (!text2) throw new Error("The field text2 was left empty in the drake function");
  const input = `text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
  return await request("drake", input);
};
module.exports.pooh = async function (text1, text2) {
  if (!text1) throw new Error("The field text1 was left empty in the pooh function");
  if (!text2) throw new Error("The field text2 was left empty in the pooh function");
  const input = `text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
  return await request("pooh", input);
};
module.exports.ship = async function (image1, image2) {
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
module.exports.whowouldwin = async function (image1, image2) {
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
module.exports.colorify = async function (image, color) {
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
module.exports.biden = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the biden function. Need help? https://dsc.gg/popcatcom",
    );
  return await request`https://api.popcat.xyz/biden?text=${encodeURIComponent(text)}`;
};
module.exports.joke = async function () {
  const res = await fetch("https://api.popcat.xyz/joke");
  const json = await res.json();
  return json.joke;
};
module.exports.pikachu = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the pikachu function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  return await request("pikachu", text);
};
module.exports.drip = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the drip function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("drip", input);
};
module.exports.clown = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the clown function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  const res = await request("clown", input);
  return res;
};
module.exports.translate = async function (text, to) {
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
module.exports.reverse = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the reverse function");
  const res = await fetch(`https://api.popcat.xyz/reverse?text=${encodeURIComponent(text)}`);
  const json = await res.json();
  return json.text;
};
module.exports.uncover = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the uncover function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("uncover", input);
};
module.exports.ad = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the ad function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("ad", input);
};
module.exports.blur = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the blur function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("blur", input);
};
module.exports.invert = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the invert function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("invert", input);
};
module.exports.greyscale = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the greyscale function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("greyscale", input);
};
module.exports.alert = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the alert function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(image)}`;
  return await request("alert", input);
};
module.exports.caution = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the caution function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(image)}`;
  return await request("caution", input);
};
module.exports.colorinfo = async function (color) {
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
module.exports.jokeoverhead = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the jokeoverhead function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("jokeoverhead", input);
};
module.exports.pet = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the pet function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("pet", input);
};
module.exports.mnm = async function (image) {
  if (!image)
    throw new Error(
      "[Popcat Wrapper] The field 'image' was left empty in the mnm function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `image=${encodeURIComponent(image)}`;
  return await request("mnm", input);
};
module.exports.mock = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the mock function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/mock?" + input);
  const json = await res.json();
  return json.text;
};
module.exports.doublestruck = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the doublestruck function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/doublestruck?" + input);
  const json = await res.json();
  return json.text;
};

module.exports.texttomorse = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the texttomorse function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch("https://api.popcat.xyz/texttomorse?" + input);
  const json = await res.json();
  return json.morse;
};
module.exports.wouldyourather = async function () {
  const res = await fetch("https://api.popcat.xyz/wyr");
  const json = await res.text();
  return JSON.parse(json);
};
module.exports.randommeme = async function () {
  const res = await fetch("https://api.popcat.xyz/meme");
  const json = await res.text();
  return JSON.parse(json);
};
module.exports.welcomecard = async function welcomecard(
  background,
  avatar,
  text_1,
  text_2,
  text_3,
) {
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
module.exports.itunes = async function (x) {
  if (!x)
    throw new Error("[Popcat Wrapper] The field 'song' was left empty in the iTunes function.");
  const res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(x)}`);
  const json = await res.text();
  if (json.includes("error")) throw new Error("[Popcat Wrapper] Song Not found on iTunes!");
  return JSON.parse(json);
};
module.exports.chatbot = async function (x, ownername, botname) {
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
module.exports.joke = async function () {
  const res = await fetch("https://api.popcat.xyz/joke");
  const json = await res.json();
  return json.joke;
};
module.exports.encode = async function (text) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'text' was left empty in the encode function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `text=${encodeURIComponent(text)}`;
  const res = await fetch(`https://api.popcat.xyz/encode?${input}`);
  const json = await res.json();
  return json.binary;
};
module.exports.decode = async function (binary) {
  if (!text)
    throw new Error(
      "[Popcat Wrapper] The field 'binary' was left empty in the decode function. Need help? https://dsc.gg/popcatcom",
    );
  const input = `binary=${encodeURIComponent(text)}`;
  const res = await fetch(`https://api.popcat.xyz/decode?${input}`);
  const json = await res.json();
  return json.text;
};
module.exports.facts = async function (text) {
  if (!text)
    throw new Error("[Popcat Wrapper] The field 'text' was left empty in the facts functuion.");
  const input = `text=${encodeURIComponent(text)}`;
  return await request("facts", input);
};
module.exports._8ball = async function () {
  const res = await fetch("https://api.popcat.xyz/8ball");
  const json = await res.json();
  return json.answer;
};
module.exports.CodeClient = CodeClient;
