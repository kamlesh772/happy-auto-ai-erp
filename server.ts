import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not configured or has default value. AI features will run in Demo/Fallback Mode.");
}

// 1. Business Insights API
app.post("/api/ai/insights", async (req, res) => {
  const { salesData, lowStockCount, jobCount, activeRole } = req.body;
  
  if (!ai) {
    // Elegant simulated fallback
    return res.json({
      summary: "Demo Mode: Happy Auto ERP recommends checking Exide Batteries which are running low (only 4 left). Today's POS billing indicates strong UPI payment trends.",
      recommendations: [
        "Restock Exide 35Ah Batteries as 3 vehicles are currently booked with electrical complaints.",
        "Consider offering a monsoon/summer service discount to increase service job card flow.",
        "A 5% discount on Castrol Magnatec can speed up clearance of slow-moving lubricants."
      ]
    });
  }

  try {
    const prompt = `
      You are the Master AI Consultant for Happy Auto ERP, a professional automotive parts and service center ERP.
      Provide high-quality business insights for the Shop Owner/Manager based on the current stats:
      - Total Monthly Sales: ${salesData?.monthlySales || "$0"}
      - Today's Sales: ${salesData?.todaySales || "$0"}
      - Low Stock Items: ${lowStockCount || 0}
      - Active Job Cards in Service Bay: ${jobCount || 0}
      - Requestor Role: ${activeRole || "Shop Owner"}

      Provide your response in JSON format (do not wrap in markdown unless requested, but a standard JSON structure is required). 
      Format exactly as:
      {
        "summary": "A 2-3 sentence overview of business performance, mentioning strengths and active bottlenecks.",
        "recommendations": [
          "Recommendation 1 with automotive focus",
          "Recommendation 2 with automotive focus",
          "Recommendation 3 with automotive focus"
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Insights API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI insights." });
  }
});

// 2. Inventory restock prediction API
app.post("/api/ai/inventory-predict", async (req, res) => {
  const { categories, productsList } = req.body;

  if (!ai) {
    return res.json({
      recommendations: [
        { part: "Brake Pads Set (Hyundai i20)", confidence: "High", reason: "Castrol lubricant sales and brake service job cards are on the rise this month." },
        { part: "Exide Battery 35Ah (Maruti Swift)", confidence: "Medium", reason: "Electrical complaints usually spike during high heat/monsoon seasons." }
      ]
    });
  }

  try {
    const prompt = `
      You are an expert automotive parts inventory analyst. Suggest 2-3 high-probability parts to restock based on the list of current products:
      ${JSON.stringify(productsList || [])}

      Generate an elegant JSON response with recommendations format exactly as:
      {
        "recommendations": [
          { "part": "Part Name", "confidence": "High|Medium", "reason": "Justification based on vehicle model, category and stock levels" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Inventory Prediction API Error:", error);
    res.status(500).json({ error: error.message || "Failed to predict inventory needs." });
  }
});

// 3. Interactive Advisor Chat API
app.post("/api/ai/chat", async (req, res) => {
  const { messages, context } = req.body;

  if (!ai) {
    return res.json({
      reply: "Demo Mode Response: Happy Auto AI ERP here! I can suggest parts for Maruti Swift, suggest invoice discounts, or check your current 3 low-stock items. (To activate full AI, please configure GEMINI_API_KEY in the Secrets panel)."
    });
  }

  try {
    const conversation = (messages || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Inject system context to guide response
    const systemPrompt = `
      You are "Happy Auto AI Advisor", a friendly, brilliant automobile workshop and auto parts ERP assistant. 
      You speak fluently in English and optionally Hindi (using clean Hinglish or standard Hindi script if requested).
      You are helping a shop operator manage billing, parts stock, vehicle repairs, and invoices.
      
      Keep answers highly practical, concise, and professional. Do not use complex system logs or formatting. Mention real spare parts brands like Bosch, Castrol, Lumax, Brembo, Exide.
      Current App Context:
      - Shop Name: Happy Auto Garage & Spares
      - Low Stock Parts Count: ${context?.lowStockCount || 0}
      - Open Service Jobs: ${context?.jobCount || 0}
    `;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      history: conversation.slice(0, -1) // All except last message
    });

    const lastMessage = messages[messages.length - 1]?.content || "Hello";
    const response = await chat.sendMessage({ message: lastMessage });
    
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "Apologies, I encountered an issue analyzing that request. Please try again shortly!" });
  }
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
