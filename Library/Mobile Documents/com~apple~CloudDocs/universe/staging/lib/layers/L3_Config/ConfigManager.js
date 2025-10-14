// L3 Configuration Management - Config Manager
class ConfigManager {
  constructor() {
    this.config = {}
    this.environment = process.env.NODE_ENV || 'development'
  }

  getConfig() {
    return this.config
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    return this.config
  }
}

module.exports = ConfigManager

