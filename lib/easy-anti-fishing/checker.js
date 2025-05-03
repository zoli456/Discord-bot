const Reg = new RegExp("(?:[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?.)+[A-z0-9][A-z0-9-]{0,61}[A-z0-9]");

export async function check(message) {
  if (!message) throw new Error("Please provide a valid message.");
  message = message.toString();

  if (!message.match(Reg))
    throw new Error(
      "The message does not match RegEx (no links found inside the message provided).",
    );

  try {
    const response = await fetch("https://anti-fish.bitflow.dev/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response?.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (err) {
    return { match: false };
  }
}

export function getCurrentRegExp() {
  return Reg;
}
export default { check, getCurrentRegExp };
