/**
 * Data sanitizer to protect proprietary P&L information
 * Extracts insights without exposing raw prices and margins
 * OPTIMIZED: Smart filtering and aggregation to reduce token usage by 99%
 */

interface HistoricalRecord {
  brand?: string;
  model?: string;
  year?: string;
  boughtPrice?: number;
  soldPrice?: number;
}

interface AggregatedData {
  brandModel: string;
  count: number;
  avgMargin: number;
  years: string[];
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
 * Calculate relevance score for a record compared to target car
 */
function calculateRelevance(record: HistoricalRecord, target: { brand: string; model: string }): number {
  let score = 0;
  
  // Exact brand match
  if (record.brand?.toLowerCase() === target.brand.toLowerCase()) {
    score += 50;
  }
  
  // Exact model match
  if (record.model?.toLowerCase() === target.model.toLowerCase()) {
    score += 100;
  }
  
  // Partial model match
  if (record.model && target.model) {
    const recordModel = record.model.toLowerCase();
    const targetModel = target.model.toLowerCase();
    if (recordModel.includes(targetModel) || targetModel.includes(recordModel)) {
      score += 75;
    }
  }
  
  return score;
}

/**
 * Smart filter: Only keep most relevant records
 * Reduces 8000 rows to ~50 most relevant records
 */
function smartFilter(records: HistoricalRecord[], target: { brand: string; model: string }, maxRecords: number = 50): HistoricalRecord[] {
  // Score and sort by relevance
  const scored = records
    .map(record => ({
      record,
      score: calculateRelevance(record, target)
    }))
    .filter(item => item.score > 0) // Only keep relevant records
    .sort((a, b) => b.score - a.score); // Sort by relevance
  
  // Take top N records
  return scored.slice(0, maxRecords).map(item => item.record);
}

/**
 * Aggregate records by brand+model for compact representation
 */
function aggregateData(records: HistoricalRecord[]): AggregatedData[] {
  const groups = new Map<string, HistoricalRecord[]>();
  
  // Group by brand+model
  records.forEach(record => {
    const key = `${record.brand || 'Unknown'} ${record.model || 'Unknown'}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });
  
  // Aggregate each group
  const aggregated: AggregatedData[] = [];
  groups.forEach((groupRecords, brandModel) => {
    const margins = groupRecords
      .filter(r => r.boughtPrice && r.soldPrice && r.boughtPrice > 0)
      .map(r => ((r.soldPrice! - r.boughtPrice!) / r.boughtPrice!) * 100);
    
    const years = [...new Set(groupRecords.map(r => r.year).filter(Boolean))];
    
    if (margins.length > 0) {
      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
      aggregated.push({
        brandModel,
        count: groupRecords.length,
        avgMargin,
        years: years as string[]
      });
    }
  });
  
  return aggregated.sort((a, b) => b.count - a.count); // Sort by transaction count
}

/**
 * Sanitize historical data to remove sensitive pricing information
 * OPTIMIZED: Returns compact aggregated insights instead of processing all rows
 */
export function sanitizeHistoricalData(csvData: string, targetCar: { brand: string; model: string }): string {
  if (!csvData || !csvData.trim()) {
    return "No historical data available.";
  }
  
  const allRecords = parseCSV(csvData);
  if (allRecords.length === 0) {
    return "No valid historical data found.";
  }
  
  // OPTIMIZATION: Smart filter to reduce dataset size
  const relevantRecords = smartFilter(allRecords, targetCar, 50);
  
  // OPTIMIZATION: Aggregate data for compact representation
  const aggregated = aggregateData(relevantRecords);
  
  // Build sanitized insights
  const insights: string[] = [];
  
  // Total database size (for context)
  insights.push(`Database: ${allRecords.length} total transactions.`);
  
  if (aggregated.length === 0) {
    insights.push(`No relevant matches found for ${targetCar.brand} ${targetCar.model}.`);
    return insights.join(' ');
  }
  
  // Find exact or close matches
  const exactMatch = aggregated.find(a => 
    a.brandModel.toLowerCase().includes(targetCar.brand.toLowerCase()) &&
    a.brandModel.toLowerCase().includes(targetCar.model.toLowerCase())
  );
  
  if (exactMatch) {
    insights.push(`${exactMatch.brandModel}: ${exactMatch.count} transactions, ${exactMatch.avgMargin.toFixed(1)}% avg margin.`);
    
    if (exactMatch.avgMargin > 15) {
      insights.push(`Highly profitable model.`);
    } else if (exactMatch.avgMargin > 8) {
      insights.push(`Moderate profitability.`);
    } else {
      insights.push(`Lower margin model.`);
    }
    
    if (exactMatch.years.length > 0) {
      insights.push(`Years: ${exactMatch.years.slice(0, 5).join(', ')}.`);
    }
  } else {
    // Show brand-level data
    const brandMatches = aggregated.filter(a => 
      a.brandModel.toLowerCase().includes(targetCar.brand.toLowerCase())
    );
    
    if (brandMatches.length > 0) {
      const totalBrandTransactions = brandMatches.reduce((sum, a) => sum + a.count, 0);
      insights.push(`${targetCar.brand}: ${totalBrandTransactions} transactions across ${brandMatches.length} models.`);
      
      // Show top 2 models
      brandMatches.slice(0, 2).forEach(a => {
        insights.push(`${a.brandModel}: ${a.count} txns, ${a.avgMargin.toFixed(1)}% margin.`);
      });
    } else {
      insights.push(`No ${targetCar.brand} transactions found.`);
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

/**
 * Estimate token count for text (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
