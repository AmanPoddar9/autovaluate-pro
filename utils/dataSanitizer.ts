/**
 * Data sanitizer to protect proprietary P&L information
 * Extracts insights without exposing raw prices and margins
 */

interface HistoricalRecord {
  brand?: string;
  model?: string;
  year?: string;
  boughtPrice?: number;
  soldPrice?: number;
}

/**
 * Parse CSV data into structured records
 */
function parseCSV(csvData: string): HistoricalRecord[] {
  if (!csvData.trim()) return [];
  
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return []; // Need at least header + 1 row
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const records: HistoricalRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record: HistoricalRecord = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (header.includes('brand')) record.brand = value;
      if (header.includes('model')) record.model = value;
      if (header.includes('year')) record.year = value;
      if (header.includes('bought') || header.includes('purchase')) {
        record.boughtPrice = parseFloat(value);
      }
      if (header.includes('sold') || header.includes('sale')) {
        record.soldPrice = parseFloat(value);
      }
    });
    
    records.push(record);
  }
  
  return records;
}

/**
 * Sanitize historical data to remove sensitive pricing information
 * Returns anonymized insights instead of raw data
 */
export function sanitizeHistoricalData(csvData: string, targetCar: { brand: string; model: string }): string {
  if (!csvData || !csvData.trim()) {
    return "No historical data available.";
  }
  
  const records = parseCSV(csvData);
  if (records.length === 0) {
    return "No valid historical data found.";
  }
  
  // Find similar cars (same brand/model)
  const similarCars = records.filter(r => 
    r.brand?.toLowerCase() === targetCar.brand.toLowerCase() ||
    r.model?.toLowerCase().includes(targetCar.model.toLowerCase()) ||
    targetCar.model.toLowerCase().includes(r.model?.toLowerCase() || '')
  );
  
  // Build sanitized insights
  const insights: string[] = [];
  
  // General statistics (without specific prices)
  insights.push(`Historical database contains ${records.length} transaction records.`);
  
  if (similarCars.length > 0) {
    insights.push(`Found ${similarCars.length} similar ${targetCar.brand} ${targetCar.model} transactions in your history.`);
    
    // Calculate average margin percentage (not absolute values)
    const marginsPercent = similarCars
      .filter(r => r.boughtPrice && r.soldPrice && r.boughtPrice > 0)
      .map(r => ((r.soldPrice! - r.boughtPrice!) / r.boughtPrice!) * 100);
    
    if (marginsPercent.length > 0) {
      const avgMargin = marginsPercent.reduce((a, b) => a + b, 0) / marginsPercent.length;
      insights.push(`Your historical margin on similar models averages ${avgMargin.toFixed(1)}%.`);
      
      if (avgMargin > 15) {
        insights.push(`This model has historically been highly profitable for your business.`);
      } else if (avgMargin > 8) {
        insights.push(`This model has shown moderate profitability in your past transactions.`);
      } else {
        insights.push(`This model has shown lower margins in your historical data.`);
      }
    }
    
    // Year-based insights (without prices)
    const years = similarCars.map(r => r.year).filter(Boolean);
    if (years.length > 0) {
      insights.push(`You have experience with model years: ${[...new Set(years)].join(', ')}.`);
    }
  } else {
    insights.push(`No direct matches for ${targetCar.brand} ${targetCar.model} in your transaction history.`);
    
    // Check for same brand
    const sameBrand = records.filter(r => r.brand?.toLowerCase() === targetCar.brand.toLowerCase());
    if (sameBrand.length > 0) {
      insights.push(`You have ${sameBrand.length} transactions with ${targetCar.brand} vehicles.`);
    }
  }
  
  return insights.join(' ');
}

/**
 * Check if data contains sensitive information
 */
export function containsSensitiveData(text: string): boolean {
  // Check for patterns that might indicate raw pricing data
  const sensitivePatterns = [
    /\d{5,}/,  // Large numbers (likely prices)
    /bought.*\d+/i,
    /sold.*\d+/i,
    /price.*\d+/i,
    /margin.*\d+/i,
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(text));
}
