import { GoogleGenAI } from "@google/genai";
import { CarDetails, ValuationResult, GroundingChunk } from "../types";
import { sanitizeHistoricalData } from "../utils/dataSanitizer";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeCarValue = async (
  car: CarDetails,
  historyContext: string
): Promise<ValuationResult> => {
  const modelId = "gemini-2.5-flash";

  // SECURITY: Sanitize historical data before sending to API
  // This protects proprietary P&L information by sending only insights, not raw data
  const sanitizedHistory = sanitizeHistoricalData(historyContext, {
    brand: car.brand,
    model: car.model
  });

  const prompt = `
    You are an expert used car valuator specifically for the **Indian Automotive Market**.
    
    TASK:
    Analyze the car details and provide a specific, fair DEALER BUYING price range (what I should pay to buy this car).
    
    1. **Search Phase**: 
       Use Google Search to find real-time listings for this specific car in India.
       Target websites like **CarWale, CarDekho, Spinny, OLX Autos, Droom, and ZigWheels**.
       Find the original Ex-Showroom price for the ${car.year} model.
       
    2. **Analysis Phase**:
       - Look for the 'Market Selling Price' (what dealers sell for).
       - Subtract a dealer margin (typically 10-15%) + refurbishment costs to arrive at the 'Dealer Buy Price'.
       - Adjust for KM driven (${car.kmDriven} km) and Ownership (${car.ownership}).
       - Consider the Fuel type (${car.fuel}) and Location (${car.location}) demand.

    3. **Historical Data Integration**:
       ${sanitizedHistory}
       Use these insights to inform your recommendation, but rely primarily on current market data.
    
    INPUT CAR DETAILS:
    - Brand: ${car.brand}
    - Model: ${car.model}
    - Variant: ${car.variant}
    - Year: ${car.year}
    - Fuel: ${car.fuel}
    - Transmission: ${car.transmission}
    - Ownership: ${car.ownership}
    - Driven: ${car.kmDriven} km
    - Location: ${car.location} (India)

    OUTPUT FORMAT:
    - Provide a detailed reasoning referencing specific Indian market trends.
    - At the VERY END, output this EXACT JSON block:
    ||VALUATION_DATA|{"min": 500000, "max": 550000, "currency": "INR", "originalMsrp": "₹9.5 Lakhs (Ex-Showroom 2018)"}||
    
    Important: 
    - Currency must be INR. 
    - Use Lakhs/Crores in text. 
    - The numbers in the JSON must be raw integers (e.g. 500000 not 5,00,000).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Parse the special block
    const regex = /\|\|VALUATION_DATA\|(.*?)\|\|/;
    const match = text.match(regex);
    
    let priceData = {
      min: 0,
      max: 0,
      currency: "INR",
      originalMsrp: "Unknown"
    };

    if (match && match[1]) {
      try {
        priceData = JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse valuation JSON block", e);
      }
    }

    // Remove the data block from the reasoning text for cleaner display
    const cleanReasoning = text.replace(regex, "").trim();

    return {
      priceBand: {
        min: priceData.min,
        max: priceData.max,
        currency: priceData.currency,
      },
      originalMsrp: priceData.originalMsrp,
      reasoning: cleanReasoning,
      groundingSources: groundingChunks,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze car value. Please try again.");
  }
};