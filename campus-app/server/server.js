
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    const response = await ai.models.generateContent({
     model: "gemini-3.5-flash-lite",
      contents: message,
      config: {
        systemInstruction:
          "You are CampusBot AI, a helpful assistant for MITS Gwalior students. Answer in simple English or Hindi according to the user's language. Help with academics, college life, events, clubs and study guidance. Do not invent official college information.",
      },
    });

    res.json({
      reply: response.text,
    });

  
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Status:", error.status);
    console.error("Full Error:", error);
    console.error("==================================");

    res.status(500).json({
      error: "Sorry, CampusBot could not respond. Please try again.",
    });
  }
});


app.listen(process.env.PORT || 5000, () => {
  console.log("CampusBot server running on port 5000");
});
