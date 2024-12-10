const mysql = require('mysql2/promise');
const fs = require("fs");
const path = require("path");

// scan the directory for all .pem files and if any exists then use it as ssl configuration
let ssl_config = {};
const files = fs.readdirSync(__dirname);
const pemFiles = files.filter((file) => file.endsWith(".pem"));
if (pemFiles.length > 0) {
  ssl_config = {
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(__dirname, pemFiles[0])).toString(),

    }
  };
}

/**
 * Gets the MySQL database schema
 */
exports.get_schema = async function getSchema() {
  const connection = await mysql.createPool({
    user: process.env.MYSQL_ASSISTANT_DB_USER,
    host: process.env.MYSQL_ASSISTANT_DB_HOST,
    database: process.env.MYSQL_ASSISTANT_DB_NAME,
    password: process.env.MYSQL_ASSISTANT_DB_PASSWORD,
    port: parseInt(process.env.MYSQL_ASSISTANT_DB_PORT),
    ...ssl_config
  });

  try {
    // Get tables and columns
    const [columns] = await connection.execute(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
    `, [process.env.MYSQL_ASSISTANT_DB_NAME]);

    // Get foreign key relationships
    const [relations] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.MYSQL_ASSISTANT_DB_NAME]);

    const schema = {
      tables: columns,
      relations: relations
    };

    return JSON.stringify(schema, null, 2);
  } catch (error) {
    return error;
  } finally {
    await connection.end();
  }
};

/**
 * Execute the query
 * @typedef {Object} Args
 * @property {string} query - MySQL query to execute
 * @param {Args} args
 */
exports.execute_query = async function executeQuery({ query }) {
  const connection = await mysql.createPool({
    user: process.env.MYSQL_ASSISTANT_DB_USER,
    host: process.env.MYSQL_ASSISTANT_DB_HOST,
    database: process.env.MYSQL_ASSISTANT_DB_NAME,
    password: process.env.MYSQL_ASSISTANT_DB_PASSWORD,
    port: parseInt(process.env.MYSQL_ASSISTANT_DB_PORT),
    ...ssl_config
  });

  try {
    const [rows] = await connection.execute(query);
    return rows.map(row => JSON.stringify(row)).join('\n');
  } catch (error) {
    return error;
  } finally {
    await connection.end();
  }
};
