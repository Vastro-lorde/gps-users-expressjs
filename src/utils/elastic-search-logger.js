const { Client } = require("@elastic/elasticsearch");


// Elasticsearch Client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USER || "elastic",
    password: process.env.ELASTICSEARCH_PASS || "changeme",
  },
  pingTimeout: 30000,
  requestTimeout: 30000,
});

// Logger Class
class ElasticLogger {
  static async log(level, message, meta = {}) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        meta,
      };

      await esClient.index({
        index: `logs-${new Date().toISOString().slice(0, 10)}`, // logs-YYYY-MM-DD
        body: logEntry,
      });
    } catch (error) {
      console.error("Failed to log to Elasticsearch:", error);
    }
  }

  static info(message, meta) {
    return this.log("info", message, meta);
  }

  static warn(message, meta) {
    return this.log("warn", message, meta);
  }

  static error(message, meta) {
    return this.log("error", message, meta);
  }
}

// Express Middleware Logger
const requestLogger = (req, res, next) => {
  res.on("finish", () => {
    ElasticLogger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
    });
  });
  next();
};

module.exports = { ElasticLogger, requestLogger };