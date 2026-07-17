import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

type PublicReview = {
  id: string;
  customer_name: string;
  city: string | null;
  product_name: string | null;
  rating: number;
  comment: string;
  verified: boolean;
  highlight: boolean;
};

/**
 * Avaliações reais aprovadas no painel. A RLS só entrega ao site as
 * publicadas E autorizadas; sem nenhuma, a seção não aparece.
 */
export default async function SocialProof() {
  let reviews: PublicReview[] = [];
  try {
    const url = supabaseUrl();
    const key = supabaseAnonKey();
    if (!url || !key) return null;
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, city, product_name, rating, comment, verified, highlight")
      .order("highlight", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) return null;
    reviews = (data ?? []) as PublicReview[];
  } catch {
    return null;
  }
  if (reviews.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Reveal>
          <SectionHeading eyebrow="Avaliações" title="Quem veste, recomenda" />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl bg-cloud/40 p-5 ring-1 ring-ink/5">
              <span className="flex gap-0.5" aria-label={`${r.rating} de 5 estrelas`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= r.rating ? "fill-amarelo text-amarelo" : "text-ink/15"}`}
                    aria-hidden="true"
                  />
                ))}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-ink">“{r.comment}”</p>
              <p className="mt-3 text-xs font-semibold text-steel">
                {r.customer_name}
                {r.city ? ` · ${r.city}` : ""}
                {r.product_name ? ` · ${r.product_name}` : ""}
                {r.verified ? " · compra verificada" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
