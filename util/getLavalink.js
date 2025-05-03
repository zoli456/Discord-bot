/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @returns {import("erela.js").Node | undefined}
 */
export default async (client) => {
  return new Promise((resolve) => {
    for (let i = 0; i < client.manager.NodeManager.nodes.size; i++) {
      client.manager.nodes.forEach((node) => {
        if (node.connected) resolve(node);
      });
    }
    resolve(undefined);
  });
};
