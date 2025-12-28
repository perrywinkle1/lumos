import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Users,
  DollarSign,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-lumos-dark-900">
      {/* Hero Section - Dark with Light Beam */}
      <section className="hero-dark pb-20 pt-24 sm:pb-32 sm:pt-32 lg:pb-40">
        {/* Light Beam Container */}
        <div className="light-beam" aria-hidden="true">
          <div className="beam-layer-1" />
          <div className="beam-layer-2" />
          <div className="beam-layer-3" />
          <div className="beam-center-glow" />
          <div className="beam-source" />
          <div className="beam-edge-left" />
          <div className="beam-edge-right" />
        </div>

        {/* Floating Dust Particles in the Light */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="dust-mote dust-mote-md animate-float-1" style={{ top: '15%', left: '40%', animationDelay: '0s' }} />
          <div className="dust-mote dust-mote-sm animate-float-2" style={{ top: '25%', left: '30%', animationDelay: '2s' }} />
          <div className="dust-mote dust-mote-lg animate-float-1" style={{ top: '20%', left: '55%', animationDelay: '1s' }} />
          <div className="dust-mote dust-mote-sm animate-float-3" style={{ top: '30%', left: '45%', animationDelay: '3s' }} />
          <div className="dust-mote dust-mote-md animate-float-2" style={{ top: '18%', left: '60%', animationDelay: '0.5s' }} />
          <div className="dust-mote dust-mote-xl animate-float-1 animate-shimmer" style={{ top: '22%', left: '50%', animationDelay: '4s' }} />
          <div className="dust-mote dust-mote-sm animate-float-3" style={{ top: '35%', left: '35%', animationDelay: '1.5s' }} />
          <div className="dust-mote dust-mote-md animate-float-2" style={{ top: '28%', left: '65%', animationDelay: '2.5s' }} />
          <div className="dust-mote dust-mote-sm animate-float-1" style={{ top: '40%', left: '42%', animationDelay: '5s' }} />
          <div className="dust-mote dust-mote-lg animate-float-3" style={{ top: '12%', left: '48%', animationDelay: '0.8s' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Feature Badge */}
            <div className="mb-8 flex justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-lumos-accent-primary/10 px-5 py-2 text-sm font-medium text-lumos-accent-primary ring-1 ring-inset ring-lumos-accent-primary/20 transition-all hover:ring-lumos-accent-primary/40 hover:bg-lumos-accent-primary/15"
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>New: Discover the latest technology guides</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-lumos-text-primary sm:text-6xl md:text-7xl lg:text-8xl">
              Master the digital world at{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-illuminated">your own</span>
                <span className="absolute -inset-2 -z-10 rounded-xl bg-gradient-to-r from-lumos-accent-primary/20 via-lumos-beam-cyan/15 to-lumos-beam-white/10 blur-xl animate-pulse" />
              </span>{" "}
              pace
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-lumos-text-secondary sm:text-xl sm:leading-9">
              Lumos is your guide to the tools and technologies you&apos;ve heard about but haven&apos;t mastered.
              We provide the literacy and discovery you need to stay connected, informed, and confident in the modern age.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link href="/auth/signup">
                <button className="btn-glow w-full sm:w-auto">
                  Start your journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lumos-text-secondary hover:text-lumos-text-primary ring-1 ring-lumos-dark-600 hover:ring-lumos-accent-primary/50 hover:bg-lumos-dark-800 transition-all">
                  Explore what&apos;s possible
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Fade Bottom */}
        <div className="hero-fade-bottom" aria-hidden="true" />
      </section>

      {/* Features Section - Dark */}
      <section className="relative bg-lumos-dark-900 py-24 sm:py-32 overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-lumos-accent-primary/5 via-lumos-accent-secondary/3 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-lumos-text-primary sm:text-4xl md:text-5xl">
              Build your digital confidence
            </h2>
            <p className="mt-6 text-lg leading-8 text-lumos-text-secondary">
              Clear, step-by-step guidance designed for those who want to understand
              new technology without the overwhelming jargon.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:mt-20 sm:grid-cols-2 lg:gap-8">
            {/* Feature 1 */}
            <div className="card-dark">
              <div className="card-icon-dark">
                <PenLine className="h-6 w-6" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-lumos-text-primary">
                Jargon-Free Learning
              </h3>
              <p className="mt-4 text-lg leading-7 text-lumos-text-secondary">
                We explain technology in plain English. No complicated terms,
                no assumed knowledge—just clear paths to understanding the
                tools that matter to you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-dark">
              <div className="card-icon-dark">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-lumos-text-primary">
                Guided Discovery
              </h3>
              <p className="mt-4 text-lg leading-7 text-lumos-text-secondary">
                Not sure what you&apos;re missing? Our curated guides help you
                discover new apps, services, and digital habits that can
                simplify your daily life.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-dark">
              <div className="card-icon-dark">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-lumos-text-primary">
                Built for You
              </h3>
              <p className="mt-4 text-lg leading-7 text-lumos-text-secondary">
                Every interface element and guide is designed with accessibility
                and clarity in mind. We&apos;ve removed the clutter so you can focus
                on what you&apos;re learning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-dark">
              <div className="card-icon-dark">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-lumos-text-primary">
                A Simpler Web
              </h3>
              <p className="mt-4 text-lg leading-7 text-lumos-text-secondary">
                Experience the web without the distractions. Our clean reading
                and learning environment makes it easy to stay focused on
                mastering new skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Dark */}
      <section className="relative bg-lumos-dark-850 py-24 sm:py-32 overflow-hidden">
        {/* Subtle ambient warmth */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-lumos-accent-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-lumos-accent-warm/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-lumos-text-primary sm:text-4xl md:text-5xl">
              Trusted by thousands of lifelong learners
            </h2>
            <p className="mt-6 text-lg leading-8 text-lumos-text-secondary">
              Join a growing community of people who are taking control of their
              digital lives and discovering what&apos;s possible with Lumos.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {[
              { name: "The Digital Life", sub: "Tech mastery", desc: "Understanding smart home tech for the modern household.", color: "from-lumos-accent-primary to-lumos-accent-secondary" },
              { name: "Safety First", sub: "Online security", desc: "Practical guides to staying safe and secure on the internet.", color: "from-lumos-accent-secondary to-lumos-accent-glow" },
              { name: "Stay Connected", sub: "Communication", desc: "Mastering video calls and social tools for family connection.", color: "from-lumos-accent-glow to-lumos-accent-primary" },
            ].map((pub, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-lumos-dark-800/80 backdrop-blur-sm p-8 transition-all hover:bg-lumos-dark-800 border border-lumos-dark-700 hover:border-lumos-accent-primary/30"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${pub.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div>
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${pub.color} ring-4 ring-lumos-dark-700 shadow-lg shadow-lumos-accent-primary/20`} />
                    <div>
                      <h4 className="font-bold text-lumos-text-primary">{pub.name}</h4>
                      <p className="text-sm font-medium text-lumos-accent-primary">{pub.sub}</p>
                    </div>
                  </div>
                  <p className="mt-6 text-lumos-text-secondary leading-relaxed">
                    {pub.desc}
                  </p>
                </div>
                <div className="mt-8 flex items-center text-sm font-semibold text-lumos-text-muted transition-all group-hover:text-lumos-accent-primary">
                  <span>Explore guide</span>
                  <ArrowRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/explore"
              className="group inline-flex items-center text-base font-semibold text-lumos-accent-primary hover:text-lumos-accent-glow transition-colors"
            >
              Discover all learning guides
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Dark with Light Beam */}
      <section className="cta-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="cta-card-dark relative overflow-hidden">
            {/* Light beam effect for CTA */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-b from-lumos-accent-primary/20 via-lumos-accent-primary/5 to-transparent blur-3xl" />
            </div>

            {/* Light rays effect */}
            <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-lumos-accent-primary/50 to-transparent" />
              <div className="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-lumos-accent-secondary/40 to-transparent" />
              <div className="absolute top-0 right-1/3 w-px h-36 bg-gradient-to-b from-lumos-accent-glow/40 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-lumos-text-illuminated sm:text-4xl md:text-5xl">
                Ready to master technology?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-lumos-text-secondary">
                Join thousands of others building their digital confidence.
                Start your journey toward tech literacy today.
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <button className="btn-glow w-full">
                    Get started for free
                  </button>
                </Link>
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full text-lumos-text-secondary hover:text-lumos-text-primary ring-1 ring-lumos-dark-600 hover:ring-lumos-accent-primary/50 hover:bg-lumos-dark-800 transition-all">
                    See examples
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-lumos-text-dim">
                No technical experience required. Learn at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
