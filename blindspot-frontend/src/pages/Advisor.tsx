import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getUserPersona } from "../utils/session";
import { useNavigate } from "react-router-dom";

const CONTACT_EMAIL = "advisors@blindspot.io";

function mailtoLink(subject: string, body?: string) {
  const s = encodeURIComponent(subject);
  const b = body ? `&body=${encodeURIComponent(body)}` : "";
  return `mailto:${CONTACT_EMAIL}?subject=${s}${b}`;
}

// ── Load last analysis from cache ─────────────────────────────────────────

function loadLastAnalysis(): { payload: any; result: any } | null {
  try {
    const raw = localStorage.getItem("blindspot_last_analysis");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Static advisor catalogue ───────────────────────────────────────────────

type AdvisorId = "education" | "finance" | "relocation";

interface Advisor {
  id: AdvisorId;
  track: string;
  title: string;
  description: string;
  stat?: { label: string; value: string };
  cta: string;
  email: string;
}

const ADVISORS: Advisor[] = [
  {
    id: "education",
    track: "Education Track",
    title: "University Career Services Router",
    description:
      "Direct access to institutional placement officers. Best for validating tuition ROI and long-term career trajectory mappings based on current alumni data.",
    cta: "Schedule Consultation",
    email: "education@blindspot.io",
  },
  {
    id: "finance",
    track: "Career Track",
    title: "Independent Financial Mentor",
    description:
      "Specialized in mid-career pivot economics, equity compensation modelling, and net-worth projections across tax jurisdictions.",
    stat: { label: "Client Success Rate", value: "98%" },
    cta: "Request Quote",
    email: "finance@blindspot.io",
  },
  {
    id: "relocation",
    track: "Relocation Track",
    title: "Global Mobility & Visa Specialist",
    description:
      "Quantified cost-of-living adjustments and logistical risk assessments for international transitions, including visa timelines and housing market forecasts.",
    cta: "Connect Now",
    email: "visa@blindspot.io",
  },
];

const PERSONA_CONFIG: Record<
  "student" | "professional" | "freelancer",
  { order: AdvisorId[]; headline: string; subtext: string }
> = {
  student: {
    order: ["education", "finance", "relocation"],
    headline: "Paths curated for Students",
    subtext:
      "We've prioritised education and early-career advisors based on your profile. Financial mentors can also help you model tuition ROI before you sign.",
  },
  professional: {
    order: ["finance", "relocation", "education"],
    headline: "Paths curated for Professionals",
    subtext:
      "Career pivot and relocation advisors are your highest-leverage contacts. Use the financial mentor to stress-test compensation packages across markets.",
  },
  freelancer: {
    order: ["finance", "relocation", "education"],
    headline: "Paths curated for Freelancers",
    subtext:
      "Financial structure and international mobility matter most for independent operators. An advisor can help you optimise tax residency and contract rates.",
  },
};

// ── Score colour helper ────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-caution";
  return "text-risk";
}

// ── Page ──────────────────────────────────────────────────────────────────

export function Advisor() {
  const navigate = useNavigate();
  const persona = getUserPersona();
  const config = PERSONA_CONFIG[persona];
  const cache = loadLastAnalysis();
  const result = cache?.result ?? null;
  const payload = cache?.payload ?? null;

  const sorted = [...ADVISORS].sort(
    (a, b) => config.order.indexOf(a.id) - config.order.indexOf(b.id)
  );
  const recommendedId = config.order[0];

  const isFlagged = result?.advisory_action?.flagged;
  const officeContacts: { name: string; url: string }[] =
    result?.advisory_action?.office_contact ?? [];

  return (
    <div className="px-4 pt-2 pb-10 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-outline-variant pb-5">
        <h1 className="text-2xl font-display font-bold text-on-surface tracking-tight">
          Your Human Support Network
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
          Connect with specialists to stress-test your projections. BlindSpot
          bridges empirical data with human intuition.
        </p>
      </div>

      {/* ── Last analysis summary ───────────────────────────────────────── */}
      {result ? (
        <div className={`rounded-xl border p-5 space-y-4 ${isFlagged ? "bg-risk-bg border-red-200" : "bg-surface-container-low border-outline-variant"}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Your Last Analysis
              </p>
              <p className="text-sm font-semibold text-on-surface line-clamp-1">
                {payload?.decision_text ?? "Decision"}
              </p>
            </div>
            <div className="text-center shrink-0">
              <div className={`text-4xl font-display font-extrabold leading-none ${scoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className={`text-xs font-bold ${scoreColor(result.score)}`}>{result.grade}</div>
              <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                Blindspot Score™
              </div>
            </div>
          </div>

          {/* Advisory flag banner */}
          {isFlagged && (
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <span className="text-risk font-extrabold text-base shrink-0">⚠</span>
                <p className="text-xs font-bold text-red-900 leading-normal">
                  {result.advisory_action?.message ??
                    "Your score is below 40. We recommend speaking with a human advisor before acting on this decision."}
                </p>
              </div>

              {/* Contacts from AXIS — routed through our team email */}
              {officeContacts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-red-200">
                  <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest">
                    Recommended Advisors for Your Situation
                  </p>
                  {officeContacts.map((c, i) => (
                    <a
                      key={i}
                      href={mailtoLink(
                        `BlindSpot Advisor Request — ${c.name}`,
                        `Hi BlindSpot team,\n\nI'd like to connect with: ${c.name}\n\nMy decision: ${payload?.decision_text ?? ""}\nMy Blindspot Score: ${result?.score} (${result?.grade})\n\nPlease get back to me.`
                      )}
                      className="flex items-center gap-2 text-xs text-red-700 font-semibold underline hover:text-red-900"
                    >
                      <span>✉</span> {c.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Not flagged — positive reinforcement */}
          {!isFlagged && (
            <p className="text-xs text-on-surface-variant">
              Your score is in a healthy range. The advisors below can help you
              further strengthen your plan before making a move.
            </p>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs font-semibold text-primary underline hover:text-primary/70"
          >
            View full analysis →
          </button>
        </div>
      ) : (
        /* No analysis yet */
        <div className="rounded-xl bg-surface-container-low border border-outline-variant px-5 py-6 text-center space-y-3">
          <p className="text-sm text-on-surface font-semibold">No analysis yet</p>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Run a decision through the engine first — your advisor matches and
            risk flags will appear here automatically.
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline hover:text-primary/70"
          >
            Go to Analyze →
          </button>
        </div>
      )}

      {/* ── Persona callout ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-surface-container-low border border-outline-variant px-5 py-4">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
          {config.headline}
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {config.subtext}
        </p>
      </div>

      {/* ── General advisor cards ────────────────────────────────────────── */}
      <div className="grid gap-4">
        {sorted.map((a, idx) => {
          const isRecommended = a.id === recommendedId;
          return (
            <Card key={a.id} variant={isRecommended ? "elevated" : "default"}>
              <Card.Body className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Card.Chip tone={isRecommended ? "primary" : "surface"}>
                      {a.track}
                    </Card.Chip>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/60 text-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                        ★ Recommended
                      </span>
                    )}
                    {!isRecommended && idx === 1 && (
                      <span className="text-xs text-outline font-medium">Also relevant</span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-on-surface text-base leading-snug mb-2">
                    {a.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {a.description}
                  </p>
                  {a.stat && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
                      <span className="text-xs text-on-surface-variant">{a.stat.label}</span>
                      <span className="text-xs font-bold text-primary ml-auto">{a.stat.value}</span>
                    </div>
                  )}
                </div>
                <div className="shrink-0 self-start sm:pt-1">
                  <a
                    href={`mailto:${a.email}?subject=${encodeURIComponent(`BlindSpot — ${a.title} Request`)}&body=${encodeURIComponent(`Hi BlindSpot team,\n\nI'd like to connect with a ${a.title}.\n\n${result ? `My decision: ${payload?.decision_text ?? ""}\nMy Blindspot Score: ${result.score} (${result.grade})\n` : ""}Please get back to me.`)}`}
                  >
                    <Button variant={isRecommended ? "primary" : "secondary"} size="sm">
                      {a.cta}
                    </Button>
                  </a>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
