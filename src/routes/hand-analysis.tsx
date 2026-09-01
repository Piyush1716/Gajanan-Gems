import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { fetchProducts, type Product } from "@/lib/products";
import {
  Upload,
  Sparkles,
  ChevronRight,
  Hand,
  Zap,
  Star,
  ShoppingBag,
  RotateCcw,
  Camera,
  X,
  Gem,
} from "lucide-react";

export const Route = createFileRoute("/hand-analysis")({
  head: () => ({
    meta: [
      { title: "Palm & Aura Analysis — Cambay Crystal" },
      {
        name: "description",
        content:
          "Upload a photo of your palm and receive a personalised energy reading, chakra insight and gemstone recommendations.",
      },
    ],
  }),
  loader: async () => {
    const products = await fetchProducts();
    return { products };
  },
  component: HandAnalysisPage,
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  personality: { title: string; description: string };
  energy: { dominant: string; level: string; description: string };
  chakras: { name: string; status: "balanced" | "active" | "needs-work"; color: string }[];
  gemstones: { name: string; reason: string; emoji: string }[];
  affirmation: string;
  productSlugs: string[];
}

// ── Mock AI ───────────────────────────────────────────────────────────────────

const MOCK_RESULTS: AnalysisResult[] = [
  {
    personality: {
      title: "The Intuitive Healer",
      description:
        "Your palm reveals a deeply empathic soul who leads with feeling. You absorb the emotions of those around you like moonlight on water — a gift that makes you a natural caretaker, counsellor and creative. Your heart line's gentle arc speaks of loyalty and fierce emotional depth.",
    },
    energy: {
      dominant: "Water & Earth",
      level: "High",
      description:
        "A rich, nourishing aura pulses from your hand — calm on the surface yet powerful beneath. You carry the steady energy of ancient rivers, capable of great transformation. Grounding stones will amplify your natural flow.",
    },
    chakras: [
      { name: "Heart", status: "active", color: "#4ade80" },
      { name: "Third Eye", status: "balanced", color: "#818cf8" },
      { name: "Root", status: "needs-work", color: "#f87171" },
      { name: "Sacral", status: "balanced", color: "#fb923c" },
      { name: "Solar Plexus", status: "active", color: "#facc15" },
    ],
    gemstones: [
      { name: "Rose Quartz", reason: "Amplifies your natural compassion and opens the heart chakra", emoji: "🌸" },
      { name: "Amethyst", reason: "Sharpens intuition and protects your sensitive aura", emoji: "💜" },
      { name: "Black Tourmaline", reason: "Anchors your energy to the earth for grounding", emoji: "🖤" },
      { name: "Moonstone", reason: "Channels lunar feminine energy that resonates with your water sign", emoji: "🌙" },
    ],
    affirmation: "I am a vessel of love and wisdom. My sensitivity is my superpower.",
    productSlugs: [],
  },
  {
    personality: {
      title: "The Visionary Leader",
      description:
        "Your hand carries the fire of purpose. Bold lines and a strong life-line reveal someone born to build, inspire and lead. You think in systems and dream in possibilities. Others sense your conviction before you speak a single word.",
    },
    energy: {
      dominant: "Fire & Air",
      level: "Radiant",
      description:
        "Solar energy blazes from your aura — magnetic, warm, and impossible to ignore. You are a natural catalyst who sparks change wherever you go. Crystals that channel sun energy will magnify this force.",
    },
    chakras: [
      { name: "Solar Plexus", status: "active", color: "#facc15" },
      { name: "Throat", status: "active", color: "#38bdf8" },
      { name: "Crown", status: "balanced", color: "#c084fc" },
      { name: "Heart", status: "needs-work", color: "#4ade80" },
      { name: "Root", status: "balanced", color: "#f87171" },
    ],
    gemstones: [
      { name: "Citrine", reason: "Supercharges your solar plexus and manifesting power", emoji: "☀️" },
      { name: "Tiger's Eye", reason: "Grounds ambition into focused, courageous action", emoji: "🐯" },
      { name: "Lapis Lazuli", reason: "Opens throat chakra for powerful, authentic expression", emoji: "💙" },
      { name: "Green Aventurine", reason: "Softens the heart to attract abundance in all forms", emoji: "💚" },
    ],
    affirmation: "My vision creates reality. I lead with clarity and love.",
    productSlugs: [],
  },
  {
    personality: {
      title: "The Quiet Mystic",
      description:
        "Depth beyond measure lives in your palm. A rare combination of fine lines and a prominent Mercury mount speaks of a mind that perceives hidden truths. You are most alive in silence, in nature, in the space between thoughts.",
    },
    energy: {
      dominant: "Earth & Ether",
      level: "Crystalline",
      description:
        "A still, luminous aura surrounds you — the kind that ancient mystics cultivated over lifetimes. You have a natural attunement to subtle frequencies. High-vibration crystals will help you translate your inner knowing into the world.",
    },
    chakras: [
      { name: "Crown", status: "active", color: "#c084fc" },
      { name: "Third Eye", status: "active", color: "#818cf8" },
      { name: "Root", status: "balanced", color: "#f87171" },
      { name: "Throat", status: "needs-work", color: "#38bdf8" },
      { name: "Sacral", status: "balanced", color: "#fb923c" },
    ],
    gemstones: [
      { name: "Clear Quartz", reason: "Acts as a cosmic antenna amplifying your innate intuition", emoji: "🔮" },
      { name: "Labradorite", reason: "Protects your aura while revealing deeper spiritual truths", emoji: "✨" },
      { name: "Blue Lace Agate", reason: "Gently opens the throat so your wisdom can be heard", emoji: "🌊" },
      { name: "Selenite", reason: "Purifies your energy field and connects you to higher realms", emoji: "🌟" },
    ],
    affirmation: "I trust the whispers of my inner world. My perception is a gift.",
    productSlugs: [],
  },
];

const CHAKRA_LABELS: Record<string, string> = {
  active: "Active & Open",
  balanced: "Harmonious",
  "needs-work": "Needs Attention",
};

// ── Drag & Drop Upload ────────────────────────────────────────────────────────

function UploadZone({
  onFile,
}: {
  onFile: (file: File, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return false;
    }
    return true;
  };

  const handle = (file: File) => {
    setError(null);
    if (!validate(file)) return;
    const reader = new FileReader();
    reader.onload = (e) => onFile(file, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handle(file);
    },
    []
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-10 sm:p-16 text-center
          ${dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-secondary/40"
          }
        `}
        style={{
          background: dragging
            ? undefined
            : "radial-gradient(ellipse at 50% 0%, hsl(var(--primary)/0.04) 0%, transparent 70%)",
        }}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <Hand className="h-9 w-9 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xl font-semibold">Upload Your Palm</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag & drop or tap to browse · JPG / PNG / WEBP · Max 10 MB
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
              <Camera className="h-3 w-3" /> Camera supported on mobile
            </span>
            <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
              <Upload className="h-3 w-3" /> Drag & Drop
            </span>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
          }}
        />
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}

// ── Loading Animation ─────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Reading your palm lines…",
  "Sensing your aura field…",
  "Mapping your chakras…",
  "Consulting the crystal archives…",
  "Weaving your personalised reading…",
];

function LoadingState() {
  const [step, setStep] = useState(0);

  useState(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 900);
    return () => clearInterval(id);
  });

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      {/* Pulsing orb */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/10" style={{ animationDuration: "1.5s" }} />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
          <Sparkles className="h-9 w-9 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold">Analysing Your Energy</p>
        <p className="text-sm text-muted-foreground transition-all duration-500 min-h-[1.5rem]">
          {LOADING_STEPS[step]}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Chakra Badge ──────────────────────────────────────────────────────────────

function ChakraBadge({
  chakra,
}: {
  chakra: AnalysisResult["chakras"][number];
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div
        className="h-3 w-3 flex-shrink-0 rounded-full ring-4"
        style={{ backgroundColor: chakra.color, ringColor: `${chakra.color}33` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{chakra.name} Chakra</p>
        <p
          className={`text-xs ${
            chakra.status === "active"
              ? "text-emerald-500"
              : chakra.status === "balanced"
              ? "text-primary"
              : "text-amber-500"
          }`}
        >
          {CHAKRA_LABELS[chakra.status]}
        </p>
      </div>
      <div
        className={`h-2 w-2 rounded-full flex-shrink-0 ${
          chakra.status === "active"
            ? "bg-emerald-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.4)]"
            : chakra.status === "balanced"
            ? "bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.4)]"
            : "bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.4)]"
        }`}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function HandAnalysisPage() {
  const { products } = Route.useLoaderData() as { products: Product[] };
  const { add } = useCart();

  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "loading" | "done">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());

  const handleFile = (file: File, dataUrl: string) => {
    setPreview(dataUrl);
    setStatus("ready");
    setResult(null);
  };

  const handleAnalyse = async () => {
    if (!preview) return;
    setStatus("loading");

    // Simulate AI delay
    await new Promise((r) => setTimeout(r, 4800));

    // Pick a random mock result and attach real products
    const base = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
    const slugs = products.slice(0, 4).map((p) => p.slug);
    setResult({ ...base, productSlugs: slugs });
    setStatus("done");
  };

  const handleReset = () => {
    setPreview(null);
    setStatus("idle");
    setResult(null);
    setAddedSlugs(new Set());
  };

  const handleAddToCart = (slug: string) => {
    add(slug, 1);
    setAddedSlugs((s) => new Set([...s, slug]));
  };

  const recommendedProducts = result
    ? products.filter((p) => result.productSlugs.includes(p.slug))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* ── Breadcrumb ── */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-5">
          <nav className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Palm & Aura Analysis</span>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/4 blur-2xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 pt-12 pb-14 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-medium mb-6 ring-1 ring-primary/20">
              <Sparkles className="h-3 w-3" /> Powered by Crystal AI
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Discover Your{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)",
                }}
              >
                Crystal Energy
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Upload a photograph of your open palm. Our AI reads your energy signature, maps your chakras, and curates the perfect healing crystals — just for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {["Palm Line Reading", "Chakra Mapping", "Aura Analysis", "Crystal Pairing"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
                  <Star className="h-3 w-3 text-primary" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="max-w-4xl mx-auto px-4 lg:px-6 pb-20 space-y-8">

          {/* Upload / Preview Card */}
          {status !== "done" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              {status === "loading" ? (
                <LoadingState />
              ) : preview ? (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Preview */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={preview}
                      alt="Your palm"
                      className="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl object-cover ring-2 ring-border"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="font-semibold text-lg">Palm Image Ready ✨</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your image has been uploaded. Click below to begin the energy analysis.
                      </p>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground text-sm">Tips for best results</p>
                      <p>• Open palm facing the camera</p>
                      <p>• Natural light, avoid harsh shadows</p>
                      <p>• Include the full hand from wrist to fingertips</p>
                    </div>
                    <button
                      onClick={handleAnalyse}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 text-sm font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                    >
                      <Zap className="h-4 w-4" />
                      Analyse My Energy
                    </button>
                  </div>
                </div>
              ) : (
                <UploadZone onFile={handleFile} />
              )}
            </div>
          )}

          {/* ── Results ── */}
          {status === "done" && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Header strip */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden">
                <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                  {/* Orb bg */}
                  <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />

                  {preview && (
                    <img
                      src={preview}
                      alt="Your palm"
                      className="h-24 w-24 rounded-2xl object-cover ring-2 ring-border flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-primary font-medium uppercase tracking-widest mb-1">Your Energy Profile</p>
                    <h2
                      className="text-2xl sm:text-3xl font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {result.personality.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {result.personality.description}
                    </p>
                  </div>
                </div>

                {/* Affirmation strip */}
                <div className="border-t border-border bg-primary/5 px-6 sm:px-8 py-4 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-sm italic text-foreground/80">"{result.affirmation}"</p>
                </div>
              </div>

              {/* Two-col: Energy + Chakras */}
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Aura Energy */}
                <div className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Aura Energy</h3>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
                      {result.energy.dominant}
                    </span>
                    <span className="rounded-full bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1">
                      {result.energy.level} Vibration
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.energy.description}
                  </p>
                </div>

                {/* Chakra Map */}
                <div className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Gem className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Chakra Reading</h3>
                  </div>
                  <div className="space-y-2">
                    {result.chakras.map((c) => (
                      <ChakraBadge key={c.name} chakra={c} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Gemstone Recommendations */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Your Power Gemstones</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.gemstones.map((g) => (
                    <div
                      key={g.name}
                      className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4"
                    >
                      <span className="text-2xl flex-shrink-0">{g.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Recommendations */}
              {recommendedProducts.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <div className="mb-6">
                    <h3
                      className="text-xl sm:text-2xl font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Curated For Your Energy
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bracelets and crystals aligned with your reading
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {recommendedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="group rounded-2xl border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
                          <div className="aspect-square overflow-hidden bg-secondary">
                            <img
                              src={p.img}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="text-xs font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h4>
                            <p className="mt-1 text-sm font-semibold">₹{p.price.toLocaleString()}</p>
                          </div>
                        </Link>
                        <div className="px-3 pb-3">
                          <button
                            onClick={() => handleAddToCart(p.slug)}
                            className={`w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-medium rounded-full py-2 transition-all ${
                              addedSlugs.has(p.slug)
                                ? "bg-primary text-primary-foreground"
                                : "border border-primary text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            <ShoppingBag className="h-3 w-3" />
                            {addedSlugs.has(p.slug) ? "Added ✓" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA row */}
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 border border-border rounded-full px-6 py-2.5 text-sm hover:bg-secondary transition"
                >
                  <RotateCcw className="h-4 w-4" /> New Reading
                </button>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition"
                >
                  <ShoppingBag className="h-4 w-4" /> View Cart
                </Link>
              </div>
            </div>
          )}

          {/* How it works (shown on idle) */}
          {status === "idle" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold mb-6 text-center">How It Works</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    icon: Upload,
                    title: "Upload Your Palm",
                    desc: "Take a clear photo of your open hand in natural light and upload it above.",
                  },
                  {
                    step: "02",
                    icon: Sparkles,
                    title: "AI Energy Reading",
                    desc: "Our crystal AI analyses your palm lines, energy field and chakra alignment.",
                  },
                  {
                    step: "03",
                    icon: Gem,
                    title: "Receive Your Crystals",
                    desc: "Get a personalised gemstone and bracelet recommendation curated for you.",
                  },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-4 ring-primary/5">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-medium text-primary/70 tracking-widest">{step}</p>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
