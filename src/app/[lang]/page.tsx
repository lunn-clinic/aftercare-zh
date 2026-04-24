import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import RedirectShim from "@/components/RedirectShim";
import { getAllCategories, getByTier, getTierMeta } from "@/data/aftercare";
import { LANGS, ui, formatCopy } from "@/data/i18n";
import type { Lang } from "@/data/types";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// 영어/중국어는 티어 구분 없이 premium 통합 페이지로 직진
const UNIFIED_LANGS: readonly Lang[] = ["en", "zh", "ja"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) return { title: "Aftercare Guide" };
  const copy = ui[lang as Lang];
  return {
    title: `${copy.aftercareGuide} | Lunn Dermatology`,
    description: copy.heroHomeIntro,
  };
}

export default async function TierSelectPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  const l = lang as Lang;
  // 영어/중국어/일본어는 tier 선택 화면을 건너뛰고 premium 통합 페이지로 리디렉트
  if (UNIFIED_LANGS.includes(l)) {
    return <RedirectShim to={`/${l}/premium`} />;
  }
  const copy = ui[l];
  // 한국어 /ko/ 는 11종 통합 뷰 (basic/premium 구분 없이 한 화면에)
  if (l === "ko") {
    const categories = getAllCategories(l);
    const totalCount = categories.reduce((n, c) => n + c.items.length, 0);
    return (
      <>
        <PageBanner
          title="시술 후 통합 관리 가이드"
          breadcrumb={[{ label: copy.tierUnified }]}
        />

        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-[860px] mx-auto px-6 text-center">
            <p className="text-[10px] tracking-[0.4em] font-bold mb-5 text-primary-navy">
              AFTERCARE · GUIDE
            </p>
            <div className="w-10 h-px mx-auto mb-8 bg-primary-navy" />
            <h2 className="text-primary-navy text-3xl lg:text-4xl font-extrabold leading-tight mb-6 whitespace-pre-line">
              {copy.tierUnifiedTagline}
            </h2>
            <p className="text-text-secondary text-[15px] leading-[1.9]">
              {formatCopy(copy.guideCount, totalCount)}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {categories.map((c) => (
                <a
                  key={c.key}
                  href={`#cat-${c.key}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-light text-primary-navy text-xs font-semibold hover:border-primary-navy transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-primary-navy" />
                  {c.name}
                  <span className="text-text-muted">{c.items.length}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 lg:pb-24 bg-bg-warm">
          <div className="max-w-[1140px] mx-auto px-6 py-16 lg:py-24 space-y-20 lg:space-y-28">
            {categories.map((cat, catIdx) => (
              <div key={cat.key} id={`cat-${cat.key}`} className="scroll-mt-24">
                <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.25em] text-white bg-primary-navy">
                        {String(catIdx + 1).padStart(2, "0")} · {copy.categoryLabel}
                      </span>
                      <span className="text-text-muted text-xs">
                        {formatCopy(copy.guideCount, cat.items.length)}
                      </span>
                    </div>
                    <h3 className="text-2xl lg:text-[2rem] font-extrabold leading-tight mb-2 text-primary-navy">
                      {cat.name}
                    </h3>
                  </div>
                  <div className="h-px flex-1 min-w-[100px] mb-4 bg-primary-navy/20" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 lg:p-8 rounded-3xl bg-primary-navy/[0.03]">
                  {cat.items.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/${l}/${g.tier}/${g.slug}`}
                      className="block h-full"
                    >
                      <div
                        className="relative h-full bg-white rounded-2xl border-l-[3px] border border-border-light p-6 lg:p-7 transition-all hover:shadow-[0_10px_40px_rgba(22,55,75,0.08)] hover:-translate-y-0.5"
                        style={{ borderLeftColor: "#16374B" }}
                      >
                        <p
                          className="text-[10px] tracking-[0.25em] font-bold mb-3"
                          style={{ color: "#16374B" }}
                        >
                          AFTERCARE
                        </p>
                        <h4 className="text-primary-navy text-xl font-extrabold mb-2.5 leading-tight">
                          {g.current.procedureName}
                        </h4>
                        <p className="text-text-secondary text-[13px] leading-relaxed mb-5">
                          {g.current.heroLine2}
                        </p>
                        <p className="text-xs font-semibold tracking-wide" style={{ color: "#16374B" }}>
                          {copy.cardGuideCta}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  const basicCount = getByTier(l, "basic").length;
  const premiumCount = getByTier(l, "premium").length;

  return (
    <>
      <PageBanner
        title={copy.aftercareGuide}
        subtitle={copy.forOurPatients}
        breadcrumb={[{ label: copy.aftercareGuide }]}
      />

      {/* 인트로 */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <p className="text-accent-gold text-[10px] tracking-[0.4em] uppercase mb-5 font-bold">
            {copy.homeLineTitle}
          </p>
          <div className="w-10 h-px bg-accent-gold mx-auto mb-8" />
          <h2
            className="text-primary-navy text-3xl md:text-4xl lg:text-5xl leading-[1.3] mb-8 whitespace-pre-line"
            style={{ fontFamily: '"Noto Serif KR", serif', fontWeight: 400 }}
          >
            {copy.heroHomeTitle}
          </h2>
          <p className="text-text-secondary text-[15px] lg:text-base leading-[1.95] max-w-xl mx-auto whitespace-pre-line">
            {copy.heroHomeIntro}
          </p>
        </div>
      </section>

      {/* 베이직/프리미엄 */}
      <section className="pb-24 lg:pb-32 bg-bg-warm">
        <div className="max-w-[1140px] mx-auto px-6 pt-20 lg:pt-28">
          <div className="grid md:grid-cols-2 gap-5 lg:gap-8">
            <TierCard lang={l} tier="basic" count={basicCount} />
            <TierCard lang={l} tier="premium" count={premiumCount} />
          </div>

          <p className="mt-12 text-center text-text-muted text-xs leading-[1.85] italic">
            {copy.patientInstruction}
          </p>
        </div>
      </section>
    </>
  );
}

function TierCard({
  lang,
  tier,
  count,
}: {
  lang: Lang;
  tier: "basic" | "premium";
  count: number;
}) {
  const meta = getTierMeta(lang, tier);
  const copy = ui[lang];
  const isPremium = tier === "premium";

  return (
    <Link
      href={`/${lang}/${tier}`}
      className={`group relative block rounded-3xl p-8 lg:p-12 overflow-hidden transition-all hover:-translate-y-0.5 ${
        isPremium
          ? "bg-primary-navy text-white hover:shadow-[0_20px_60px_rgba(22,55,75,0.25)]"
          : "bg-white text-text-primary hover:shadow-[0_20px_60px_rgba(22,55,75,0.08)] border border-border-light"
      }`}
    >
      {isPremium ? (
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent-beige/10 rounded-full blur-[100px] pointer-events-none" />
      ) : null}

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <span
            className={`text-[10px] tracking-[0.35em] font-bold ${
              isPremium ? "text-accent-beige" : "text-accent-gold"
            }`}
          >
            {isPremium ? "AFTERCARE · PREMIUM" : "AFTERCARE · BASIC"}
          </span>
          <span
            className={`text-[10px] ${
              isPremium ? "text-white/50" : "text-text-muted"
            }`}
          >
            {formatCopy(copy.guideCount, count)}
          </span>
        </div>

        <div
          className={`w-10 h-px mb-6 ${
            isPremium ? "bg-accent-beige" : "bg-accent-gold"
          }`}
        />

        <h3
          className={`text-2xl md:text-[2rem] leading-[1.25] mb-3 ${
            isPremium ? "text-white" : "text-primary-navy"
          }`}
          style={{ fontFamily: '"Noto Serif KR", serif', fontWeight: 400 }}
        >
          {meta.label}
        </h3>
        <p
          className={`text-[13px] font-semibold tracking-wide mb-6 ${
            isPremium ? "text-accent-beige" : "text-accent-gold"
          }`}
        >
          {meta.subtitle}
        </p>
        <p
          className={`text-sm lg:text-[15px] leading-[1.85] mb-8 ${
            isPremium ? "text-white/70" : "text-text-secondary"
          }`}
        >
          {meta.desc}
        </p>

        <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/10">
          <span
            className={`text-xs font-semibold tracking-[0.2em] uppercase ${
              isPremium ? "text-accent-beige" : "text-accent-gold"
            }`}
          >
            {copy.viewGuide}
          </span>
          <span
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all group-hover:translate-x-1 ${
              isPremium
                ? "bg-accent-beige text-primary-navy"
                : "bg-primary-navy text-white"
            }`}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
