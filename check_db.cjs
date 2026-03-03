
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

const stakes = db.prepare("SELECT * FROM farm_stakes").all();
console.log("Stakes:", stakes);

const users = db.prepare("SELECT * FROM users").all();
console.log("Users:", users);
