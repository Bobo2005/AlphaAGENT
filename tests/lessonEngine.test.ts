import { lessonEngine } from '../src/services/lessonEngine';
import { decisionEngine } from '../src/services/decisionEngine';
import { EpisodeRecord } from '../src/lib/walrusClient';

function createMockEpisode(
  id: string,
  forecast: number,
  market: number,
  outcome: 'win' | 'loss',
  category = 'NBA'
): EpisodeRecord {
  return {
    type: 'EPISODE',
    version: 'v1',
    forecaster: '0xLessonTesterAddr',
    category,
    eventId: `event_${id}`,
    pick: 'HOME',
    forecast,
    market,
    marketSource: 'OddsAPI',
    marketTs: 1730246400,
    outcome,
    commitTx: `tx_${id}`,
    commitTs: 1730246400,
    sourcesAgree: '2/2',
    resolvedTs: 1730300000,
  };
}

async function testLessonEngine() {
  console.log('🧪 [Test] Verifying Dynamic Lesson Synthesis & Semantic Recall Pipeline...');

  // 1. Test Odds Band Categorization
  if (
    lessonEngine.getOddsBand(0.35) !== 'underdog' ||
    lessonEngine.getOddsBand(0.55) !== 'balanced' ||
    lessonEngine.getOddsBand(0.80) !== 'confident'
  ) {
    throw new Error('Odds band categorization logic failure!');
  }
  console.log('✅ Odds band categorization verified: <=40% underdog, >=75% confident, balanced in between.');

  // 2. Synthesize Lesson: 5 confident picks (>=75%) where 4 lost (only 1 won)
  console.log('\n🧠 [Test] Synthesizing empirical lesson from severe blindspot...');
  const forecaster = '0xLessonTesterAddr';
  const episodes: EpisodeRecord[] = [
    createMockEpisode('1', 0.80, 0.65, 'loss', 'NBA'),
    createMockEpisode('2', 0.85, 0.70, 'loss', 'NBA'),
    createMockEpisode('3', 0.78, 0.60, 'loss', 'NBA'),
    createMockEpisode('4', 0.82, 0.68, 'loss', 'NBA'),
    createMockEpisode('5', 0.80, 0.65, 'win', 'NBA'), // 1 of 5 won
  ];

  const lessons = await lessonEngine.analyzeAndSynthesizeLessons(forecaster, episodes);

  if (lessons.length === 0) {
    throw new Error('Expected at least 1 lesson synthesized for severe confident pick failure!');
  }

  const generatedLesson = lessons[0];
  console.log(`   ✅ Synthesized Lesson: "${generatedLesson.finding}"`);
  console.log(`   ✅ Enforced Rule: "${generatedLesson.rule}"`);

  // 3. Test Semantic Recall & Memory Override in Decision Engine
  console.log('\n🔍 [Test] Testing Semantic Memory Recall on upcoming 80% NBA favorite...');
  // Forecaster makes a new pick: NBA, confident favorite (80%)
  const upcomingConfidentPick = { category: 'NBA', probability: 0.80 };

  const verdictWithRecall = await decisionEngine.evaluateWithMemoryRecall(
    episodes,
    [],
    upcomingConfidentPick
  );

  console.log(`   - Verdict on Upcoming Pick: [ ${verdictWithRecall.verdict} ]`);
  console.log(`   - Headline: "${verdictWithRecall.headline}"`);
  console.log(`   - Active Lesson Rule: "${verdictWithRecall.activeLessonRule}"`);

  if (verdictWithRecall.verdict !== 'SKIP') {
    throw new Error(`Expected verdict SKIP due to lesson override, got: ${verdictWithRecall.verdict}`);
  }
  if (!verdictWithRecall.activeLessonRule || !verdictWithRecall.activeLessonRule.includes('SKIP confident NBA')) {
    throw new Error('Active lesson rule was not attached to verdict!');
  }

  console.log('   ✅ Memory that visibly matters verified: Walrus Memory dynamically overrode verdict to SKIP!');
  console.log('\n🎉 Dynamic Lesson Synthesis & Semantic Recall tests passed successfully!');
}

testLessonEngine().catch((err) => {
  console.error('❌ Lesson engine test error:', err);
  process.exit(1);
});

