/**
 * Fractional Kelly Criterion Calculator
 * 
 * Computes mathematically optimal position sizing based on verified probability edge
 * over market baseline closing odds, with configurable safety caps.
 *
 * Full Kelly Formula:
 *   f* = (b * p - q) / b
 * where:
 *   p = forecaster probability (or shrunken estimate)
 *   q = 1 - p
 *   b = net decimal odds (decimalOdds - 1)
 *
 * Or in terms of de-vigged market probability m (where decimal odds O = 1/m):
 *   f* = (p - m) / (1 - m)
 *
 * Fractional Kelly:
 *   f_adj = f* * fractionalMultiplier (typically 0.25 = Quarter Kelly)
 */

export interface KellyCalculationInput {
  bankrollSui: number;
  forecastProb: number;      // e.g. 0.65 (65%)
  marketProb: number;        // e.g. 0.52 (52% de-vigged baseline)
  decimalOdds?: number;      // optional explicit odds; if omitted, computed as 1 / marketProb
  fractionalMultiplier?: number; // default 0.25 (Quarter Kelly for bankroll preservation)
  maxBetPct?: number;        // default 0.025 (2.5% max of bankroll per single bet)
  minEdge?: number;          // default 0.015 (minimum 1.5% edge over market required)
  minBetAmountSui?: number;  // default 0.01 SUI
}

export interface KellyCalculationResult {
  shouldBet: boolean;
  stakeSui: number;
  stakePct: number;          // % of bankroll
  fullKellyFraction: number; // raw f*
  fractionalKellyFraction: number;
  edge: number;              // forecastProb - marketProb
  decimalOdds: number;
  expectedValuePct: number;  // (forecastProb * decimalOdds - 1) * 100
  reason: string;
}

export class KellyCalculator {
  /**
   * Calculate recommended stake using Fractional Kelly Criterion
   */
  public static calculate(input: KellyCalculationInput): KellyCalculationResult {
    const {
      bankrollSui,
      forecastProb,
      marketProb,
      fractionalMultiplier = 0.25,
      maxBetPct = 0.025,
      minEdge = 0.015,
      minBetAmountSui = 0.01,
    } = input;

    // Validation
    if (bankrollSui <= 0) {
      return {
        shouldBet: false,
        stakeSui: 0,
        stakePct: 0,
        fullKellyFraction: 0,
        fractionalKellyFraction: 0,
        edge: 0,
        decimalOdds: 0,
        expectedValuePct: 0,
        reason: 'Bankroll must be greater than zero.',
      };
    }

    if (forecastProb <= 0 || forecastProb >= 1 || marketProb <= 0 || marketProb >= 1) {
      return {
        shouldBet: false,
        stakeSui: 0,
        stakePct: 0,
        fullKellyFraction: 0,
        fractionalKellyFraction: 0,
        edge: 0,
        decimalOdds: 0,
        expectedValuePct: 0,
        reason: 'Probabilities must be strictly between 0 and 1.',
      };
    }

    const decimalOdds = input.decimalOdds && input.decimalOdds > 1
      ? input.decimalOdds
      : parseFloat((1 / marketProb).toFixed(4));

    const b = decimalOdds - 1; // Net decimal odds
    const edge = parseFloat((forecastProb - marketProb).toFixed(4));
    const expectedValuePct = parseFloat(((forecastProb * decimalOdds - 1) * 100).toFixed(2));

    // Gate 1: Check Minimum Edge
    if (edge < minEdge) {
      return {
        shouldBet: false,
        stakeSui: 0,
        stakePct: 0,
        fullKellyFraction: 0,
        fractionalKellyFraction: 0,
        edge,
        decimalOdds,
        expectedValuePct,
        reason: `Edge (+${(edge * 100).toFixed(2)}%) does not meet minimum threshold of +${(minEdge * 100).toFixed(2)}%.`,
      };
    }

    // Gate 2: Calculate Kelly Fraction: f* = (b * p - q) / b
    const q = 1 - forecastProb;
    const fullKelly = (b * forecastProb - q) / b;

    if (fullKelly <= 0) {
      return {
        shouldBet: false,
        stakeSui: 0,
        stakePct: 0,
        fullKellyFraction: 0,
        fractionalKellyFraction: 0,
        edge,
        decimalOdds,
        expectedValuePct,
        reason: 'Full Kelly fraction is non-positive (negative expected utility).',
      };
    }

    // Apply Fractional Multiplier (e.g. 0.25x Quarter Kelly)
    let fractionalKelly = fullKelly * fractionalMultiplier;

    // Apply Safety Cap (e.g. max 2.5% of bankroll per position)
    const cappedFraction = Math.min(fractionalKelly, maxBetPct);

    // Calculate raw stake in SUI
    let rawStakeSui = parseFloat((bankrollSui * cappedFraction).toFixed(4));

    // Ensure stake meets minimum bet threshold
    if (rawStakeSui < minBetAmountSui) {
      return {
        shouldBet: false,
        stakeSui: 0,
        stakePct: 0,
        fullKellyFraction: parseFloat(fullKelly.toFixed(4)),
        fractionalKellyFraction: parseFloat(fractionalKelly.toFixed(4)),
        edge,
        decimalOdds,
        expectedValuePct,
        reason: `Calculated stake (${rawStakeSui.toFixed(4)} SUI) is below minimum bet amount (${minBetAmountSui} SUI).`,
      };
    }

    return {
      shouldBet: true,
      stakeSui: rawStakeSui,
      stakePct: parseFloat((cappedFraction * 100).toFixed(2)),
      fullKellyFraction: parseFloat(fullKelly.toFixed(4)),
      fractionalKellyFraction: parseFloat(fractionalKelly.toFixed(4)),
      edge,
      decimalOdds,
      expectedValuePct,
      reason: `Optimal position size calculated: +${(edge * 100).toFixed(1)}% edge at ${decimalOdds.toFixed(2)} odds (${(cappedFraction * 100).toFixed(2)}% of bankroll).`,
    };
  }
}

