import { createFileRoute, Link } from "@tanstack/react-router";
import tradingImg from "@/assets/nyc-skyline.jpg";
import { ArrowRight, TrendingUp, Users, Award, BarChart3, ChevronRight } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Purdue SMIF — Student Managed Investment Fund" },
      { name: "description", content: "Founded to develop the next generation of investors. The Purdue Student Managed Investment Fund manages real capital across global markets." },
      { property: "og:title", content: "Purdue SMIF — Student Managed Investment Fund" },
      { property: "og:description", content: "Founded to develop the next generation of investors. The Purdue Student Managed Investment Fund manages real capital across global markets." },
      { property: "og:url", content: "https://purduesmif.org/" },
    ],
    links: [
      { rel: "canonical", href: "https://purduesmif.org/" },
      { rel: "preload", as: "image", href: tradingImg, fetchPriority: "high" },
    ],

  }),
});




const STATS = [
  { display: "$600K", label: "Assets Under Management", sub: "actively deployed" },
  { display: "50+",   label: "Active Members",          sub: "across all years" },
  { display: "15Y+",  label: "Track Record",            sub: "since est. 2009" },
  { display: "10",    label: "Sector Coverage Teams",   sub: "bottom-up research" },
];

const PILLARS = [
  { Icon: BarChart3, title: "Investment Research", body: "Bottom-up fundamental analysis across equity sector teams. Every pitch is defended live before the full investment committee — the same rigor as a professional fund." },
  { Icon: Users, title: "Mentorship & Recruiting", body: "Direct access to Purdue alumni at top investment banks, hedge funds, and asset managers — and structured preparation to compete for those seats." },
  { Icon: Award, title: "Real Portfolio", body: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly. No simulations — real capital, real accountability." },
];

function Index() {
  return (

    <>
      <section className="relative isolate overflow-hidden bg-ink min-h-screen flex flex-col">
        <div aria-hidden="true" className="absolute inset-0">
          <img src={tradingImg} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink" />
        </div>
        <div className="relative flex-1 container-prose flex flex-col justify-center py-24 lg:py-28 text-background">
          <div className="animate-fade-in flex items-center gap-3 mb-8">
            <span className="rule-gold animate-expand-x delay-100" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/80">Daniels School of Business · Est. 2009</span>
          </div>
          <h1 className="animate-fade-up delay-200 font-display font-bold text-background max-w-4xl" style={{ fontSize: "clamp(2.75rem, 7.5vw, 6rem)", lineHeight: "0.94" }}>
            Purdue<br /><span className="text-gold">Student</span><br />Managed<br />Investment<br />Fund
          </h1>
          <p className="animate-fade-up delay-400 mt-8 max-w-md text-background/65 text-base leading-relaxed">
            A premier student-run fund managing real capital, delivering rigorous research, and developing the next generation of investment professionals.
          </p>
          <div className="animate-fade-up delay-500 mt-10 flex flex-wrap gap-4">
            <Link to="/about" className="group inline-flex items-center gap-2.5 bg-gold px-8 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200">
              Our Story<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/holdings" className="inline-flex items-center gap-2.5 border border-background/25 px-8 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200">
              View Portfolio
            </Link>
          </div>
          <RevealGroup className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 max-w-5xl" stagger={0.08}>
            {STATS.map((s) => (
              <RevealItem key={s.label}>
                <div className="font-display text-4xl lg:text-5xl font-bold text-gold leading-none">
                  {s.display === "$600K" ? (<><span>$</span><CountUp to={600} duration={1.8} /><span>K</span></>) :
                   s.display === "50+"   ? (<><CountUp to={50} duration={1.4} /><span>+</span></>) :
                   s.display === "15Y+"  ? (<><CountUp to={15} duration={1.2} /><span>Y+</span></>) :
                                           (<CountUp to={10} duration={1.0} />)}
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-background/70">{s.label}</div>
                <div className="mt-1 text-xs text-background/55 font-mono">{s.sub}</div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-ink text-background py-32 overflow-hidden"><div className="container-prose"><Reveal className="max-w-2xl mb-20"><span className="rule-gold mb-5 block" /><span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/70 block mb-5">Mission</span><h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}>Real capital.<br />Real research.<br /><span className="text-gold/70">Real outcomes.</span></h2></Reveal><div className="grid md:grid-cols-5 gap-16 items-start"><Reveal className="md:col-span-3 space-y-5" delay={0.1}><p className="text-background/80 text-lg leading-relaxed">SMIF gives Purdue students the rare opportunity to manage actual investment capital under faculty mentorship. Our analysts apply institutional-grade frameworks to fundamental equity research — building skills that translate directly to careers in asset management, investment banking, and equity research.</p><p className="text-background/65 leading-relaxed">Every semester, analysts pitch positions to the full fund. Accepted ideas enter the real portfolio. Rejected ideas come with feedback that sharpens the next pitch. This is the closest an undergraduate education gets to the actual job.</p><Link to="/about" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-mid transition-colors duration-200 mt-2 cursor-pointer">Learn about our process<ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link></Reveal><Reveal className="md:col-span-2 relative" delay={0.2}><img src={tradingImg} alt="New York City skyline" loading="lazy" width={1600} height={1200} className="w-full aspect-[3/4] object-cover shadow-elegant" /><div className="absolute -bottom-5 -left-5 bg-gold p-5 shadow-gold hidden md:block"><div className="font-display text-3xl font-bold text-ink leading-none">15Y+</div><div className="text-xs uppercase tracking-wider text-ink/60 mt-1">Track record</div></div></Reveal></div></div></section>
      <section className="bg-background border-t border-border py-32"><div className="container-prose"><Reveal className="flex items-end justify-between mb-16 gap-8 flex-wrap"><div><h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}>Three pillars<br />of the fund</h2></div><Link to="/apply" className="group hidden md:inline-flex items-center gap-2 text-sm font-semibold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors duration-200 cursor-pointer">Apply to join<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link></Reveal><RevealGroup className="grid md:grid-cols-3 border-t border-border" stagger={0.12}>{PILLARS.map(({ Icon, title, body }) => (<RevealItem key={title} className="group relative border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 lg:p-10 transition-colors duration-300 hover:bg-secondary/50"><div className="mb-8 flex items-center justify-start"><Icon className="h-6 w-6 text-gold-deep transition-all duration-200 group-hover:text-ink group-hover:scale-110" /></div><h3 className="font-display text-2xl font-semibold text-ink mb-4">{title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{body}</p></RevealItem>))}</RevealGroup></div></section>
      <section className="bg-secondary/60 border-t border-border py-20"><Reveal className="container-prose flex flex-col md:flex-row items-center justify-between gap-8"><div><span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-3">Fund Performance</span><h2 className="font-display text-3xl md:text-4xl font-bold text-ink">Benchmarked against the S&amp;P 500.<br className="hidden md:block" />Reported every quarter.</h2></div><div className="flex gap-4 flex-shrink-0"><Link to="/performance" className="group inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 transition-colors duration-200 cursor-pointer">Performance<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></Link><Link to="/holdings" className="inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-sm font-semibold text-ink hover:bg-ink hover:text-background transition-colors duration-200 cursor-pointer">Holdings</Link></div></Reveal></section>
      <section className="bg-ink text-background py-32 relative overflow-hidden"><div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"><span className="font-display font-bold text-white/[0.03] leading-none whitespace-nowrap" style={{ fontSize: "clamp(5rem, 20vw, 16rem)" }}>SMIF</span></div><Reveal className="relative container-prose text-center max-w-3xl mx-auto"><TrendingUp className="mx-auto h-7 w-7 text-gold mb-8 opacity-75" /><h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}>Ready to invest<br />in your future?</h2><p className="mt-6 max-w-lg mx-auto text-background/55 leading-relaxed">Applications open each fall and spring semester. We're looking for curious, rigorous students from every college at Purdue.</p><div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"><a href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200 cursor-pointer">Apply to Join<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></a><Link to="/team" className="inline-flex items-center justify-center gap-2 border border-background/20 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200 cursor-pointer">Meet the Team</Link></div></Reveal></section>
    </>
  );
   }
