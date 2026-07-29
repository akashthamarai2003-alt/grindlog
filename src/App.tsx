import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpenText,
  Brain,
  CalendarDays,
  ChartLine,
  Check,
  CloudSun,
  CircleCheck,
  Cloud,
  Coins,
  Download,
  Flame,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Moon,
  Play,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  WifiOff,
  Infinity as InfinityIcon,
  LayoutGrid,
  BookOpen,
  BarChart2,
  FileSpreadsheet,
  X,
  Crown,
  Swords,
  Store,
  Laptop,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

const navItems = [
  ['Home', 'home'],
  ['Features', 'features'],
  ['Tree', 'tree'],
  ['Analytics', 'analytics'],

  ['About', 'about'],
  ['Contact', 'contact'],
] as const

const featureCards = [
  {
    title: 'An AI that remembers your life.',
    body: 'Quietly connects the dots between your routines, energy, and intentions.',
    icon: Brain,
    accent: 'bg-[#EAF8EF]',
    mark: 'AI',
  },
  {
    title: 'See progress take root.',
    body: 'Your Tree of Life responds to the promises you keep, one ordinary day at a time.',
    icon: Leaf,
    accent: 'bg-[#EDF4FF]',
    mark: 'TREE',
  },
  {
    title: 'Make your attention visible.',
    body: 'A clear record of your days, so your next choice can be a better one.',
    icon: ChartLine,
    accent: 'bg-[#FFF4E8]',
    mark: 'INSIGHT',
  },
]

const capabilities: Array<[string, LucideIcon]> = [
  ['Habit tracking', CircleCheck],
  ['Calendar', CalendarDays],
  ['Private journal', BookOpenText],
  ['Mood tracking', Sparkles],
  ['Achievements', Trophy],
  ['XP & levels', Flame],
  ['Home widgets', Smartphone],
  ['Screen time', ChartLine],
  ['Cloud sync', Cloud],
  ['Offline PWA', WifiOff],
  ['Export PDF', Download],
  ['Gentle nudges', Bell],
]

const reviews = [
  {
    quote: 'It makes consistency feel beautiful instead of exhausting.',
    name: 'Maya, Product Designer',
    score: '5.0',
  },
  {
    quote: 'The first habit app I have actually wanted to open every morning.',
    name: 'Rohan, Founder',
    score: '5.0',
  },
  {
    quote: 'I stopped chasing perfect days. I started building a real life.',
    name: 'Nina, Writer',
    score: '5.0',
  },
  {
    quote: 'The tree is a small thing, but it changed how I see the boring days.',
    name: 'Eli, Architect',
    score: '5.0',
  },
]

function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.1,
    })
    let frameId = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }

    lenis.on('scroll', ScrollTrigger.update)
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [])
}

function useCinematicVideoLoop(videoRef: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let animationFrame = 0
    let restartTimer = 0
    let fadingOut = false

    const fadeIn = () => {
      requestAnimationFrame(() => {
        video.style.opacity = '1'
      })
    }

    const beginPlayback = () => {
      video.style.opacity = '0'
      video
        .play()
        .then(fadeIn)
        .catch(() => {
          // Some data-saver modes block autoplay; controls are intentionally omitted.
        })
    }

    const watchPlayback = () => {
      const { currentTime, duration } = video
      if (Number.isFinite(duration) && duration > 0 && duration - currentTime <= 0.5 && !fadingOut) {
        fadingOut = true
        video.style.opacity = '0'
      }
      animationFrame = requestAnimationFrame(watchPlayback)
    }

    const restart = () => {
      video.style.opacity = '0'
      restartTimer = window.setTimeout(() => {
        video.currentTime = 0
        fadingOut = false
        video.play().then(fadeIn).catch(() => undefined)
      }, 100)
    }

    video.style.transition = 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)'
    video.loop = false
    video.muted = true
    video.playsInline = true
    video.addEventListener('canplay', beginPlayback, { once: true })
    video.addEventListener('ended', restart)
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) beginPlayback()
    animationFrame = requestAnimationFrame(watchPlayback)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(restartTimer)
      video.removeEventListener('ended', restart)
    }
  }, [videoRef])
}

function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 90, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.17em] uppercase',
        light ? 'text-white/60' : 'text-zinc-500',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', light ? 'bg-[#82E5A1]' : 'bg-[#22C55E]')} />
      {children}
    </div>
  )
}

function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0)',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.06)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 28 }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-transparent px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-7',
        scrolled && 'backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-13 max-w-[1440px] items-center justify-between">
        <a href="#home" className="font-display text-[27px] leading-none tracking-tight" aria-label="GrindLog home">
          GrindLog
        </a>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="group relative text-xs font-medium text-zinc-500 transition-colors hover:text-black"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <a href="https://grindlog.in/auth/signin">
          <Button aria-label="Open App" className="h-10 px-4 text-xs sm:h-11 sm:px-5">
            <span>Open App</span>
            <ArrowUpRight size={14} className="ml-1.5" />
          </Button>
        </a>
      </div>
    </motion.header>
  )
}

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll()
  const contentOpacity = useTransform(scrollYProgress, [0, 0.11], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.11], [0, -90])
  const softY = useSpring(contentY, { stiffness: 120, damping: 30 })

  useCinematicVideoLoop(videoRef)

  return (
    <section id="home" className="grain relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pt-20 pb-12 sm:px-8">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover"
        src={VIDEO_URL}
        preload="metadata"
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/25 to-white opacity-[0.83]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/75 to-transparent" />
      <motion.div style={{ opacity: contentOpacity, y: softY }} className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.25 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/55 px-3 py-1.5 text-[10px] font-semibold tracking-[0.13em] text-zinc-600 uppercase backdrop-blur-md"
        >
          <Sparkles size={12} className="text-[#22C55E]" /> Your personal growth OS
        </motion.div>
        <h1 className="display-balance w-full max-w-[340px] font-display text-[3.1rem] leading-[0.87] tracking-[-0.055em] text-black sm:max-w-none sm:text-[clamp(4.4rem,10.1vw,9.25rem)]">
          The Habit Tracker<br />
          That Helps You<br />
          <span className="italic">Stay Consistent.</span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.42 }}
          className="mt-8 w-full max-w-[330px] text-[0.94rem] leading-relaxed text-[#6F6F6F] sm:max-w-[610px] sm:text-lg"
        >
          The personal growth operating system powered by AI. Build habits. Grow your Tree of Life. Unlock your best self.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.56 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
        >
          <a href="https://grindlog.in/onboarding">
            <Button className="min-w-[166px] bg-[#22C55E] text-white hover:bg-[#16A34A]">
              <Download size={16} className="mr-1.5" />
              Install App
            </Button>
          </a>
          <a href="#demo"><Button variant="secondary" className="min-w-[166px]"><Play size={14} fill="currentColor" className="mr-1.5" /> Watch Demo</Button></a>
        </motion.div>
      </motion.div>
      <motion.a
        href="#tree"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 z-10 flex flex-col items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-zinc-500 uppercase"
      >
        Scroll to grow
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="h-6 w-px bg-zinc-400" />
      </motion.a>
    </section>
  )
}

function TreeScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const seedRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<SVGGElement>(null)
  const trunkRef = useRef<SVGGElement>(null)
  const canopyRef = useRef<SVGGElement>(null)
  const leafRefs = useRef<SVGGElement[]>([])

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      const leaves = leafRefs.current.filter(Boolean)
      gsap.set([rootRef.current, trunkRef.current, canopyRef.current], { transformOrigin: '50% 100%' })
      gsap.set(rootRef.current, { scaleX: 0, opacity: 0 })
      gsap.set(trunkRef.current, { scaleY: 0.06, opacity: 0.12 })
      gsap.set(canopyRef.current, { scale: 0.06, opacity: 0 })
      gsap.set(leaves, { scale: 0, opacity: 0, transformOrigin: '50% 50%' })
      gsap.set(seedRef.current, { scale: 1, opacity: 1 })
      gsap.set(dropRef.current, { y: -150, opacity: 0 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom 34%',
          scrub: 1.05,
        },
      })
      timeline
        .to(dropRef.current, { y: 70, opacity: 1, duration: 0.22, ease: 'power2.in' })
        .to(dropRef.current, { scaleY: 0.25, scaleX: 1.7, opacity: 0, duration: 0.1, ease: 'power2.out' })
        .to(seedRef.current, { scale: 0.46, opacity: 0, duration: 0.14 }, '<0.05')
        .to(trunkRef.current, { scaleY: 1, opacity: 1, duration: 0.4, ease: 'power2.out' })
        .to(rootRef.current, { scaleX: 1, opacity: 1, duration: 0.24, ease: 'power2.out' }, '<0.14')
        .to(canopyRef.current, { scale: 1, opacity: 1, duration: 0.56, ease: 'back.out(1.1)' }, '<0.16')
        .to(leaves, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.025, ease: 'back.out(1.7)' }, '<0.24')
    }, sectionRef)

    return () => context.revert()
  }, [])

  return (
    <section id="tree" ref={sectionRef} className="relative isolate overflow-hidden bg-[#F8FAFC] px-5 py-24 sm:px-8 sm:py-36 lg:py-44">
      <div className="soft-grid pointer-events-none absolute inset-0 opacity-45 mask-radial" />
      <div className="mx-auto grid max-w-[1290px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal className="relative z-10 max-w-md">
          <Eyebrow>Tree of Life</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Consistency changes everything.
          </h2>
          <p className="mt-7 max-w-sm text-base leading-relaxed text-[#6F6F6F] sm:text-lg">
            GrindLog gives your effort a shape. Every check-in nurtures a living reflection of the person you are becoming.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-black/8 pt-7">
            <div><p className="font-display text-3xl tracking-tight">1 day</p><p className="mt-1 text-xs text-zinc-500">A seed</p></div>
            <div><p className="font-display text-3xl tracking-tight">365 days</p><p className="mt-1 text-xs text-zinc-500">A world of proof</p></div>
          </div>
        </Reveal>

        <div className="relative mx-auto h-[460px] w-full max-w-[650px] sm:h-[600px] lg:h-[690px]">
          <div className="absolute inset-x-[4%] bottom-[4%] h-[18%] rounded-[50%] bg-[#BFF0CA]/60 blur-3xl" />
          {[...Array(20)].map((_, index) => (
            <motion.span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-[#22C55E]/55"
              style={{ left: `${12 + ((index * 29) % 76)}%`, top: `${10 + ((index * 37) % 72)}%` }}
              animate={{ y: [0, -10 - (index % 5) * 4, 0], opacity: [0.12, 0.7, 0.12] }}
              transition={{ duration: 3.5 + (index % 3), repeat: Infinity, delay: index * 0.14, ease: 'easeInOut' }}
            />
          ))}
          <motion.div animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[11%] top-[21%] h-3 w-3 rotate-45 rounded-[2px] bg-[#7DD3FC]/80" />
          <motion.div animate={{ y: [0, 7, 0], rotate: [42, 50, 42] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-[12%] top-[34%] h-3 w-3 rotate-45 rounded-[2px] bg-[#F9A8D4]/75" />
          <div ref={dropRef} className="absolute left-1/2 top-[15%] z-20 h-8 w-5 -translate-x-1/2 rounded-[100%_0_100%_100%] rotate-45 bg-[#60A5FA] shadow-[0_0_25px_rgba(96,165,250,0.55)]" />
          <div ref={seedRef} className="absolute bottom-[22%] left-1/2 z-20 h-5 w-8 -translate-x-1/2 rotate-[-16deg] rounded-[100%_0_100%_0] bg-[#6B4F35] shadow-lg" />
          <svg viewBox="0 0 680 720" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="A tree grows as the page is scrolled">
            <defs>
              <linearGradient id="trunk" x1="0" x2="1">
                <stop offset="0" stopColor="#553B2B" />
                <stop offset="0.48" stopColor="#8A6149" />
                <stop offset="1" stopColor="#4A3226" />
              </linearGradient>
              <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#D6F7B2" />
                <stop offset="0.45" stopColor="#66C85C" />
                <stop offset="1" stopColor="#208B4B" />
              </linearGradient>
              <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <ellipse cx="340" cy="652" rx="234" ry="29" fill="#2E8B5740" />
            <g ref={rootRef}>
              <path d="M340 625 C300 646 248 641 175 664 M340 625 C384 650 458 645 530 665 M340 625 C326 650 310 673 299 692 M340 625 C356 649 376 671 390 694" fill="none" stroke="#5B3D2D" strokeWidth="13" strokeLinecap="round" />
              <path d="M340 635 C295 665 229 675 182 698 M340 635 C390 671 455 681 513 701" fill="none" stroke="#734D39" strokeWidth="6" strokeLinecap="round" opacity=".8" />
            </g>
            <g ref={trunkRef}>
              <path d="M337 636 C343 558 330 501 339 425 C344 356 324 307 334 250 C336 231 347 229 353 250 C366 303 348 355 358 425 C369 508 355 567 369 637 Z" fill="url(#trunk)" />
              <path d="M343 455 C303 415 268 395 223 354 M349 409 C394 370 443 350 485 305 M340 338 C295 305 271 272 247 225 M353 330 C392 289 431 263 474 215" fill="none" stroke="#684634" strokeWidth="21" strokeLinecap="round" />
              <path d="M348 454 C309 414 270 393 228 356 M351 408 C396 369 441 349 482 308 M344 337 C300 301 274 270 251 226 M354 329 C394 288 431 261 472 218" fill="none" stroke="#9B7054" strokeWidth="5" strokeLinecap="round" opacity=".56" />
            </g>
            <g ref={canopyRef} filter="url(#glow)">
              <path d="M143 319 C126 238 191 174 273 190 C295 109 412 96 448 181 C532 144 602 221 564 299 C629 352 579 453 499 445 C466 508 368 501 336 442 C264 502 164 471 175 386 C117 380 99 347 143 319Z" fill="#3EA856" opacity=".94" />
              <path d="M176 295 C211 216 282 209 322 236 C348 155 425 165 462 225 C524 194 569 244 543 302 C581 349 536 410 475 394 C446 462 369 447 342 401 C275 454 201 424 207 359 C154 356 145 323 176 295Z" fill="url(#leaf)" />
              <path d="M196 262 C253 210 299 225 328 255 M386 185 C414 230 430 260 431 291 M477 235 C438 270 426 304 438 333 M252 380 C298 362 323 337 336 300 M366 399 C382 354 409 331 460 319" fill="none" stroke="#BDF59C" strokeWidth="4" strokeLinecap="round" opacity=".42" />
            </g>
            {[
              [179, 266], [217, 216], [281, 168], [349, 150], [422, 164], [490, 203], [544, 270], [554, 335], [507, 398], [437, 437], [278, 430], [205, 386], [150, 334], [330, 218], [404, 269], [244, 315], [344, 357], [452, 343],
            ].map(([cx, cy], index) => (
              <g key={index} ref={(element) => { if (element) leafRefs.current[index] = element }}>
                <ellipse cx={cx} cy={cy} rx="17" ry="9" transform={`rotate(${(index * 37) % 160} ${cx} ${cy})`} fill={index % 3 === 0 ? '#E6FFC8' : index % 3 === 1 ? '#70D168' : '#249650'} />
                {index % 4 === 0 && <circle cx={cx + 8} cy={cy - 6} r="3" fill="#FFF6B1" />}
              </g>
            ))}
            <path d="M88 224 q9 -8 18 0 q9 -8 18 0 M554 169 q9 -8 18 0 q9 -8 18 0" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
          </svg>
          <div className="absolute bottom-[6%] right-[8%] rounded-full border border-white/70 bg-white/65 px-3 py-2 text-[10px] font-medium text-zinc-600 shadow-sm backdrop-blur-md">
            126 days, still growing
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneMockup({ kind, label, className }: { kind: 'today' | 'calendar' | 'insights' | 'hero-phones'; label: string; className?: string }) {
  return (
    <motion.div
      className={cn('relative w-[230px] shrink-0 transition-colors hover:z-10 sm:w-[260px]', className)}
      initial={{ opacity: 0, y: 48, rotate: kind === 'calendar' ? 7 : kind === 'insights' ? -7 : 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: kind === 'calendar' ? 7 : kind === 'insights' ? -7 : 0 }}
      whileHover={{ y: -10, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 75, damping: 19 }}
    >
      <img src={`/${kind}.png`} alt={`${label} screen`} className="w-full h-auto object-contain rounded-[44px] drop-shadow-[0_25px_40px_rgba(0,0,0,0.12)]" />
      <p className="mt-4 text-center text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</p>
    </motion.div>
  )
}

function PhoneShowcase() {
  return (
    <section id="demo" className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1290px]">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Made for your days</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Your life, held with more intention.</h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6F6F6F] sm:text-lg">A calm place to plan, notice, reflect, and begin again. Every view has a reason to exist.</p>
        </Reveal>
        <div className="mt-14 flex gap-7 overflow-x-auto px-4 pb-8 hide-scrollbar sm:justify-center sm:gap-11 lg:mt-20">
          <PhoneMockup kind="calendar" label="Today" className="mt-8" />
          <PhoneMockup kind="today" label="Calendar" />
          <PhoneMockup kind="insights" label="Planner" className="mt-8" />
          <PhoneMockup kind="hero-phones" label="Analytics" className="mt-3" />
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="bg-[#F8FAFC] px-5 py-24 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1290px]">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <Reveal className="max-w-md"><Eyebrow>Everything compounds</Eyebrow><h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl">The tools to become someone you trust.</h2></Reveal>
          <Reveal delay={0.1} className="max-w-lg lg:pb-1"><p className="text-base leading-relaxed text-[#6F6F6F] sm:text-lg">Small rituals need a system that feels personal enough to return to. GrindLog brings the whole picture into one gentle rhythm.</p></Reveal>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {featureCards.map(({ title, body, icon: Icon, accent, mark }, index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ type: 'spring', stiffness: 90, damping: 22, delay: index * 0.05 }} whileHover={{ y: -6 }} className={cn('min-h-[330px] overflow-hidden rounded-[28px] p-6 sm:p-7', accent)}>
              <div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 shadow-[0_6px_18px_rgba(0,0,0,0.045)]"><Icon size={21} /></div><span className="text-[10px] font-semibold tracking-[0.15em] text-zinc-500 uppercase">{mark}</span></div>
              <div className="mt-20"><h3 className="max-w-[280px] font-display text-3xl leading-[0.95] tracking-[-0.035em]">{title}</h3><p className="mt-4 max-w-[290px] text-sm leading-relaxed text-zinc-600">{body}</p></div>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }} className="mt-7 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"><ArrowUpRight size={14} /></motion.div>
            </motion.article>
          ))}
        </div>
        <GamificationShowcase />
      </div>
    </section>
  )
}

function GamificationShowcase() {
  const elements = [
    { name: 'Achievements', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Leaderboards', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'XP', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Coins', icon: Coins, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: 'Quests', icon: Swords, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Season Pass', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Store', icon: Store, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ]

  return (
    <div className="mt-16 overflow-hidden rounded-[40px] bg-[#0A0D0B] p-8 sm:p-12 lg:p-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow light>Build Habits Like a Game</Eyebrow>
            <h3 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">Real life deserves better rewards.</h3>
            <p className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
              Complete habits. Earn XP. Unlock achievements. Collect coins. Compete with friends. Stay consistent because progress feels exciting.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {elements.map((el, i) => (
            <motion.div
              key={el.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.2 } }}
              className={cn(
                "flex cursor-default flex-col items-center justify-center rounded-[24px] border border-white/5 bg-white/5 p-5 text-center transition-colors hover:bg-white/10",
                i === 6 ? "sm:col-start-2" : ""
              )}
            >
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', el.bg, el.color)}>
                <el.icon size={22} />
              </div>
              <span className="mt-4 text-[11px] font-medium tracking-wide text-white/80 uppercase">{el.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureComparisonTable() {
  const comparisonData = [
    { name: 'Habit Tracker', icon: CircleCheck, typical: true, grindlog: true },
    { name: 'AI Coach', icon: Brain, typical: false, grindlog: true },
    { name: 'Growth Tree', icon: Leaf, typical: false, grindlog: true },
    { name: 'Seasons', icon: Flame, typical: false, grindlog: true },
    { name: 'Quests', icon: Swords, typical: false, grindlog: true },
    { name: 'Achievements', icon: Trophy, typical: false, grindlog: true },
    { name: 'Leaderboards', icon: Crown, typical: false, grindlog: true },
    { name: 'Analytics', icon: BarChart2, typical: 'Basic', grindlog: 'Advanced' },
    { name: 'Personal Growth OS', icon: Sparkles, typical: false, grindlog: true },
    { name: 'Mobile Push Notifications', icon: Bell, typical: false, grindlog: 'Instant Push' },
    { name: 'Built Exclusively for Mobile', icon: Smartphone, typical: 'Laptop Only', grindlog: 'Mobile First' },
  ]

  return (
    <section className="bg-[#F8FAFC] px-4 pb-24 pt-8 sm:px-8 sm:pb-36">
      <div className="mx-auto max-w-[900px]">
        {/* Section Header */}
        <Reveal className="mb-10 text-center">
          <Eyebrow>Why GrindLog Wins</Eyebrow>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Built for mobile users who want real growth.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            See how manual Excel laptop sheets compare to GrindLog's mobile experience.
          </p>
        </Reveal>

        {/* Comparison Table Container */}
        <div className="overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/8 bg-zinc-50/70">
                  <th className="py-4 pl-5 pr-3 font-semibold text-zinc-900 sm:py-5 sm:pl-8 sm:pr-4">Feature</th>
                  <th className="w-1/3 py-4 px-3 text-center font-semibold text-zinc-500 sm:py-5 sm:px-4">
                    Excel / Laptop Trackers
                  </th>
                  <th className="w-1/3 py-4 pr-5 pl-3 text-center sm:py-5 sm:pr-8 sm:pl-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/15 px-3 py-1 font-semibold text-[#16A34A] shadow-sm">
                      <Sparkles size={14} className="text-[#22C55E]" />
                      <span>GrindLog</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {comparisonData.map((item, index) => (
                  <motion.tr
                    key={item.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group transition-colors hover:bg-emerald-50/30"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-medium text-zinc-800 sm:py-4 sm:pl-8 sm:pr-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-[#22C55E]/10 group-hover:text-[#16A34A]">
                          <item.icon size={16} />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center sm:py-4 sm:px-4">
                      {typeof item.typical === 'boolean' ? (
                        item.typical ? (
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                            <Check size={15} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100/70 text-zinc-400">
                            <X size={15} strokeWidth={2.5} />
                          </div>
                        )
                      ) : (
                        <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                          {item.typical}
                        </span>
                      )}
                    </td>
                    <td className="bg-[#22C55E]/[0.02] py-3.5 pr-5 pl-3 text-center sm:py-4 sm:pr-8 sm:pl-4">
                      {typeof item.grindlog === 'boolean' ? (
                        item.grindlog ? (
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#16A34A] shadow-sm">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                            <X size={15} strokeWidth={2.5} />
                          </div>
                        )
                      ) : (
                        <span className="inline-block rounded-full bg-[#22C55E]/15 px-3 py-1 text-xs font-semibold text-[#16A34A] shadow-sm">
                          {item.grindlog}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dedicated Pros & Cons Section: Excel (Laptop Only) vs GrindLog (Mobile First) */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* CONS CARD: Excel & Laptop Trackers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] border border-rose-200/60 bg-rose-50/30 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Laptop size={20} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-zinc-900">Excel / Desktop Trackers</h4>
                  <p className="text-xs text-rose-700 font-medium">Laptop Only Limitations</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700">Cons</span>
            </div>

            <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-zinc-700">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <X size={13} strokeWidth={3} />
                </div>
                <span><strong>Laptop Only:</strong> Hard & clunky to open or edit when you are on your smartphone on the go.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <X size={13} strokeWidth={3} />
                </div>
                <span><strong>Zero Push Notifications:</strong> No mobile reminders to pop up when you forget a daily habit.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <X size={13} strokeWidth={3} />
                </div>
                <span><strong>Static & Boring:</strong> Manual spreadsheets offer zero rewards, XP, tree growth, or motivation.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <X size={13} strokeWidth={3} />
                </div>
                <span><strong>No AI Guidance:</strong> Raw formulas without personal habit coaching or intelligent feedback.</span>
              </li>
            </ul>
          </motion.div>

          {/* PROS CARD: GrindLog Mobile App */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-[28px] border border-[#22C55E]/30 bg-gradient-to-b from-[#131B15] to-[#0A0D0B] p-6 sm:p-8 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-white">GrindLog App</h4>
                  <p className="text-xs text-[#22C55E] font-medium">Built Exclusively for Mobile</p>
                </div>
              </div>
              <span className="rounded-full bg-[#22C55E]/20 px-3 py-1 text-[11px] font-semibold text-[#22C55E] border border-[#22C55E]/30">
                Pros (Recommended)
              </span>
            </div>

            <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span><strong className="text-white">Built Exclusively for Mobile:</strong> Designed to fit right in your pocket on your phone for daily ease.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span><strong className="text-white">Smart Mobile Push Notifications:</strong> Automated mobile reminders pop up directly on your phone.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span><strong className="text-white">Gamified Momentum:</strong> Earn XP, level up your Virtual Tree, collect coins & unlock badges.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span><strong className="text-white">Personal AI Coach:</strong> Remembers your daily energy and guides your habits on your phone.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CountValue({ value, suffix = '', decimal = false }: { value: number; suffix?: string; decimal?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const start = performance.now()
    const duration = 1050
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return <span ref={ref}>{decimal ? display.toFixed(1) : Math.round(display)}{suffix}</span>
}

function LineChart() {
  return (
    <svg viewBox="0 0 420 190" className="h-[180px] w-full overflow-visible" role="img" aria-label="Weekly focus chart trending upward">
      {[34, 79, 124, 169].map((y) => <line key={y} x1="0" x2="420" y1={y} y2={y} stroke="#E9EDF0" strokeWidth="1" />)}
      <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1] }} d="M0 145 C28 148 38 129 64 132 S96 149 118 113 S155 102 178 112 S213 136 239 83 S282 105 305 70 S341 75 364 42 S399 52 420 14" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
      <motion.path initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.5 }} d="M0 145 C28 148 38 129 64 132 S96 149 118 113 S155 102 178 112 S213 136 239 83 S282 105 305 70 S341 75 364 42 S399 52 420 14 L420 190 L0 190 Z" fill="url(#chartFill)" opacity=".32" />
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#60A5FA" stopOpacity=".4" /><stop offset="1" stopColor="#DBEAFE" stopOpacity="0" /></linearGradient></defs>
      {[64, 118, 178, 239, 305, 364, 420].map((cx, index) => <motion.circle key={cx} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.55 + index * 0.08 }} cx={cx} cy={[132, 113, 112, 83, 70, 42, 14][index]} r="4" fill="white" stroke="#2563EB" strokeWidth="3" />)}
    </svg>
  )
}

function Analytics() {
  const barHeights = [42, 64, 48, 84, 70, 98, 78]
  const discoverItems = [
    { label: 'Your best habits', icon: Star, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    { label: 'Weakest habits', icon: Target, color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
    { label: 'Most productive hours', icon: Flame, color: 'text-orange-600 bg-orange-500/10 border-orange-500/20' },
    { label: 'Mood patterns', icon: Sparkles, color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' },
    { label: 'Weekly progress', icon: ChartLine, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
    { label: 'Life balance', icon: Leaf, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  ]

  return (
    <section id="analytics" className="px-5 py-24 sm:px-8 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-[1290px]">
        <Reveal className="max-w-3xl">
          <Eyebrow>Analytics</Eyebrow>
          <h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            You can't improve what you don't measure.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6F6F6F] sm:text-lg">
            See your growth instead of guessing.
          </p>
        </Reveal>

        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="mt-10 text-xs font-semibold tracking-[0.14em] text-zinc-500 uppercase">Discover</motion.p>
        <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
          {discoverItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 110, damping: 18 }}
              whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.18 } }}
              className={cn(
                'flex cursor-default items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-sm sm:text-sm',
                item.color
              )}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <motion.article initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ type: 'spring', stiffness: 88, damping: 22 }} className="overflow-hidden rounded-[28px] border border-black/6 bg-[#FBFCFF] p-5 sm:p-7 lg:col-span-7">
            <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-zinc-500">Focus rhythm</p><p className="mt-2 text-4xl font-semibold tracking-[-0.05em]"><CountValue value={28} suffix="%" /></p><p className="mt-1 text-xs text-[#22A455]">+ 6.4% from last week</p></div><motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.3 }} className="rounded-full bg-[#E8F0FF] px-3 py-1.5 text-[10px] font-semibold text-[#2563EB]">7 days</motion.div></div>
            <div className="mt-9"><LineChart /></div>
            <div className="mt-1 flex justify-between px-1 text-[10px] text-zinc-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ type: 'spring', stiffness: 88, damping: 22, delay: 0.06 }} className="rounded-[28px] bg-[#ECFDF3] p-5 sm:p-7 lg:col-span-5">
            <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-zinc-500">Habit completion</p><p className="mt-2 text-4xl font-semibold tracking-[-0.05em]"><CountValue value={94} suffix="%" /></p><p className="mt-1 text-xs text-[#23924D]">Your most consistent week yet</p></div><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/65"><CircleCheck size={20} className="text-[#22A455]" /></div></div>
            <div className="mt-12 flex h-[160px] items-end justify-between gap-2">{barHeights.map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><motion.div initial={{ height: 0 }} whileInView={{ height }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 70, damping: 16, delay: index * 0.05 }} className={cn('w-full rounded-t-xl', index === 5 ? 'bg-[#22C55E]' : 'bg-[#A7EBC0]')} /><span className="text-[9px] text-zinc-400">{['M','T','W','T','F','S','S'][index]}</span></div>)}</div>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ type: 'spring', stiffness: 88, damping: 22, delay: 0.1 }} className="rounded-[28px] bg-[#0D1710] p-5 text-white sm:p-7 lg:col-span-4">
            <p className="text-xs font-medium text-white/55">Your energy mix</p>
            <div className="mt-8 flex items-center gap-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.4, rotate: -45 }} 
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
                viewport={{ once: true }} 
                transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 }}
                className="relative h-[128px] w-[128px] shrink-0 rounded-full" 
                style={{ background: 'conic-gradient(#7DE48A 0 42%, #5B8DEF 42% 72%, #F7C95C 72% 89%, #FFFFFF22 89% 100%)' }}
              >
                <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[#0D1710]">
                  <span className="text-2xl font-semibold tracking-tight"><CountValue value={42} suffix="%" /></span>
                  <span className="text-[8px] text-white/45">focused</span>
                </div>
              </motion.div>
              <div className="space-y-2.5 text-[10px]">
                {[['Focus','bg-[#7DE48A]'],['Move','bg-[#5B8DEF]'],['Rest','bg-[#F7C95C]'],['Other','bg-white/20']].map(([label, color], i) => (
                  <motion.div 
                    key={label} 
                    initial={{ opacity: 0, x: 15 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ type: 'spring', stiffness: 80, damping: 16, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className={cn('h-2 w-2 rounded-full', color)} />
                    <span className="text-white/68">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-white/65">You are protecting your best hours more often.</p>
          </motion.article>
          <motion.article initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ type: 'spring', stiffness: 88, damping: 22, delay: 0.14 }} className="rounded-[28px] border border-black/6 bg-[#FFFDF9] p-5 sm:p-7 lg:col-span-8">
            <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-zinc-500">Quiet consistency</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em]"><CountValue value={126} /> days</p></div><motion.span initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.5 }} className="rounded-full bg-[#FFF1CC] px-3 py-1.5 text-[10px] font-semibold text-[#9E6A12]">Personal best</motion.span></div>
            <div className="mt-8 grid grid-cols-14 gap-1.5">{Array.from({ length: 70 }).map((_, index) => <motion.span key={index} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 18, delay: (index % 14) * 0.015 + Math.floor(index / 14) * 0.045 }} className={cn('aspect-square rounded-[3px]', index % 11 === 2 || index % 9 === 0 ? 'bg-[#DBE7DD]' : index % 5 === 0 ? 'bg-[#8DDD9A]' : 'bg-[#D9F4DE]')} />)}</div>
            <div className="mt-3 flex justify-between text-[10px] text-zinc-400"><span>8 weeks ago</span><span>This week</span></div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

function CalendarExperience() {
  const days = [
    { number: 29, muted: true }, { number: 30, muted: true }, { number: 1, status: 'green' }, { number: 2, status: 'green' }, { number: 3, status: 'green' }, { number: 4, status: 'mixed' }, { number: 5, status: 'red' },
    { number: 6, status: 'green' }, { number: 7, status: 'green' }, { number: 8, status: 'green' }, { number: 9, status: 'green' }, { number: 10, status: 'mixed' }, { number: 11, status: 'green' }, { number: 12, status: 'green' },
    { number: 13, status: 'green' }, { number: 14, status: 'red' }, { number: 15, status: 'green' }, { number: 16, status: 'green' }, { number: 17, status: 'green' }, { number: 18, status: 'mixed' }, { number: 19, status: 'green' },
    { number: 20, status: 'green' }, { number: 21, status: 'green' }, { number: 22, status: 'mixed' }, { number: 23, status: 'green' }, { number: 24, status: 'green' }, { number: 25, status: 'red' }, { number: 26, status: 'green' },
    { number: 27, status: 'green' }, { number: 28, status: 'green' }, { number: 29, status: 'green' }, { number: 30, status: 'mixed' }, { number: 31, status: 'green' }, { number: 1, muted: true }, { number: 2, muted: true },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#FCFDFB] px-5 py-24 sm:px-8 sm:py-36 lg:py-44">
      <div className="pointer-events-none absolute -left-28 top-16 h-[460px] w-[460px] rounded-full bg-[#D9F7DF]/65 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-24">
        <Reveal className="max-w-[455px]">
          <Eyebrow>Calendar</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-[4.25rem]">
            One glance tells the story of your month.
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[#67746B] sm:text-lg">
            A calm, honest view of the promises you kept—and the opportunities waiting to be reclaimed.
          </p>
          <div className="mt-10 space-y-4 border-t border-[#18331F]/9 pt-7 text-sm sm:text-[15px]">
            <div className="flex items-center gap-3 text-[#415046]"><span className="h-3 w-3 rounded-[4px] bg-[#58C974] shadow-[0_0_0_4px_rgba(88,201,116,0.12)]" />Green means growth.</div>
            <div className="flex items-center gap-3 text-[#415046]"><span className="h-3 w-3 rounded-[4px] bg-[#EB7774] shadow-[0_0_0_4px_rgba(235,119,116,0.12)]" />Red means missed opportunities.</div>
            <div className="flex items-center gap-3 font-medium text-[#1B3521]"><CalendarDays size={16} className="text-[#249F52]" />Every day matters.</div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[545px]">
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[34px] border border-white/90 bg-white/85 p-4 shadow-[0_30px_75px_rgba(31,75,43,0.13)] backdrop-blur-xl sm:p-6">
            <div className="absolute -inset-8 -z-10 rounded-[55px] bg-[#BCEEC6]/55 blur-3xl" />
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-semibold tracking-[0.14em] text-[#859187] uppercase">Your month</p><p className="mt-1 font-display text-[2rem] leading-none tracking-[-0.04em] text-[#16241A]">July 2026</p></div>
              <motion.div initial={{ opacity: 0, scale: 0.86 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 130, damping: 17, delay: 0.35 }} className="rounded-2xl bg-[#E8F8EC] px-3 py-2 text-right"><p className="text-[10px] font-medium text-[#57715E]">Month in motion</p><p className="mt-0.5 text-sm font-bold tracking-[-0.03em] text-[#198A43]">82% kept</p></motion.div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-y-3 text-center text-[10px] font-semibold text-[#94A096]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {days.map((day, index) => (
                <motion.div
                  key={`${day.number}-${index}`}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ type: 'spring', stiffness: 190, damping: 17, delay: index * 0.018 + 0.16 }}
                  className={cn('relative flex aspect-square items-center justify-center rounded-xl text-xs font-semibold sm:rounded-2xl sm:text-sm', day.muted ? 'text-[#C5CDC7]' : 'text-[#314138]', day.status === 'green' && 'bg-[#DFF5E4]', day.status === 'mixed' && 'bg-[#FFF2CF]', day.status === 'red' && 'bg-[#FCE2E0]', day.number === 24 && 'ring-2 ring-[#1B9A4B] ring-offset-2')}
                >
                  {day.number}
                  {day.status && <motion.span animate={day.number === 24 ? { opacity: [0.45, 1, 0.45], scale: [0.82, 1, 0.82] } : undefined} transition={{ duration: 1.8, repeat: Infinity }} className={cn('absolute bottom-1 h-1 w-1 rounded-full sm:bottom-1.5', day.status === 'green' ? 'bg-[#33AD58]' : day.status === 'mixed' ? 'bg-[#E7A327]' : 'bg-[#DE6866]')} />}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.9 }} className="mt-5 flex items-center justify-between rounded-2xl bg-[#13261A] px-4 py-3 text-white">
              <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#9CE6AA]"><Sparkles size={15} /></span><div><p className="text-xs font-semibold">Your strongest rhythm</p><p className="mt-0.5 text-[10px] text-white/55">Morning habits, six days in a row</p></div></div>
              <ArrowUpRight size={16} className="text-[#A8F0B5]" />
            </motion.div>
          </motion.div>
          <motion.div aria-hidden="true" animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-5 -left-2 rounded-2xl border border-white/90 bg-white/85 px-3.5 py-2.5 text-[10px] font-semibold text-[#277642] shadow-[0_14px_30px_rgba(37,107,59,0.12)] backdrop-blur sm:-left-9"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#38B85B]" />23 days of growth</motion.div>
        </Reveal>
      </div>
    </section>
  )
}

function PlannerExperience() {
  const routines: Array<{ title: string; icon: LucideIcon; color: string; tasks: Array<[string, boolean]> }> = [
    { title: 'Morning', icon: CloudSun, color: 'bg-[#FFF1C7] text-[#A76B11]', tasks: [['Water before coffee', true], ['Read for 10 minutes', true], ['Set today\'s intention', false]] },
    { title: 'Afternoon', icon: Sparkles, color: 'bg-[#E5EEFF] text-[#3B69BA]', tasks: [['Take a short walk', true], ['Deep work, 45 minutes', false], ['Check in with your energy', false]] },
    { title: 'Night', icon: Moon, color: 'bg-[#EDE7FF] text-[#7254B8]', tasks: [['Reflect on the day', false], ['Prepare tomorrow', false], ['Phone down by 10:30', false]] },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#111913] px-5 py-24 text-white sm:px-8 sm:py-36 lg:py-44">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:42px_42px] mask-radial" />
      <motion.div aria-hidden="true" animate={{ x: [0, 36, 0], y: [0, -25, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -right-24 top-[18%] h-80 w-80 rounded-full bg-[#2E9E4A]/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1210px] gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-24">
        <Reveal className="max-w-[450px]">
          <Eyebrow light>Planner</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-[4.25rem]">Every habit exactly where it belongs.</h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/62 sm:text-lg">Give your day a rhythm that feels possible. A small list for the moment you&apos;re actually in.</p>
          <div className="mt-10 flex flex-wrap gap-2.5 text-xs font-semibold sm:text-sm"><span className="rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[#FFE49C]">Morning.</span><span className="rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[#B8D2FF]">Afternoon.</span><span className="rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[#D4C4FF]">Night.</span></div>
        </Reveal>

        <Reveal delay={0.12} className="relative mx-auto w-full max-w-[680px]">
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[32px] border border-white/10 bg-[#1A261C]/95 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.28)] sm:p-5">
            <div className="flex items-center justify-between border-b border-white/8 pb-4 sm:pb-5"><div><p className="text-[10px] font-semibold tracking-[0.14em] text-white/42 uppercase">Your day, gently arranged</p><p className="mt-1 text-lg font-semibold tracking-[-0.03em]">Tuesday, July 28</p></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2BBA5A]/15 text-[#8DEAA3]"><CircleCheck size={19} /></div></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {routines.map(({ title, icon: Icon, color, tasks }, routineIndex) => (
                <motion.article key={title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ type: 'spring', stiffness: 110, damping: 20, delay: routineIndex * 0.1 + 0.2 }} className="rounded-[22px] border border-white/7 bg-white/[0.045] p-4">
                  <div className="flex items-center justify-between"><span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', color)}><Icon size={17} /></span><span className="text-[10px] font-semibold text-white/38">{tasks.filter(([, done]) => done).length}/{tasks.length}</span></div>
                  <h3 className="mt-5 font-display text-2xl tracking-[-0.04em]">{title}</h3>
                  <div className="mt-4 space-y-2.5">
                    {tasks.map(([task, done], index) => (
                      <motion.div key={task} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.38 + routineIndex * 0.11 + index * 0.055 }} className="flex items-start gap-2 text-[11px] leading-snug text-white/62">
                        <motion.span animate={done ? { scale: [1, 1.12, 1] } : undefined} transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.15 }} className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border', done ? 'border-[#59CC72] bg-[#59CC72] text-[#142518]' : 'border-white/18')}>
                          {done && <Check size={11} strokeWidth={3} />}
                        </motion.span>
                        <span className={done ? 'text-white/86 line-through decoration-white/25' : ''}>{task}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#0F1711] p-3.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-[#98E9A9]"><Flame size={17} /></div><div className="min-w-0 flex-1"><div className="flex justify-between text-[10px] text-white/55"><span>Today&apos;s gentle momentum</span><span className="font-semibold text-[#9BE5A9]">3 of 9 complete</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/9"><motion.div initial={{ width: 0 }} whileInView={{ width: '33%' }} viewport={{ once: true }} transition={{ duration: 1.05, delay: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-[#58C973]" /></div></div></div>
          </motion.div>
          <motion.div aria-hidden="true" animate={{ y: [0, 7, 0], rotate: [0, 3, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-2 -top-5 flex items-center gap-2 rounded-2xl border border-white/12 bg-[#243C29] px-3.5 py-2.5 text-[10px] font-semibold text-[#B6F3C2] shadow-xl sm:-right-8"><Sparkles size={13} /> Right on time</motion.div>
        </Reveal>
      </div>
    </section>
  )
}

function PersonalizationExperience() {
  const [selectedTheme, setSelectedTheme] = useState(0)
  const themes = [
    { name: 'Sage dawn', colors: 'from-[#D8F5DD] via-[#A8DCB1] to-[#4AA36A]', frame: 'rounded-[18px]' },
    { name: 'Night bloom', colors: 'from-[#1C2140] via-[#6656A7] to-[#E3ABCE]', frame: 'rounded-[6px]' },
    { name: 'Warm ritual', colors: 'from-[#FFF0CE] via-[#F5B875] to-[#C95D4F]', frame: 'rounded-[28px]' },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#FAF8FC] px-5 py-24 sm:px-8 sm:py-36 lg:py-44">
      <div className="pointer-events-none absolute -left-28 bottom-[-10%] h-[460px] w-[460px] rounded-full bg-[#E5D8FF]/58 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-0 h-[390px] w-[390px] rounded-full bg-[#FFE3CB]/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
        <Reveal className="max-w-[470px]">
          <Eyebrow>Personalize everything</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-[4.25rem]">Make GrindLog feel like yours.</h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[#716879] sm:text-lg">Themes, frames, and future cosmetics turn your growth space into something you want to come back to.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[['Unlock themes', Palette], ['Customize your experience', LayoutGrid], ['Earn rewards', Trophy]].map(([label, Icon], index) => {
              const ItemIcon = Icon as LucideIcon
              return <motion.div key={label as string} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: index * 0.09 + 0.15 }} className="flex items-center gap-3 text-sm text-[#51495A]"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/75 text-[#805CC2] shadow-[0_5px_16px_rgba(92,63,137,0.08)]"><ItemIcon size={15} /></span>{label as string}</motion.div>
            })}
          </div>
          <p className="mt-7 font-display text-2xl tracking-[-0.03em] text-[#332A39]">Express yourself.</p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[560px]">
          <motion.div animate={{ y: [0, -7, 0], rotate: [0, 0.25, 0, -0.25, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[34px] border border-white/90 bg-[#1A1720] p-4 text-white shadow-[0_30px_80px_rgba(47,30,70,0.2)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_70%_0%,rgba(195,148,255,.34),transparent_68%)]" />
            <div className="relative flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#926AE0]/20 text-[#CDAEFF]"><Store size={18} /></span><div><p className="text-sm font-semibold">The Store</p><p className="mt-0.5 text-[10px] text-white/52">Make your space yours</p></div></div><div className="flex items-center gap-1.5 rounded-full bg-[#FFD668]/14 px-3 py-1.5 text-[10px] font-semibold text-[#FFDD7B]"><Coins size={13} /> 1,240</div></div>
            <div className="relative mt-5 grid grid-cols-[0.82fr_1.18fr] gap-3">
              <div className="rounded-[21px] border border-white/8 bg-white/[0.055] p-3.5"><p className="text-[10px] font-semibold tracking-[0.13em] text-white/42 uppercase">Equipped</p><motion.div layout className={cn('mt-4 aspect-[0.72] w-full bg-gradient-to-br p-3', themes[selectedTheme].colors, themes[selectedTheme].frame)}><div className="h-full rounded-[inherit] border border-white/45 bg-white/12 p-2"><div className="flex justify-between"><span className="h-2 w-7 rounded-full bg-white/70" /><span className="h-2 w-2 rounded-full bg-white/70" /></div><div className="mt-5 h-8 rounded-lg bg-white/48" /><div className="mt-2 h-12 rounded-lg bg-white/25" /><div className="mt-2 h-4 w-2/3 rounded-full bg-white/50" /></div></motion.div><p className="mt-3 truncate text-xs font-semibold">{themes[selectedTheme].name}</p><p className="mt-0.5 text-[10px] text-[#C2B9CB]">Active theme</p></div>
              <div className="rounded-[21px] border border-white/8 bg-white/[0.055] p-3.5"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold tracking-[0.13em] text-white/42 uppercase">Themes</p><span className="text-[10px] text-[#C7A8FF]">3 owned</span></div><div className="mt-3 grid grid-cols-3 gap-2">{themes.map((theme, index) => <motion.button key={theme.name} type="button" onClick={() => setSelectedTheme(index)} whileTap={{ scale: 0.94 }} whileHover={{ y: -3 }} aria-pressed={selectedTheme === index} className={cn('relative aspect-square overflow-hidden bg-gradient-to-br p-1.5 text-left transition-shadow', theme.colors, theme.frame, selectedTheme === index ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1720]' : 'opacity-75 hover:opacity-100')}><div className="h-full rounded-[inherit] border border-white/35 bg-white/10" />{selectedTheme === index && <motion.span layoutId="theme-check" className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#5E3A98]"><Check size={12} strokeWidth={3} /></motion.span>}</motion.button>)}</div><div className="mt-5 border-t border-white/8 pt-4"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold tracking-[0.13em] text-white/42 uppercase">Frames</p><LockKeyhole size={12} className="text-white/35" /></div><div className="mt-3 flex gap-2">{['rounded-[5px]','rounded-[14px]','rounded-[24px]'].map((frame, index) => <motion.span key={frame} animate={{ y: [0, index === 1 ? -2 : 0, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.2 }} className={cn('h-9 w-9 border-2 border-[#C9A9FF]', frame, index === 1 ? 'bg-[#A57AEE]' : 'bg-white/8')} />)}</div></div></div>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 19, delay: 0.7 }} className="relative mt-3 flex items-center justify-between rounded-2xl bg-[#2A2432] px-4 py-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD86C]/14 text-[#FFDC75]"><Crown size={15} /></span><div><p className="text-xs font-semibold">Next reward: Moonlit frame</p><p className="mt-0.5 text-[10px] text-white/45">260 XP to unlock</p></div></div><span className="text-[10px] font-semibold text-[#CFB0FF]">72%</span></motion.div>
          </motion.div>
          <motion.div aria-hidden="true" animate={{ y: [0, 7, 0], rotate: [0, -3, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-1 -top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-white/85 text-[#8A5DD0] shadow-[0_14px_30px_rgba(92,63,137,0.17)] backdrop-blur sm:-right-6"><Palette size={20} /></motion.div>
        </Reveal>
      </div>
    </section>
  )
}

function AiCoach() {
  const coachBenefits = [
    ['Daily encouragement', 'A little momentum for the day in front of you.'],
    ['Personal insights', 'Patterns that make your progress easier to understand.'],
    ['Smarter suggestions', 'The next right step, shaped around your real routine.'],
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#F5FAF6] px-5 py-24 sm:px-8 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_50%,rgba(179,241,193,0.54),transparent_30%),radial-gradient(circle_at_79%_45%,rgba(207,248,216,0.76),transparent_32%)]" />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 38, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-[#A7E8B4]/35 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1.04, 0.94, 1.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="pointer-events-none absolute -bottom-24 left-[23%] h-72 w-72 rounded-full bg-white/90 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
        <Reveal className="max-w-[470px]">
          <Eyebrow>AI Coach</Eyebrow>
          <h2 className="display-balance mt-5 font-display text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-[4.35rem]">
            Imagine having a coach that never forgets your goals.
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[#647168] sm:text-lg">
            Your AI Coach remembers what matters to you, notices your patterns, and makes it easier to show up again.
          </p>
          <div className="mt-10 space-y-5 border-t border-[#193524]/10 pt-7">
            {coachBenefits.map(([title, body], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: index * 0.1 + 0.16 }}
                className="flex gap-4"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DDF6E4] text-[#168646]">
                  <Check size={14} strokeWidth={2.8} />
                </span>
                <p className="text-sm leading-relaxed text-[#6A756D] sm:text-[15px]">
                  <strong className="font-semibold text-[#16251A]">{title}.</strong> {body}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-9 flex items-center gap-3 text-sm text-[#536158]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/75 shadow-[0_8px_22px_rgba(38,85,52,0.08)]">
              <ShieldCheck size={16} className="text-[#229D52]" />
            </span>
            Private by design, useful by default.
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[530px]">
          <motion.div
            animate={{ y: [0, -9, 0], rotate: [0, 0.45, 0, -0.45, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-10 rounded-[58px] bg-[#B8EDC5]/65 blur-3xl" />
            <div className="relative overflow-hidden rounded-[31px] border border-white/90 bg-[#FBFEFC]/85 p-3.5 shadow-[0_30px_80px_rgba(31,75,44,0.15)] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between border-b border-[#17301E]/8 pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.18)', '0 0 0 8px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12351F] text-[#A9F0B7]"
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.02em] text-[#122518]">Your AI Coach</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#279958]">Here for your next step</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#EAF8EE] px-2.5 py-1.5 text-[10px] font-semibold text-[#23884D]">
                  <motion.span animate={{ opacity: [0.45, 1, 0.45], scale: [0.85, 1, 0.85] }} transition={{ duration: 1.8, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-[#28C76F]" />
                  In sync
                </div>
              </div>

              <div className="grid gap-3 py-4 sm:grid-cols-[1.18fr_0.82fr]">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 20, delay: 0.24 }}
                  className="rounded-[20px] border border-[#183420]/7 bg-white/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-[#7B897F] uppercase">Today&apos;s focus</p>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ECF9EF] text-[#249C53]"><Target size={13} /></div>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-[#19271C]">Protect your morning momentum.</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E9F0EB]">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-[#39B961] to-[#94E6A6]" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#77847B]"><span>2 of 3 intentions</span><span className="font-semibold text-[#298B4B]">72%</span></div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 17, delay: 0.38 }}
                  className="relative overflow-hidden rounded-[20px] bg-[#183820] p-4 text-white"
                >
                  <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-[#5ED179]/25 blur-xl" />
                  <p className="relative text-[10px] font-semibold tracking-[0.12em] text-white/55 uppercase">Your rhythm</p>
                  <p className="relative mt-3 font-display text-[2.55rem] leading-none tracking-[-0.06em]">94<span className="text-xl">%</span></p>
                  <p className="relative mt-1 text-[10px] leading-relaxed text-white/65">follow-through this week</p>
                  <div className="relative mt-3 flex gap-1">{[1, 2, 3, 4, 5, 6, 7].map((day) => <span key={day} className={cn('h-5 flex-1 rounded-full', day === 6 ? 'bg-white/22' : 'bg-[#8AE99F]')} />)}</div>
                </motion.div>
              </div>

              <div className="space-y-3 border-t border-[#17301E]/7 pt-4 text-[13px] leading-relaxed sm:text-sm">
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ type: 'spring', stiffness: 115, damping: 20, delay: 0.48 }} className="max-w-[88%] rounded-2xl rounded-tl-sm bg-[#F0F5F1] px-3.5 py-3 text-[#425047]">
                  You&apos;ve kept your reading habit for six mornings in a row. That&apos;s a pattern worth protecting.
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ type: 'spring', stiffness: 115, damping: 20, delay: 0.7 }} className="ml-auto max-w-[81%] rounded-2xl rounded-tr-sm bg-[#173820] px-3.5 py-3 text-white">
                  Help me make today easier.
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ type: 'spring', stiffness: 115, damping: 20, delay: 0.92 }} className="max-w-[92%] rounded-2xl rounded-tl-sm bg-[#E4F7E9] px-3.5 py-3 text-[#31483A]">
                  Start with ten quiet minutes after breakfast. I&apos;ll save the bigger task for when your energy is higher.
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: 1.12 }} className="mt-4 flex items-center gap-3 rounded-2xl border border-[#17301E]/9 bg-white/65 px-3.5 py-3 text-xs text-[#91A097]">
                <MessageCircle size={15} />
                <span>Ask your coach anything</span>
                <ArrowUpRight size={15} className="ml-auto text-[#15291B]" />
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute -right-3 top-[20%] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#27A256] shadow-[0_14px_30px_rgba(37,107,59,0.13)] backdrop-blur sm:-right-7 sm:h-14 sm:w-14"
          >
            <Brain size={21} />
          </motion.div>
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-2xl border border-white/90 bg-white/85 px-3 py-2.5 text-[10px] font-semibold text-[#2A7140] shadow-[0_14px_30px_rgba(37,107,59,0.12)] backdrop-blur sm:-left-10 sm:px-4"
          >
            <CircleCheck size={14} className="text-[#25AF58]" /> One small win
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

function Gamification() {
  return (
    <section className="relative overflow-hidden bg-[#0C100D] px-5 py-24 text-white sm:px-8 sm:py-36">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:36px_36px] mask-radial" />
      <div className="relative mx-auto max-w-[1290px]">
        <Reveal className="max-w-xl"><Eyebrow light>Make it matter</Eyebrow><h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">The reward is who you become.</h2><p className="mt-7 max-w-lg text-base leading-relaxed text-white/62 sm:text-lg">Every promise kept earns momentum. Watch your tiny wins collect into a life you can actually feel proud of.</p></Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.article initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ type: 'spring', stiffness: 80, damping: 22 }} className="relative min-h-[390px] overflow-hidden rounded-[30px] border border-white/10 bg-[#131B15] p-6 sm:p-8">
            <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-white/50">Your Tree of Life</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Legendary growth</p></div><div className="rounded-full border border-[#8FE79E]/20 bg-[#8FE79E]/10 px-3 py-1.5 text-[10px] font-semibold text-[#9CEAA8]">Level 12</div></div>
            <div className="absolute inset-x-0 bottom-0 top-20 flex items-end justify-center overflow-hidden"><div className="absolute bottom-[17%] h-28 w-[75%] rounded-[50%] bg-[#1D6E37]/40 blur-3xl" /><motion.div animate={{ y: [0, -7, 0], rotate: [-1, 1, -1] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} className="relative h-[250px] w-[250px]"><div className="absolute bottom-0 left-1/2 h-[155px] w-7 -translate-x-1/2 rounded-t-[100%] bg-gradient-to-r from-[#4B3426] via-[#947056] to-[#4B3426]" /><div className="absolute bottom-[120px] left-1/2 h-[140px] w-[225px] -translate-x-1/2 rounded-[48%_52%_45%_55%] bg-[#3AAB59] shadow-[0_0_70px_rgba(115,231,130,0.42)]" /><div className="absolute bottom-[178px] left-1/2 h-[86px] w-[158px] -translate-x-1/2 rounded-[52%_48%_55%_45%] bg-[#76D46A]" />{Array.from({ length: 18 }).map((_, index) => <motion.i key={index} animate={{ y: [0, -12, 0], rotate: [0, index % 2 ? 20 : -20, 0], opacity: [0.35, 1, 0.35] }} transition={{ duration: 3 + (index % 3), repeat: Infinity, delay: index * 0.13 }} style={{ left: `${20 + ((index * 31) % 62)}%`, bottom: `${32 + ((index * 19) % 40)}%` }} className="absolute h-3 w-2 rounded-[100%_0_100%_0] bg-[#C8FFA4]" />)}</motion.div></div>
            <div className="absolute bottom-6 left-6 flex gap-2"><span className="rounded-full bg-white/8 px-3 py-2 text-[10px] text-white/65">32 day streak</span><span className="rounded-full bg-white/8 px-3 py-2 text-[10px] text-white/65">+ 2,850 XP</span></div>
          </motion.article>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <motion.article initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ type: 'spring', stiffness: 84, damping: 22 }} className="rounded-[30px] border border-white/10 bg-[#171D18] p-6"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9C95E] text-black"><Coins size={22} /></div><span className="text-[11px] text-white/45">Collected this week</span></div><p className="mt-8 text-4xl font-semibold tracking-[-0.05em]"><CountValue value={840} /></p><p className="mt-1 text-sm text-white/55">growth coins</p></motion.article>
            <motion.article initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ type: 'spring', stiffness: 84, damping: 22, delay: 0.07 }} className="rounded-[30px] border border-white/10 bg-[#171D18] p-6"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8AB4FF] text-[#102D64]"><BadgeCheck size={22} /></div><span className="text-[11px] text-white/45">New achievement</span></div><div className="mt-8 flex items-end justify-between"><div><p className="text-lg font-semibold tracking-tight">Daylight ritual</p><p className="mt-1 text-sm text-white/55">7 early starts</p></div><span className="text-2xl">+</span></div></motion.article>
          </div>
        </div>
      </div>
    </section>
  )
}

function StorySection() {
  const moments = [
    ['Every workout.', Flame, 'text-[#FFCE72]'],
    ['Every page.', BookOpen, 'text-[#BCE5FF]'],
    ['Every meditation.', Sparkles, 'text-[#D8C5FF]'],
    ['Every healthy meal.', Leaf, 'text-[#A7EEB4]'],
    ['Every early morning.', CloudSun, 'text-[#FFD79B]'],
    ['Every habit.', CircleCheck, 'text-[#91E5A1]'],
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#0B100C] px-5 py-28 text-white sm:px-8 sm:py-40 lg:py-48">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(174,243,183,.85)_1px,transparent_1px)] [background-size:24px_24px]" />
      <motion.div aria-hidden="true" animate={{ x: [0, 40, 0], y: [0, -22, 0], scale: [1, 1.12, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute left-[18%] top-[15%] h-72 w-72 rounded-full bg-[#2B9651]/25 blur-3xl" />
      <motion.div aria-hidden="true" animate={{ x: [0, -34, 0], y: [0, 32, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="pointer-events-none absolute bottom-[4%] right-[12%] h-80 w-80 rounded-full bg-[#A5E6A8]/12 blur-3xl" />
      <div className="relative mx-auto max-w-[1120px] text-center">
        <Reveal className="mx-auto max-w-3xl">
          <Eyebrow light>Your story is built daily</Eyebrow>
          <h2 className="mt-6 font-display text-[clamp(3.3rem,7vw,6.9rem)] leading-[0.88] tracking-[-0.065em]">
            This isn&apos;t just another<br className="hidden sm:block" /> habit tracker.
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-[870px] gap-3 sm:grid-cols-2 sm:gap-4">
          {moments.map(([label, Icon, color], index) => {
            const MomentIcon = Icon as LucideIcon
            return (
              <motion.div
                key={label as string}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 105, damping: 20, delay: 0.08 + index * 0.08 }}
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.09)' }}
                className="group flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-4 text-left backdrop-blur-sm sm:px-5"
              >
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] transition-transform duration-300 group-hover:scale-110', color as string)}><MomentIcon size={18} /></span>
                <p className="font-display text-[1.7rem] leading-none tracking-[-0.035em] text-white/95 sm:text-[2rem]">{label as string}</p>
              </motion.div>
            )
          })}
        </div>

        <Reveal delay={0.2} className="mx-auto mt-12 max-w-3xl border-t border-white/12 pt-11 sm:mt-16 sm:pt-14">
          <p className="font-display text-[clamp(2.8rem,6.2vw,5.8rem)] leading-[0.9] tracking-[-0.06em]">
            Becomes part of<br />
            <span className="italic text-[#B9F1C2]">your story.</span>
          </p>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-white/62 sm:text-[1.35rem]">
            One day you&apos;ll look back and realize your life changed because you never stopped showing up.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Testimonials() {
  const track = [...reviews, ...reviews]
  return (
    <section className="overflow-hidden px-5 py-24 sm:px-8 sm:py-36">
      <Reveal className="mx-auto max-w-2xl text-center"><Eyebrow>Growing alongside you</Eyebrow><h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl">A different relationship with time.</h2></Reveal>
      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-36" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-36" />
        <motion.div className="flex w-max gap-4" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 32, ease: 'linear', repeat: Infinity }}>
          {track.map((review, index) => <article key={`${review.name}-${index}`} className="w-[292px] shrink-0 rounded-[24px] border border-black/7 bg-white/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.045)] backdrop-blur-sm sm:w-[340px] sm:p-6"><div className="flex items-center justify-between"><div className="flex gap-0.5 text-[#F0B735]">{Array.from({ length: 5 }).map((_, star) => <Star key={star} size={12} fill="currentColor" />)}</div><span className="text-[10px] font-semibold text-zinc-400">{review.score}</span></div><p className="mt-6 font-display text-2xl leading-[1.02] tracking-[-0.02em]">“{review.quote}”</p><p className="mt-7 text-xs text-zinc-500">{review.name}</p></article>)}
        </motion.div>
      </div>
    </section>
  )
}



function About() {
  return (
    <section id="about" className="bg-[#122E18] px-5 py-24 text-white sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[900px] text-center">
        <Reveal>
          <Eyebrow light>Our Philosophy</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            We built GrindLog because we needed a quieter place to grow.
          </h2>
          <div className="mx-auto mt-10 space-y-6 text-base leading-relaxed text-white/75 sm:text-lg">
            <p>
              Most productivity tools feel like demanding bosses. They yell at you when you break a streak, overwhelming you with endless graphs and rigid schedules. We believe growth doesn't happen through guilt.
            </p>
            <p>
              GrindLog is designed to be a gentle companion. A private space to notice what works, celebrate small moments of consistency, and begin again without judgement when life gets in the way.
            </p>
            <p>
              It's not about becoming a machine. It's about becoming more of yourself.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[#EEF8F0] px-5 py-20 sm:px-8 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(142,226,159,.5),transparent_26%),radial-gradient(circle_at_90%_78%,rgba(188,233,198,.72),transparent_27%)]" />
      <div className="relative mx-auto max-w-[1080px] overflow-hidden rounded-[38px] bg-[#122419] px-6 py-14 text-center text-white shadow-[0_28px_70px_rgba(26,75,42,0.2)] sm:rounded-[48px] sm:px-12 sm:py-20">
        <motion.div aria-hidden="true" animate={{ x: [0, 35, 0], y: [0, -20, 0], scale: [1, 1.12, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-14 -top-20 h-64 w-64 rounded-full bg-[#58C973]/22 blur-3xl" />
        <motion.div aria-hidden="true" animate={{ x: [0, -30, 0], y: [0, 18, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#B7F0C1]/18 blur-3xl" />
        <Reveal className="relative mx-auto max-w-4xl">
          <Eyebrow light>Begin with yourself</Eyebrow>
          <h2 className="mt-6 font-display text-[clamp(3.2rem,7.2vw,6.9rem)] leading-[0.88] tracking-[-0.064em]">Invest in the person<br className="hidden sm:block" /> you&apos;re becoming.</h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/66 sm:text-xl">For less than a cup of coffee each month, you get the tools to build habits that can last a lifetime.</p>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.25 }} className="mt-10">
            <a href="https://grindlog.in/auth/signin"><Button variant="light" className="h-13 min-w-[185px] bg-[#DDF7E2] px-6 text-[#112017] hover:bg-white">Start My Journey <ArrowRight size={16} /></Button></a>
          </motion.div>
          <p className="mt-5 text-[11px] font-medium tracking-[0.08em] text-white/42 uppercase">A calmer system for showing up</p>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-[1290px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-display text-4xl tracking-tight">GrindLog</p><p className="mt-2 max-w-xs text-sm leading-relaxed text-white/52">The personal growth operating system powered by AI.</p></div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/60"><a className="transition-colors hover:text-white" href="https://www.instagram.com/grindlogapp/" target="_blank" rel="noopener noreferrer">Instagram</a><a className="transition-colors hover:text-white" href="#about">X / Twitter</a><a className="transition-colors hover:text-white" href="#about">Privacy</a><a className="transition-colors hover:text-white" href="#about">Terms</a><a className="transition-colors hover:text-white" href="mailto:hello@grindlog.app">Contact</a></div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1290px] items-center justify-between border-t border-white/10 pt-5 text-[10px] text-white/35"><span>© 2026 GrindLog</span><span>Made for becoming.</span></div>
    </footer>
  )
}

function App() {
  useSmoothScroll()

  return (
    <main className="page-shell">
      <Header />
      <Hero />
      <TreeScene />
      <PhoneShowcase />
      <Features />
      <FeatureComparisonTable />
      <AiCoach />
      <Analytics />
      <CalendarExperience />
      <PlannerExperience />
      <PersonalizationExperience />
      <Gamification />
      <StorySection />
      <Testimonials />
      <About />
      <FinalCta />
      <Footer />
      {/* Mobile Sticky Install App CTA */}
      <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
        <a
          href="https://grindlog.in/onboarding"
          className="flex items-center justify-between gap-3 rounded-2xl bg-[#0F1711]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#22C55E] text-white">
              <Download size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Install GrindLog</p>
              <p className="text-[10px] text-zinc-400">Habit Tracker on Mobile</p>
            </div>
          </div>
          <span className="rounded-xl bg-[#22C55E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm">
            Install
          </span>
        </a>
      </div>
    </main>
  )
}

export default App
