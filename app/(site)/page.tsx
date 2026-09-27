"use client";

import { useRouter } from "next/navigation";
import { IdeaInput } from "../../components/IdeaInput";
import { createRun } from "../../lib/client/api";
import ideaFixtures from "../../fixtures/ideas.json";

const EXAMPLES = ideaFixtures.map((idea) => idea.rawIdea);

export default function HomePage() {
  const router = useRouter();
  return <main className="landing"><nav className="landing-nav"><a className="wordmark" href="/"><span className="brand-mark">G</span>Grain</a><span>Adversarial brand studio</span><a href="#method">Our method ↘</a></nav>
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><i /> Strategy under pressure</span><h1>Your brand<br />should survive<br /><em>an argument.</em></h1><p>Turn a rough idea into a brand system that’s challenged by critics, measured against the market, and traceable to every decision.</p><div className="proof"><span><b>3</b> directions</span><span><b>9</b> critiques</span><span><b>1</b> coherent system</span></div></div>
      <div className="composer-wrap"><div className="composer-number">01 / Begin</div><IdeaInput examples={EXAMPLES} onStart={async (idea) => { const run = await createRun(idea); router.push(`/run/${run.id}`); }} /><div className="composer-foot"><span>Built for founders with taste.</span><span>No brand theater.</span></div></div>
    </section>
    <section className="method" id="method"><header><span className="eyebrow">The method</span><h2>Generation is easy.<br />Judgment is the product.</h2></header><div className="method-grid"><article><span>01</span><h3>Diverge</h3><p>Three strategically different directions, not three coats of paint.</p></article><article><span>02</span><h3>Battle</h3><p>Critics attack fit, credibility, clarity, and cliché before you commit.</p></article><article><span>03</span><h3>Measure</h3><p>Language is compared against a real corpus to expose generic choices.</p></article><article><span>04</span><h3>Guard</h3><p>A consistency layer checks that every output still belongs to the same idea.</p></article></div></section>
  </main>;
}
