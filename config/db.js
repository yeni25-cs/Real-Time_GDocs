const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "real-time_gdocs"
});

db.connect((err) => {
    if (err) {
        console.log("Koneksi gagal:", err);
        return;
    }

    console.log("MySQL Connected");
});

module.exports = db;