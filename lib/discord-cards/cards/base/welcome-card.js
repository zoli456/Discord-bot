import { BaseCardBuilder } from "./base-card.js";

/**
 * Default configuration for welcome cards (blue theme)
 */
const WELCOME_DEFAULTS = Object.freeze({
  mainText: { content: "WELCOME" },
  avatarBorderColor: "#0CA7FF",
  colorTextDefault: "#0CA7FF",
  backgroundColor: {
    background: "#FFFFFF",
    waves: "#0CA7FF",
  },
});

/**
 * Default configuration for leave cards (red theme)
 */
const LEAVE_DEFAULTS = Object.freeze({
  mainText: { content: "LEAVE" },
  avatarBorderColor: "#F44336",
  colorTextDefault: "#F44336",
  backgroundColor: {
    background: "#FFFFFF",
    waves: "#F44336",
  },
});

/**
 * Builder for creating welcome cards with customizable options
 * @extends BaseCardBuilder
 */
export class WelcomeBuilder extends BaseCardBuilder {
  /**
   * Create a WelcomeBuilder instance
   * @param {Object} [params={}] - Configuration options
   */
  constructor(params = {}) {
    super({ ...WELCOME_DEFAULTS, ...params });
  }
}

/**
 * Builder for creating leave cards with customizable options
 * @extends BaseCardBuilder
 */
export class LeaveBuilder extends BaseCardBuilder {
  /**
   * Create a LeaveBuilder instance
   * @param {Object} [params={}] - Configuration options
   */
  constructor(params = {}) {
    super({ ...LEAVE_DEFAULTS, ...params });
  }
}
