import { GoogleGenAI } from "@google/genai";
import { CarDetails, ValuationResult, GroundingChunk } from "../types";
import { sanitizeHistoricalData, estimateTokens } from "../utils/dataSanitizer";
import { getCachedResult, cacheResult } from "../utils/cacheManager";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeCarValue = async (
  car: CarDetails,
  historyContext: string
): Promise<ValuationResult> => {
  const modelId = "gemini-2.5-flash";

  // OPTIMIZATION: Check cache first
  const cachedResult = getCachedResult(car);
  if (cachedResult) {
    console.log('✅ Cache hit! Using cached result.');
    return cachedResult;
  }

  // SECURITY: Sanitize historical data before sending to API
  // OPTIMIZATION: This also reduces token count by 99%
  const sanitizedHistory = sanitizeHistoricalData(historyContext, {
    brand: car.brand,
    model: car.model
  });

  // Log token estimates
  const estimatedTokens = estimateTokens(sanitizedHistory);
  console.log(`📊 Estimated tokens for historical data: ${estimatedTokens}`);

  // OPTIMIZED PROMPT: Reduced tokens + STRICTER VALUATION LOGIC
  const prompt = `You are a TOUGH, CONSERVATIVE used car buyer for a dealership in India.

TASK: Determine the SAFE DEALER BUYING PRICE. Your goal is to protect the dealer's profit.
It is better to quote TOO LOW than too high.

SEARCH STRATEGY:
1. Find the LOWEST listed prices for this car on CarWale, CarDekho, OLX.
2. Assume actual transaction prices are 5-10% LOWER than online listings.

VALUATION FORMULA (Apply Strictly):
1. Start with the estimated Market Transaction Price (not asking price).
2. DEDUCT Dealer Margin: MINIMUM 15-20% (for profit + risk).
3. DEDUCT Refurbishment: MINIMUM ₹15,000 - ₹25,000 (tires, paint, service).
4. DEDUCT Ownership Penalty:
   - 2nd Owner: -10%
   - 3rd Owner: -20%
5. DEDUCT Mileage Penalty: If >15k km/year, deduct extra.

HISTORICAL CONTEXT:
${sanitizedHistory}

CAR DETAILS:
${car.brand} ${car.model} ${car.variant}
Year: ${car.year} | Fuel: ${car.fuel} | Transmission: ${car.transmission}
Ownership: ${car.ownership} | KM: ${car.kmDriven} | Location: ${car.location}

OUTPUT:
- Explain your calculation: "Listing price ₹X, minus 10% negotiation = ₹Y. Minus 15% margin = ₹Z. Minus ₹20k work..."
- Be direct and conservative.
- End with EXACT JSON: ||VALUATION_DATA|{"min": 400000, "max": 425000, "currency": "INR", "originalMsrp": "₹9.5L (Ex-Showroom 2018)"}||

Note: Currency=INR, use Lakhs/Crores in text, JSON numbers as integers.`;

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

    const result: ValuationResult = {
      priceBand: {
        min: priceData.min,
        max: priceData.max,
        currency: priceData.currency,
      },
      originalMsrp: priceData.originalMsrp,
      reasoning: cleanReasoning,
      groundingSources: groundingChunks,
    };

    // OPTIMIZATION: Cache the result
    cacheResult(car, result);
    console.log('💾 Result cached for 24 hours');

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze car value. Please try again.");
  }
};