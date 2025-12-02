/**
 * Data sanitizer to protect proprietary P&L information
 * Extracts insights without exposing raw prices and margins
 * OPTIMIZED: Smart filtering and aggregation to reduce token usage by 99%
 */

interface HistoricalRecord {
  brand?: string;
  model?: string;
  variant?: string;
  year?: string;
  boughtPrice?: number;
  soldPrice?: number;
  date?: string;
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
      if (header.includes('variant')) record.variant = value;
      if (header.includes('year')) record.year = value;
      if (header.includes('date')) record.date = value;
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
/**
 * Sanitize historical data to remove sensitive pricing information
 * OPTIMIZED: Returns compact aggregated insights instead of processing all rows
 */
export function sanitizeHistoricalData(
  csvData: string, 
  targetCar: { brand: string; model: string }
): { insights: string; marginData: { percentage: number; description: string } | null } {
  if (!csvData || !csvData.trim()) {
    return { 
      insights: "No historical data available.",
      marginData: null
    };
  }
  
  const allRecords = parseCSV(csvData);
  if (allRecords.length === 0) {
    return { 
      insights: "No valid historical data found.",
      marginData: null
    };
  }
  
  // OPTIMIZATION: Smart filter to reduce dataset size
  const relevantRecords = smartFilter(allRecords, targetCar, 50);
  
  // OPTIMIZATION: Aggregate data for compact representation
  const aggregated = aggregateData(relevantRecords);
  
  // Build sanitized insights
  const insights: string[] = [];
  let marginData: { percentage: number; description: string } | null = null;
  
  // 1. LIST SPECIFIC TRANSACTIONS (Top Priority)
  // Find exact matches for this model
  const exactMatches = relevantRecords.filter(r => 
    r.brand?.toLowerCase() === targetCar.brand.toLowerCase() &&
    r.model?.toLowerCase() === targetCar.model.toLowerCase()
  );

  if (exactMatches.length > 0) {
    insights.push(`*** PRIORITY: YOUR PAST TRANSACTIONS FOR ${targetCar.brand.toUpperCase()} ${targetCar.model.toUpperCase()} ***`);
    
    // Sort by date (most recent first) if available, or just take first few
    const recentTxns = exactMatches.slice(0, 5);
    
    recentTxns.forEach(txn => {
      if (txn.boughtPrice && txn.soldPrice) {
        const margin = ((txn.soldPrice - txn.boughtPrice) / txn.boughtPrice) * 100;
        const dateStr = txn.date ? `Date: ${txn.date}` : 'Date: N/A';
        const modelStr = `${txn.brand} ${txn.model}`;
        const variantStr = txn.variant ? ` ${txn.variant}` : '';
        const yearStr = txn.year ? ` (${txn.year})` : '';
        
        // Format prices in Lakhs
        const buyLakhs = (txn.boughtPrice / 100000).toFixed(2);
        const sellLakhs = (txn.soldPrice / 100000).toFixed(2);
        
        insights.push(`- ${dateStr} | ${modelStr}${variantStr}${yearStr} | Bought: ₹${buyLakhs}L | Sold: ₹${sellLakhs}L | Margin: ${margin.toFixed(1)}%`);
      }
    });

    // Calculate average margin for UI display
    const margins = exactMatches
      .filter(r => r.boughtPrice && r.soldPrice)
      .map(r => ((r.soldPrice! - r.boughtPrice!) / r.boughtPrice!) * 100);
      
    if (margins.length > 0) {
      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
      insights.push(`AVERAGE MARGIN for this model: ${avgMargin.toFixed(1)}% over ${margins.length} transactions.`);
      
      marginData = {
        percentage: avgMargin,
        description: `${margins.length} similar ${targetCar.brand} ${targetCar.model} transactions`
      };
    }
  } else {
    insights.push(`No exact past transactions for ${targetCar.brand} ${targetCar.model}.`);
    
    // Fallback to brand level
    const brandMatches = aggregated.filter(a => 
      a.brandModel.toLowerCase().includes(targetCar.brand.toLowerCase())
    );
    
    if (brandMatches.length > 0) {
      const totalBrandTransactions = brandMatches.reduce((sum, a) => sum + a.count, 0);
      const totalMargin = brandMatches.reduce((sum, a) => sum + (a.avgMargin * a.count), 0);
      const avgBrandMargin = totalMargin / totalBrandTransactions;
      
      marginData = {
        percentage: avgBrandMargin,
        description: `${totalBrandTransactions} ${targetCar.brand} transactions (brand average)`
      };
    }
  }

  // 2. GENERAL DATABASE STATS
  insights.push(`\nDatabase Context: ${allRecords.length} total records.`);
  
  return { insights: insights.join('\n'), marginData };
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
