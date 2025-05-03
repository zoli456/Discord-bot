export default async () => {
  try {
    const devConfig = await import("../dev-config.js");
    return devConfig.default;
  } catch {
    try {
      const prodConfig = await import("../config.js");
      return prodConfig.default;
    } catch {
      throw new Error("No config file found.");
    }
  }
};
