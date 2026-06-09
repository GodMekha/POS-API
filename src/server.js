import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./router/index.js";
const app = express()
const port = 3000 || 5000
import "./config/db_mysql.js"
app.use(cors());
app.use(bodyParser.json({extended: true, parameterLimit: 5000, limit: "500mb"}))
app.use(bodyParser.urlencoded({extended: true, parameterLimit: 5000, limit: "500mb"}))
app.use("/api/v1",router)
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
});