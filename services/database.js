const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.MYHOST || process.env.MYSQLHOST,
    user: process.env.MYUSER || process.env.MYSQLUSER,
    password: process.env.MYPASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.MYDATABASE || process.env.MYSQLDATABASE,
    port: process.env.MYPORT || process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db.promise();