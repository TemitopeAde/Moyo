import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="container mx-auto max-w-3xl px-6 pb-24 pt-36 md:px-12 md:pt-52">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Terms</p>
        <h1 className="mt-5 font-heading text-4xl italic md:text-5xl">Terms</h1>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/55">
          <p>
            All artwork, photography, text, and visual material on this website belongs to Ijabiken Moyo unless otherwise stated.
          </p>
          <p>
            Private gallery access, downloads, commissions, and bookings are provided for the intended client or recipient only.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
