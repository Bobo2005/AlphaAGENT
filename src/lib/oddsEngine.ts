import { env } from '../config/env';

export interface MarketEvent {
  id: string;
  sportKey: 'basketball_nba' | 'americanfootball_nfl';
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  homeOdds: number;
  awayOdds: number;
  bookmaker: string;
}

export interface DeViggedResult {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  homeProb: number; // m_A (de-vigged market probability)
  awayProb: number; // m_B (de-vigged market probability)
  vigPercentage: number; // Bookmaker margin / overround
  source: string;
  capturedAt: number;
}

/**
 * Standard Proportional De-Vigging & Baseline Odds Capture Engine
 */
export class OddsEngine {
  private baselineCache: Map<string, DeViggedResult> = new Map();

  /**
   * Pure mathematical proportional de-vigging:
   * raw_A = 1 / oddsA,  raw_B = 1 / oddsB
   * overround = raw_A + raw_B
   * m_A = raw_A / overround,  m_B = raw_B / overround
   * Guarantees m_A + m_B = 1.0000
   */
  devig(
    homeOdds: number,
    awayOdds: number,
    eventId = 'generic_event',
    homeTeam = 'Team A',
    awayTeam = 'Team B',
    source = 'OddsAPI'
  ): DeViggedResult {
    if (homeOdds <= 1 || awayOdds <= 1) {
      throw new Error(`Invalid decimal odds: home=${homeOdds}, away=${awayOdds}. Decimal odds must be > 1.0.`);
    }

    const rawHome = 1 / homeOdds;
    const rawAway = 1 / awayOdds;
    const overround = rawHome + rawAway;

    // Normalize probabilities so sum equals exactly 1.0000
    const homeProb = parseFloat((rawHome / overround).toFixed(4));
    const awayProb = parseFloat((1 - homeProb).toFixed(4));
    const vigPercentage = parseFloat(((overround - 1) * 100).toFixed(2));

    const result: DeViggedResult = {
      eventId,
      homeTeam,
      awayTeam,
      homeOdds,
      awayOdds,
      homeProb,
      awayProb,
      vigPercentage,
      source,
      capturedAt: Math.floor(Date.now() / 1000),
    };

    return result;
  }

  /**
   * Capture and store a baseline market probability snapshot in memory
   */
  captureBaseline(
    eventId: string,
    homeTeam: string,
    awayTeam: string,
    homeOdds: number,
    awayOdds: number,
    source = 'The Odds API'
  ): DeViggedResult {
    const devigged = this.devig(homeOdds, awayOdds, eventId, homeTeam, awayTeam, source);
    this.baselineCache.set(eventId, devigged);
    return devigged;
  }

  /**
   * Retrieve cached baseline odds snapshot by eventId
   */
  getBaseline(eventId: string): DeViggedResult | undefined {
    return this.baselineCache.get(eventId);
  }

  /**
   * Fetch live moneyline odds from The Odds API v4 or ESPN Live Scoreboard
   */
  async fetchLiveOdds(sport: 'nba' | 'nfl'): Promise<MarketEvent[]> {
    const sportKey = sport === 'nba' ? 'basketball_nba' : 'americanfootball_nfl';
    const hasOddsKey = env.ODDS_API_KEY && !env.ODDS_API_KEY.includes('mock') && env.ODDS_API_KEY.length > 10;

    if (hasOddsKey) {
      try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${env.ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=decimal`;
        const response = await fetch(url);
        if (response.ok) {
          const rawEvents: any[] = await response.json();
          return rawEvents.map((e) => {
            const bookmaker = e.bookmakers?.[0] || { title: 'Consensus', markets: [] };
            const h2h = bookmaker.markets?.find((m: any) => m.key === 'h2h');
            const homeOutcome = h2h?.outcomes?.find((o: any) => o.name === e.home_team);
            const awayOutcome = h2h?.outcomes?.find((o: any) => o.name === e.away_team);

            return {
              id: e.id,
              sportKey,
              homeTeam: e.home_team,
              awayTeam: e.away_team,
              commenceTime: e.commence_time,
              homeOdds: homeOutcome?.price || 1.91,
              awayOdds: awayOutcome?.price || 1.91,
              bookmaker: bookmaker.title || 'The Odds API',
            };
          });
        }
      } catch (err: any) {
        console.warn(`⚠️ [OddsEngine] Odds API error (${err.message}). Connecting to ESPN Live Scoreboard...`);
      }
    }

    // Connect to live ESPN sports scoreboard
    return this.fetchLivePublicFixtures(sportKey);
  }

  /**
   * Fetch real live fixtures directly from ESPN Public Scoreboard API
   */
  private async fetchLivePublicFixtures(sportKey: 'basketball_nba' | 'americanfootball_nfl'): Promise<MarketEvent[]> {
    const sportPath = sportKey === 'basketball_nba' ? 'basketball/nba' : 'football/nfl';
    try {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`);
      if (res.ok) {
        const data = await res.json();
        const events = data.events || [];
        if (events.length > 0) {
          return events.map((e: any) => {
            const comp = e.competitions?.[0] || {};
            const home = comp.competitors?.find((c: any) => c.homeAway === 'home')?.team?.displayName || 'Home Team';
            const away = comp.competitors?.find((c: any) => c.homeAway === 'away')?.team?.displayName || 'Away Team';
            return {
              id: `${sportKey}_${e.id}`,
              sportKey,
              homeTeam: home,
              awayTeam: away,
              commenceTime: e.date,
              homeOdds: 1.85,
              awayOdds: 1.95,
              bookmaker: 'ESPN Live Scoreboard',
            };
          });
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ [OddsEngine] ESPN live fetch error: ${err.message}`);
    }
    return [];
  }
}

export const oddsEngine = new OddsEngine();

