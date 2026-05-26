import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-campus.jpg";
import tradingImg from "@/assets/nyc-skyline.jpg";
import { ArrowRight, TrendingUp, Users, Award, BarChart3, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index, head: () => ({ meta: [{ title: "Purdue SMIF — Student Managed Investment Fund" },{ name: "description", content: "Founded to develop the next generation of investors. The Purdue Student Managed Investment Fund manages real capital across global markets." }], links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" }] }) });

const TICKER_ITEMS = [
  { symbol: "SPY",   val: "+0.82%" },
  { symbol: "AAPL",  val: "+1.14%" },
  { symbol: "MSFT",  val: "+0.67%" },
  { symbol: "GOOGL", val: "-0.21%" },
  { symbol: "BRK.B", val: "+0.43%" },
  { symbol: "JPM",   val: "+1.32%" },
  { symbol: "XOM",   val: "-0.55%" },
  { symbol: "UNH",   val: "+0.91%" },
  { symbol: "NVDA",  val: "+2.18%" },
  { symbol: "V",     val: "+0.76%" },
];

const STATS = [
  { value: "$600K", label: "Assets Under Management",  sub: "actively deployed"  },
  { value: "50+",   label: "Active Members",            sub: "across all years"   },
  { value: "15Y+",  label: "Track Record",              sub: "since est. 2009"    },
  { value: "10",    label: "Sector Coverage Teams",     sub: "bottom-up research" },
];

const PILLARS = [
  { n: "01", Icon: BarChart3, title: "Investment Research", body: "Bottom-up fundamental analysis across equity sector teams. Every pitch is defended live before the full investment committee — the same rigor as a professional fund." },
  { n: "02", Icon: Users, title: "Mentorship & Recruiting", body: "Direct access to Purdue alumni at top investment banks, hedge funds, and asset managers — and structured preparation to compete for those seats." },
  { n: "03", Icon: Award, title: "Real Portfolio", body: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly. No simulations — real capital, real accountability." },
];

function TickerItem({ symbol, val }: { symbol: string; val: string }) {
  const positive = val.startsWith("+");
  return (
    <span className="inline-flex items-center gap-2 px-6 border-r border-white/10 text-xs font-mono">
      <span className="font-semibold text-gold tracking-wider">{symbol}</span>
      <span className={positive ? "text-emerald-400" : "text-red-400"}>{val}</span>
    </span>
  );
}

function Index() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink min-h-screen flex flex-col">
        <img src={heroImg} alt="" aria-hidden="true" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div aria-hidden="true" className="absolute left-[52%] top-0 bottom-0 w-px hidden lg:block pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(207,185,145,0.3) 20%, rgba(207,185,145,0.3) 80%, transparent 100%)" }} />
        <div className="relative flex-1 container-prose grid lg:grid-cols-2 gap-12 items-center py-28 text-background">
          <div>
            <div className="animate-fade-in flex items-center gap-3 mb-8">
              <span className="rule-gold animate-expand-x delay-100" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold/80">Daniels School of Business · Est. 2009</span>
            </div>
            <h1 className="animate-fade-up delay-200 font-display font-bold text-background" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", lineHeight: "0.94" }}>Purdue<br />            <em className="not-italic text-gold">Student</em><br />Managed<br />Investment<br />Fund</h1>
            <p className="animate-fade-up delay-400 mt-8 max-w-md text-background/65 text-base leading-relaxed">A premier student-run fund managing real capital, delivering rigorous research, and developing the next generation of investment professionals.</p>
            <div className="animate-fade-up delay-500 mt-10 flex flex-wrap gap-4">
              <Link to="/about" className="group inline-flex items-center gap-2.5 bg-gold px-8 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200 cursor-pointer">Our Story<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link>
              <Link to="/holdings" className="inline-flex items-center gap-2.5 border border-background/25 px-8 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200 cursor-pointer">View Portfolio</Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-px border border-white/10 bg-white/10">
            {STATS.map((s, i) => (<div key={s.label} className="animate-fade-up bg-ink/50 backdrop-blur-sm p-8 hover:bg-white/5 transition-colors duration-300 cursor-default" style={{ animationDelay: `${380 + i * 80}ms` }}><div className="font-display text-5xl font-bold text-gold leading-none">{s.value}</div><div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-background/55">{s.label}</div><div className="mt-1 text-[11px] text-background/35 font-mono">{s.sub}</div></div>))}
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-ink/70 backdrop-blur-sm py-3 ticker-wrap">
          <div className="ticker-inner">{doubled.map((item, i) => (<TickerItem key={i} symbol={item.symbol} val={item.val} />))}</div>
          <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-ink/70 to-transparent pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-ink/70 to-transparent pointer-events-none" />
        </div>
      </section>
      <section className="lg:hidden border-b border-border"><div className="container-prose grid grid-cols-2 gap-px bg-border">{STATS.map((s) => (<div key={s.label} className="bg-background p-6"><div className="font-display text-4xl font-bold text-ink">{s.value}</div><div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div></div>))}</div></section>
      <section className="bg-ink text-background py-32 overflow-hidden"><div className="container-prose"><div className="max-w-2xl mb-20"><span className="rule-gold mb-5 block" /><span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold/70 block mb-5">Mission</span><h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}>Real capital.<br />Real research.<br /><em className="not-italic text-gold/70">Real outcomes.</em></h2></div><div className="grid md:grid-cols-5 gap-16 items-start"><div className="md:col-span-3 space-y-5"><p className="text-background/70 text-lg leading-relaxed">SMIF gives Purdue students the rare opportunity to manage actual investment capital under faculty mentorship. Our analysts apply institutional-grade frameworks to fundamental equity research — building skills that translate directly to careers in asset management, investment banking, and equity research.</p><p className="text-background/50 leading-relaxed">Every semester, analysts pitch positions to the full fund. Accepted ideas enter the real portfolio. Rejected ideas come with feedback that sharpens the next pitch. This is the closest an undergraduate education gets to the actual job.</p><Link to="/about" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-mid transition-colors duration-200 mt-2 cursor-pointer">Learn about our process<ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link></div><div className="md:col-span-2 relative"><img src={tradingImg} alt="New York City skyline" loading="lazy" width={1600} height={1200} className="w-full aspect-[3/4] object-cover shadow-elegant" /><div className="absolute -bottom-5 -left-5 bg-gold p-5 shadow-gold hidden md:block"><div className="font-display text-3xl font-bold text-ink leading-none">15Y+</div><div className="text-[10px] uppercase tracking-wider text-ink/60 mt-1">Track record</div></div></div></div></div></section>
      <section className="bg-background border-t border-border py-32"><div className="container-prose"><div className="flex items-end justify-between mb-16 gap-8 flex-wrap"><div><span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">What We Do</span><h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}>Three pillars<br />of the fund</h2></div><Link to="/apply" className="group hidden md:inline-flex items-center gap-2 text-sm font-semibold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors duration-200 cursor-pointer">Apply to join<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link></div><div className="grid md:grid-cols-3 border-t border-border">{PILLARS.map(({ n, Icon, title, body }) => (<div key={title} className="group border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 lg:p-10 hover:bg-secondary/50 transition-colors duration-300"><div className="flex items-start justify-between mb-8"><span className="font-mono text-xs text-muted-foreground tracking-widest">{n}</span><Icon className="h-5 w-5 text-gold-deep opacity-60 group-hover:opacity-100 transition-opacity duration-200" /></div><h3 className="font-display text-2xl font-semibold text-ink mb-4">{title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{body}</p></div>))}</div></div></section>
      <section className="bg-secondary/60 border-t border-border py-20"><div className="container-prose flex flex-col md:flex-row items-center justify-between gap-8"><div><span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-3">Fund Performance</span><h2 className="font-display text-3xl md:text-4xl font-bold text-ink">Benchmarked against the S&amp;P 500.<br className="hidden md:block" />Reported every quarter.</h2></div><div className="flex gap-4 flex-shrink-0"><Link to="/performance" className="group inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 transition-colors duration-200 cursor-pointer">Performance<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link><Link to="/holdings" className="inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-sm font-semibold text-ink hover:bg-ink hover:text-background transition-colors duration-200 cursor-pointer">Holdings</Link></div></div></section>
      <section className="bg-ink text-background py-32 relative overflow-hidden"><div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"><span className="font-display font-bold text-white/[0.03] leading-none whitespace-nowrap" style={{ fontSize: "clamp(5rem, 20vw, 16rem)" }}>SMIF</span></div><div className="relative container-prose text-center max-w-3xl mx-auto"><TrendingUp className="mx-auto h-7 w-7 text-gold mb-8 opacity-75" /><h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}>Ready to invest<br />in your future?</h2><p className="mt-6 max-w-lg mx-auto text-background/55 leading-relaxed">Applications open each fall and spring semester. We’re looking for curious, rigorous students from every college at Purdue.</p><div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"><a href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200 cursor-pointer">Apply to Join<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></a><Link to="/team" className="inline-flex items-center justify-center gap-2 border border-background/20 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200 cursor-pointer">Meet the Team</Link></div></div></section>
    </>
  );
   }
