// lib/fuzzy.ts
export function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Levenshtein distance
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  const similarity = 1 - (distance / maxLen);
  
  return Math.max(0, Math.min(1, similarity));
}

function levenshteinDistance(s1: string, s2: string): number {
  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= s1.length; i++) track[0][i] = i;
  for (let j = 0; j <= s2.length; j++) track[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  return track[s2.length][s1.length];
}

export function calculateClusterRisk(transactions: any[], rules: any[]): number {
  let riskScore = 0;
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    if (rule.rule_type === 'exact_match') {
      const vendorMatches = transactions.filter(t => 
        t.vendor.toLowerCase() === rule.vendor_pattern.toLowerCase()
      );
      if (vendorMatches.length > 1) riskScore += 50;
    }
    
    if (rule.rule_type === 'fuzzy_match') {
      const fuzzyMatches = transactions.filter(t =>
        fuzzyMatch(t.vendor, rule.vendor_pattern) > 0.75
      );
      if (fuzzyMatches.length > 1) riskScore += 30;
    }
    
    if (rule.rule_type === 'custom') {
      const sameAmount = transactions.filter(t => t.amount === transactions[0].amount).length;
      const daysApart = Math.abs(
        (new Date(transactions[0].date).getTime() - 
         new Date(transactions[1]?.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (sameAmount > 1 && daysApart <= rule.days_apart_threshold) {
        riskScore += 20;
      }
    }
  }
  
  return Math.min(100, riskScore);
}
