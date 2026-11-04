import Link from 'next/link';
import { Badge } from '@/components/ui';

export default function Home() {
  return (
    <>
      <h1>Is this tipster skilled, or just lucky?</h1>
      <p className="mut lead">AlphaAgent checks that every pick was locked before kickoff, that no bets were hidden, and that the record is long enough to mean something.</p>
      <div className="actions">
        <Link href="/check" className="btn">Check a tipster</Link>
        <Link href="/pick" className="btn2">Log a pick</Link>
      </div>
      <div className="row">
        <div className="card">
          <h2>Looks perfect, not proven yet</h2>
          <Badge verdict="WATCH" />
          <p>Short Streak: 5 wins, 0 losses.</p>
          <p className="mut">If every game were a coin flip, five wins in a row happens 1 time in 32. Needs 10 more verified picks before anyone risks real money.</p>
        </div>
        <div className="card">
          <h2>Long record, checked</h2>
          <Badge verdict="FOLLOW" />
          <p>Verified Forecaster: 30 verified picks.</p>
          <p className="mut">Skill rating +5.9% verified profit edge over market after BSS shrinkage. No hidden bets.</p>
        </div>
      </div>
      <h2 className="stack">How it works</h2>
      <div className="row">
        <div className="card"><strong>1. Lock before kickoff</strong><p className="mut">Each pick gets a time stamp on Sui before the game starts.</p></div>
        <div className="card"><strong>2. Save every result</strong><p className="mut">Results go into permanent memory on Walrus, so nothing can be quietly deleted.</p></div>
        <div className="card"><strong>3. Get a verdict</strong><p className="mut">FOLLOW, WATCH or SKIP, based on evidence and not on streaks.</p></div>
      </div>
    </>
  );
}
