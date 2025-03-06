const colors = require("@colors/colors");
const { format, createLogger, transports } = require("winston");

class Logger {
  constructor(file) {
    this.logger = createLogger({
      format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:MM:SS" }), format.json()),
      transports: [
        new transports.File({ filename: file }),
      ],
    });
  }

  log(Text) {
    let d = new Date();
    this.logger.log({
      level: "info",
      message: "info: " + Text,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${
          d.getMonth() + 1
        }:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`,
      ) + colors.green(" | " + Text),
    );
  }

  warn(Text) {
    let d = new Date();
    this.logger.log({
      level: "warn",
      message: "warn: " + Text,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${
          d.getMonth() + 1
        }:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`,
      ) + colors.yellow(" | " + Text),
    );
  }

  error(Text) {
    let d = new Date();
    this.logger.log({
      level: "error",
      message: "error: " + Text,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${
          d.getMonth() + 1
        }:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`,
      ) + colors.red(" | " + Text),
    );
  }
}

module.exports = Logger;
