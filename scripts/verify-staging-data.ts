#!/usr/bin/env npx tsx
/**
 * Verify staging database has correct politician counts
 * Expected: 1,737 total (174 TDs, 60 Senators, 949 ROI Councillors, 93 MLAs, 461 NI Councillors)
 */

const STAGING_URL = "https://phifyhudywiuqgwezumh.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWZ5aHVkeXdpdXFnd2V6dW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTIxNzgsImV4cCI6MjA3ODE4ODE3OH0.VC_keEUD3OAxfrss0TI5EAQvwkkB_wU2D67KH-3mA48";

interface ExpectedCounts {
  total: number;
  TDs: number;
  Senators: number;
  ROICouncillors: number;
  MLAs: number;
  NICouncillors: number;
}

const EXPECTED: ExpectedCounts = {
  total: 1737,
  TDs: 174,
  Senators: 60,
  ROICouncillors: 949,
  MLAs: 93,
  NICouncillors: 461,
};

async function getCount(filter?: string): Promise<number> {
  const url = `${STAGING_URL}/rest/v1/politicians?select=id${filter ? `&${filter}` : ""}`;
  const response = await fetch(url, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      Prefer: "count=exact",
    },
  });

  const contentRange = response.headers.get("content-range");
  if (!contentRange) throw new Error("No content-range header");

  const match = contentRange.match(/\/(\d+)$/);
  if (!match) throw new Error(`Invalid content-range: ${contentRange}`);

  return parseInt(match[1], 10);
}

async function main() {
  console.log("=== Staging Database Verification ===\n");

  const results: { name: string; expected: number; actual: number; pass: boolean }[] = [];

  // Total count
  const total = await getCount();
  results.push({ name: "Total Politicians", expected: EXPECTED.total, actual: total, pass: total === EXPECTED.total });

  // TDs
  const tds = await getCount("position_type=eq.TD");
  results.push({ name: "TDs", expected: EXPECTED.TDs, actual: tds, pass: tds === EXPECTED.TDs });

  // Senators
  const senators = await getCount("position_type=eq.Senator");
  results.push({ name: "Senators", expected: EXPECTED.Senators, actual: senators, pass: senators === EXPECTED.Senators });

  // Councillors (ROI + NI)
  const councillors = await getCount("position_type=eq.Councillor");
  const expectedCouncillors = EXPECTED.ROICouncillors + EXPECTED.NICouncillors;
  results.push({ name: "Councillors (ROI+NI)", expected: expectedCouncillors, actual: councillors, pass: councillors === expectedCouncillors });

  // MLAs
  const mlas = await getCount("position_type=eq.MLA");
  results.push({ name: "MLAs", expected: EXPECTED.MLAs, actual: mlas, pass: mlas === EXPECTED.MLAs });

  // Print results
  let allPassed = true;
  for (const r of results) {
    const status = r.pass ? "✓ PASS" : "✗ FAIL";
    console.log(`${status} | ${r.name}: ${r.actual} (expected ${r.expected})`);
    if (!r.pass) allPassed = false;
  }

  console.log("\n" + "=".repeat(40));
  if (allPassed) {
    console.log("✓ ALL TESTS PASSED - Staging data is correct!");
    process.exit(0);
  } else {
    console.log("✗ SOME TESTS FAILED - Data mismatch detected");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
