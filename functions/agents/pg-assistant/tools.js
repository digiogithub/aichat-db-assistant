const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// scan the directory for all .pem files and if any exists then use it as ssl configuration
let ssl_config = {};
const files = fs.readdirSync(__dirname);
const pemFiles = files.filter((file) => file.endsWith(".pem"));
if (pemFiles.length > 0) {
  ssl_config = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, pemFiles[0])).toString(),
  };
}

/**
 * Gets the postgres database schema
 */
exports.get_schema = async function getSchema() {
  
  
  const pool = new Pool({
    user: process.env.PG_ASSISTANT_DB_USER,
    host: process.env.PG_ASSISTANT_DB_HOST,
    database: process.env.PG_ASSISTANT_DB_NAME,
    password: process.env.PG_ASSISTANT_DB_PASSWORD,
    port: parseInt(process.env.PG_ASSISTANT_DB_PORT), // Convert to number if needed
    ssl: ssl_config,
  });


  const obtenerSchema = async () => {
    try {
      const resultado = await pool.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
      `);

      const final_string = resultado.rows
        .map((row) => {
          return JSON.stringify(row);
        })
        .join("\n");

      return final_string;
    } catch (error) {
      return error;
    }
  };

  return obtenerSchema();
};

/**
 * Execute the query
 * @typedef {Object} Args
 * @property {string} query - Postgres query to execute
 * @param {Args} args
 */
exports.execute_query = async function executeQuery({ query }) {
  const pool = new Pool({
    user: process.env.PG_ASSISTANT_DB_USER,
    host: process.env.PG_ASSISTANT_DB_HOST,
    database: process.env.PG_ASSISTANT_DB_NAME,
    password: process.env.PG_ASSISTANT_DB_PASSWORD,
    port: parseInt(process.env.PG_ASSISTANT_DB_PORT),
    ssl: ssl_config,
  });

  const getResult = async (query) => {
    try {
      const resultado = await pool.query(query);

      const final_string = resultado.rows
        .map((row) => {
          return JSON.stringify(row);
        })
        .join("\n");

      return final_string;
    } catch (error) {
      return error;
    }
  };

  return getResult(query);
};
