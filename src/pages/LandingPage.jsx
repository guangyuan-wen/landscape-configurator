import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Lightbulb, PlayCircle, ArrowRight, Quote, FlaskConical, Sparkles } from 'lucide-react';

/** 当元素进入视口时返回 true，用于滚动触发的动画 */
function useInView(once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * Landing Page: From Preferences to Places
 * 插画风 + 黑绿配色，带基础交互与滚动动效
 */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);
  const [heroRef, heroInView] = useInView();
  const heroVisible = mounted || heroInView;
  const [s1Ref, s1InView] = useInView();
  const [s2Ref, s2InView] = useInView();
  const [s3Ref, s3InView] = useInView();
  const [s4Ref, s4InView] = useInView();
  const [s5Ref, s5InView] = useInView();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 插画风背景层：远山 + 层次剪影，纯黑绿 */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/30" />
        {/* 远山剪影 */}
        <svg className="absolute bottom-0 left-0 w-full h-[45%] opacity-40" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">
          <path fill="#0f172a" d="M0,400 L0,280 Q200,200 400,240 T800,200 T1200,260 L1200,400 Z" />
          <path fill="#134e4a" d="M0,400 L0,320 Q300,240 600,280 T1200,220 L1200,400 Z" />
          <path fill="#064e3b" d="M0,400 L0,360 Q400,280 800,320 L1200,300 L1200,400 Z" />
        </svg>
        {/* 前景装饰：树形剪影 */}
        <div className="absolute bottom-0 right-0 w-64 h-72 opacity-20">
          <svg viewBox="0 0 200 280" className="w-full h-full">
            <ellipse cx="100" cy="220" rx="55" ry="50" fill="#065f46" />
            <ellipse cx="100" cy="160" rx="45" ry="42" fill="#047857" />
            <ellipse cx="100" cy="100" rx="35" ry="38" fill="#059669" />
            <rect x="92" y="240" width="16" height="40" fill="#0f172a" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-56 opacity-15">
          <svg viewBox="0 0 160 220" className="w-full h-full">
            <path fill="#064e3b" d="M80,180 Q40,120 80,60 Q120,120 80,180 Z" />
            <rect x="72" y="180" width="16" height="40" fill="#0f172a" />
          </svg>
        </div>
      </div>

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <span className="text-lg font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-2">
            <Map size={20} className="text-emerald-400" /> LandscapePro
          </span>
          <Link
            to="/design"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 active:scale-100 transition-all duration-200 shadow-lg hover:shadow-emerald-500/30"
          >
            Enter Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Hero：插画风标题区 + 入场动效 */}
        <section
          ref={heroRef}
          className={`text-center space-y-6 pt-4 transition-all duration-400 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg">
            From Preferences to Places
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discovering a Human-Led Workflow for Collaborative Urban Park Design.
          </p>
          <blockquote className="flex items-center justify-center gap-2 text-slate-400 italic border-l-2 border-emerald-500/50 pl-4 py-3 max-w-xl mx-auto text-left bg-slate-900/40 rounded-r-xl">
            <Quote size={20} className="text-emerald-500/70 flex-shrink-0" />
            <span>Since we have collaborative Word and Excel, why can't we have a collaborative landscape master plan?</span>
          </blockquote>
          <div className="pt-4">
            <Link
              to="/design"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-100 transition-all duration-200 shadow-xl"
            >
              Enter Workspace <ArrowRight size={18} />
            </Link>
          </div>
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 mt-8 shadow-2xl ring-1 ring-slate-700/50">
            <img src="/Web-tool-ScreenShot.jpg" alt="LandscapePro web tool interface" className="w-full h-full object-contain" />
          </div>
        </section>

        {/* The Laboratory */}
        <section
          ref={s1Ref}
          className={`space-y-6 transition-all duration-400 ${s1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-black text-emerald-400 uppercase tracking-tight">
            <FlaskConical size={24} /> The Laboratory: Hong Lim Park (Speaker's Corner)
          </h2>
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div className="space-y-5 text-slate-300 p-6 rounded-2xl bg-slate-900/50 border border-slate-700/80">
              <div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-1">Site attribute</h3>
                <p>Hong Lim Park, specifically the &quot;Speaker&apos;s Corner.&quot;</p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-1">Why here?</h3>
                <p>This is the most symbolic democratic space in Singapore. If a park is to be redesigned through a &quot;Democratic Process,&quot; Hong Lim Park is the ultimate choice.</p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-1">Site context</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Located next to Clarke Quay MRT.</li>
                  <li>Key elements: Outdoor Stage, Central Lawn, and Shaded Perimeters.</li>
                  <li>Supports high-pressure needs: Rallies, speeches, and daily recreation.</li>
                </ul>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 flex items-center justify-center relative h-[320px] md:h-[340px] ring-1 ring-slate-700/50">
              <img
                src="/Hong-Lim-Park.png"
                alt="Hong Lim Park (Speaker's Corner) plan view with Clarke Quay MRT, Outdoor Stage, Central Lawn"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center text-slate-500 text-sm text-center p-4">
                Add <code className="bg-slate-800 px-1 rounded">Hong-Lim-Park.png</code> to <code className="bg-slate-800 px-1 rounded">public/</code>
              </div>
            </div>
          </div>
        </section>

        {/* The Hypothesis */}
        <section
          ref={s2Ref}
          className={`space-y-6 transition-all duration-400 ${s2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-black text-emerald-400 uppercase tracking-tight">
            <Lightbulb size={24} /> The Hypothesis: The Mathematical Mandate
          </h2>
          <div className="space-y-4 text-slate-300 p-6 rounded-2xl bg-slate-900/50 border border-slate-700/80">
            <p className="text-lg">
              When we transform <strong className="text-white">100 individual subjective preferences</strong> into geographical coordinate data (X, Y), the aggregated &quot;Heatmap&quot; is no longer just a suggestion—it becomes a <strong className="text-emerald-400">&quot;Mathematical Mandate.&quot;</strong>
            </p>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider pt-2">The computable workflow</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Harvest:</span> Users enter the V0.28 Prototype via a simple link.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Export:</span> The system generates a technical JSON list of coordinates.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Aggregate:</span> Python scripts merge thousands of data points into a consensus heatmap.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Translate:</span> IF-THEN rules convert the heatmap into precise geometry for CAD/BIM.</li>
            </ul>
          </div>
          <div className="w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 flex items-center justify-center relative ring-1 ring-slate-700/50">
            <img
              src="/Workflow.png"
              alt="Data flow: preference to places — design layouts, JSON export, Python aggregator, heatmap"
              className="w-full h-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-slate-500 text-sm text-center p-4">
              Add <code className="bg-slate-800 px-1 rounded">Workflow.png</code> to <code className="bg-slate-800 px-1 rounded">public/</code>
            </div>
          </div>
        </section>

        {/* Participant Instructions */}
        <section
          ref={s3Ref}
          className={`space-y-6 transition-all duration-400 ${s3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-black text-emerald-400 uppercase tracking-tight">
            <PlayCircle size={24} /> Participant Instructions: How to Design
          </h2>
          <p className="text-slate-400">Before you enter the design interface, please note your task:</p>
          <ul className="space-y-3 text-slate-300 p-6 rounded-2xl bg-slate-900/50 border border-slate-700/80">
            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Select a style:</span> Choose between Urban, Community, or Nature park templates (3 variants each to prevent bias).</li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Asset in-filling:</span> You can click and place assets: Big Trees, Small Trees, Benches, Plazas, or Ponds.</li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Fixed infrastructure:</span> Major circulation paths are locked to ensure the park&apos;s basic functionality.</li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Budget trade-offs:</span> Watch the real-time Budget Meter. Every asset has a cost. You must make logical decisions within the ±10% budget range.</li>
            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold shrink-0">Versioning:</span> Every change you make is recorded, allowing us to track the evolution of design decisions.</li>
          </ul>
          <div className="w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 ring-1 ring-slate-700/50">
            <video
              src="/landscape-pro-tutorial.mp4.mp4"
              controls
              className="w-full aspect-video object-contain bg-black"
            >
              Your browser does not support video. Ensure <code>landscape-pro-tutorial.mp4.mp4</code> is in <code>public/</code>.
            </video>
            <p className="text-slate-500 text-xs p-3 border-t border-slate-800">Video tutorial</p>
          </div>
        </section>

        {/* Future Vision */}
        <section
          ref={s4Ref}
          className={`space-y-6 transition-all duration-400 ${s4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="flex items-center gap-2 text-2xl font-black text-emerald-400 uppercase tracking-tight">
            <Sparkles size={24} /> Future Vision: Scaling Beyond the Pilot
          </h2>
          <div className="space-y-4 text-slate-300 p-6 rounded-2xl bg-slate-900/50 border border-slate-700/80">
            <p className="text-lg">
              <strong className="text-white">The goal:</strong> Hong Lim Park is just the beginning. We aim to build a democratic design engine for the entire Singapore Green Network.
            </p>
            <p><strong className="text-slate-200">Next steps:</strong> The platform will evolve into two versions:</p>
            <ul className="space-y-2 pl-4">
              <li><span className="text-emerald-500 font-bold">Public version:</span> For intuitive human-led layouts.</li>
              <li><span className="text-emerald-500 font-bold">Pro version:</span> Integrating GNPR (Green Plot Ratio) calculations, growth simulations, and live BIM connections.</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section
          ref={s5Ref}
          className={`pt-8 pb-12 text-center transition-all duration-400 ${s5InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <Link
            to="/design"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-100 transition-all duration-200 shadow-xl"
          >
            Enter Workspace <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-800 py-8 text-center space-y-4 bg-slate-950/90">
        <p className="text-slate-400 text-sm">
          Designer: <strong className="text-slate-300">Wen Guangyuan</strong> (NUS Design Thesis 2026)
        </p>
        <p className="text-slate-500 text-xs">
          Academic Prototype: Based on a Preference-led Computational Workflow.
        </p>
        <Link
          to="/design"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase bg-slate-700 text-slate-200 hover:bg-slate-600 hover:border-emerald-500/30 border border-transparent transition-all duration-200"
        >
          Enter Workspace <ArrowRight size={14} />
        </Link>
      </footer>
    </div>
  );
}
