import mysql from "mysql";
const connected = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pos"
});

connected.connect((err) => {
    if (err) {
        console.error('Failed Connect Database:', err.message);
    } else {
        console.log('Connected Database:');
    }
});
export default connected;