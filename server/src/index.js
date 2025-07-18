import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Server Error ", err);
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server Listening ");
    });
  })
  .catch((err) => {
    console.log("DB Connection Error ", err);
  });
