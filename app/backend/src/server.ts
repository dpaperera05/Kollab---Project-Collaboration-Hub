import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";

const PORT = Number(process.env.BACKEND_PORT || 5000);

const app = createApp();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});