import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const APP_CONSTANTS = {
  APP_NAME: "News Aggregation System",
  VERSION: "1.0.0",
  WELCOME_MESSAGE: "Welcome to the News Aggregation Console Client!",
};
