/**
 * The Question You Want to Ask Artificial Intelligence.
 * @param {string} model "v3" (GPT-4)
 * @param {string} model "v3-32k" (GPT-4-32k)
 * @param {string} model "turbo" (GPT-3.5 Turbo)
 * @param {string} model "turbo-16k" (GPT-3.5 Turbo-16k)
 * @param {string} model "gemini" (Google Gemini-Pro)
 * @param {string} content The Question You Want to Ask Artificial Intelligence.
 * @param {string} personality It includes the features that you want to be included in the output you want from artificial intelligence.
 * @param apiKey
 * @example client.question({model:"v3-beta",content:"how are you?"})
 * @type {string} The Question You Want to Ask Artificial Intelligence.
 * @returns {Hercai}
 * @async
 */
async function question({ model = "v3", content, personality = "", apiKey = "" }) {
  if (
    ![
      "v3", "gemini", "v3-32k", "turbo",
      "turbo-16k",
    ].includes(model)
  )
    model = "v3";
  if (!content) throw new Error("Please specify a question!");

  const url = new URL(`https://hercai.onrender.com/${model}/hercai`);
  url.searchParams.append("question", content);
  if (personality) {
    url.searchParams.append("personality", personality);
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
    });
    if (!response?.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

/**
 * Tell Artificial Intelligence What You Want to Draw.
 * @param {string} model "v1" , "v2" , "v2-beta" , "v3" (DALL-E) , "lexica" , "prodia", "simurg", "animefy", "raava", "shonin"
 * @param {string} prompt Tell Artificial Intelligence What You Want to Draw.
 * @param {string} negative_prompt It includes the features that you do not want to be included in the output you want from artificial intelligence.
 * @example client.drawImage({model:"v3",prompt:"anime girl"})
 * @type {string} Tell Artificial Intelligence What You Want to Draw.
 * @returns {Hercai}
 * @async
 */
async function drawImage({ model = "v3", prompt, negative_prompt = "" }) {
  if (
    ![
      "v1", "v2", "v2-beta", "v3",
      "lexica", "prodia", "simurg", "animefy",
      "raava", "shonin",
    ].includes(model)
  )
    model = "prodia";
  if (!prompt) throw new Error("Please specify a prompt!");

  try {
    const response = await fetch(
      `https://hercai.onrender.com/${model}/text2image?prompt=${encodeURIComponent(prompt)}&negative_prompt=${encodeURIComponent(negative_prompt)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
      },
    );
    if (!response?.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

/**
 * This Model Is Still In Development And Beta Stage.
 * The Question You Want to Ask Artificial Intelligence.
 * @param {string} content The Question You Want to Ask Artificial Intelligence.
 * @param {string} user It includes the features that you want to be included in the output you want from artificial intelligence.
 * @example client.betaQuestion({content:"how are you?"})
 * @type {string} The Question You Want to Ask Artificial Intelligence.
 * @returns {Hercai}
 * @async
 */
async function betaQuestion({ content, personality = "", user = "" }) {
  if (!content) throw new Error("Please specify a question!");

  try {
    const response = await fetch(
      `https://hercai.onrender.com/beta/hercai?question=${encodeURIComponent(content)}&user=${encodeURIComponent(user)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          personality: personality,
        }),
      },
    );
    if (!response?.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

/**
 * This Model Is Still In Development And Beta Stage.
 * Tell Artificial Intelligence What You Want to Draw.
 * @param {string} prompt Tell Artificial Intelligence What You Want to Draw.
 * @param {string} negative_prompt It includes the features that you do not want to be included in the output you want from artificial intelligence.
 * @param {string} sampler "DPM-Solver" , "SA-Solver"
 * @param {string} image_style "Cinematic" , "Photographic" , "Anime" , "Manga" , "Digital Art" , "Pixel art" , "Fantasy art" , "Neonpunk" , "3D Model" , "Null"
 * @param {number} width The width of the image you want to draw.
 * @param {number} height The height of the image you want to draw.
 * @param {number} steps The number of steps you want to draw the image.
 * @param {number} scale The scale of the image you want to draw.
 * @example client.betaDrawImage({prompt:"anime girl"})
 * @type {string} Tell Artificial Intelligence What You Want to Draw.
 * @returns {Hercai}
 * @async
 */
async function betaDrawImage({
  prompt,
  negative_prompt = "",
  sampler = "DPM-Solver",
  image_style = "Null",
  width = 1024,
  height = 1024,
  steps = 20,
  scale = 5,
}) {
  if (
    ![
      "DPM-Solver", "SA-Solver",
    ].includes(sampler)
  )
    sampler = "DPM-Solver";
  if (!prompt) throw new Error("Please specify a prompt!");

  try {
    const response = await fetch(
      `https://hercai.onrender.com/beta/text2image?prompt=${encodeURIComponent(prompt)}&negative_prompt=${encodeURIComponent(negative_prompt)}&sampler=${encodeURIComponent(sampler)}&image_style=${encodeURIComponent(image_style)}&width=${width}&height=${height}&steps=${steps}&scale=${scale}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
      },
    );
    if (!response?.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    throw new Error(`Error: ${err.message}`);
  }
}

module.exports = { question };
