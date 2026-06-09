import dotenv from "dotenv";
dotenv.config()
const SECREAT_KEY = process.env.SECREAT_KEY;
const SECREAT_KEY_REFRESH = process.env.SECREAT_KEY_REFRESH;
export {
    SECREAT_KEY, SECREAT_KEY_REFRESH,
}