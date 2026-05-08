import app from "./app.js";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ClickBot v3 (@google/genai) em http://localhost:${PORT}`);
});
