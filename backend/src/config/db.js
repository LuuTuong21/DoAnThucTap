const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "TuQuocBao147204@",
    database: "task_manager"
});

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed");
        console.error(err);
        return;
    }

    console.log("MySQL Connected!");
});

module.exports = connection;