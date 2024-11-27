import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(router);

console.log(process.env.DB_PASS);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
