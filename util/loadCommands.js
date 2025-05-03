import { join } from "path";
import { readdir } from "fs/promises";
import { ApplicationCommandType } from "discord.js";

const validateCommand = (cmd, file, type) => {
  if (!cmd) {
    console.log(`Unable to load Command: ${file}, File is empty`);
    return false;
  }

  if (type === "context") {
    // Handle context commands (both standard and custom formats)
    if (!cmd.command && !cmd.data && !cmd.toJSON) {
      console.log(`Unable to load Context Command: ${file}, Missing required properties`);
      return false;
    }
  } else if (type === "slash") {
    // Handle slash commands (both standard and custom formats)
    if (!cmd.data && !cmd.toJSON && !cmd.slash) {
      console.log(`Unable to load Slash Command: ${file}, Missing required properties`);
      return false;
    }
  }

  return true;
};

const getCommandData = (cmd, type) => {
  // Handle custom SlashCommand class instances
  if (typeof cmd?.toJSON === "function") {
    return cmd.toJSON();
  }

  // Handle standard Discord.js structures
  if (type === "context") {
    return cmd.command || cmd.data;
  }

  return cmd.data || cmd.slash || cmd;
};

const LoadDirectory = async (dir) => {
  const commands = [];
  const CommandsDir = join(process.cwd(), "commands", dir);

  try {
    const files = (await readdir(CommandsDir)).filter((file) => file.endsWith(".js"));

    for (const file of files) {
      try {
        const cmdModule = await import(`file://${join(CommandsDir, file)}`);
        const cmd = cmdModule.default;

        if (!validateCommand(cmd, file, dir)) continue;

        const commandData = getCommandData(cmd, dir);
        if (!commandData) {
          console.log(`Skipping ${file} - no valid command data found`);
          continue;
        }

        commands.push(commandData);
      } catch (err) {
        console.error(`Error loading command ${file}:`, err);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }

  return commands;
};

export const LoadCommands = async () => {
  const slash = await LoadDirectory("slash");
  const context = await LoadDirectory("context");
  return { slash, context };
};

export default LoadCommands;
