import { Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const testimonials = [
  {
    quote:
      "Kollab helped me land my first internship. My portfolio showed real, verified contributions — not just side projects that never shipped.",
    name: "Chisom A.",
    role: "Computer Science Student",
    avatar: "CA",
    gradient: "from-violet-500 to-pink-500",
  },
  {
    quote:
      "Mentoring on Kollab is genuinely rewarding. The students come in prepared, with real project context. Sessions are focused and productive.",
    name: "Rena Park",
    role: "Senior Engineer · Meta",
    avatar: "RP",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    quote:
      "We hired two Kollab students this quarter. The verified portfolio made the screening process so much easier — we knew what we were getting.",
    name: "James Okoroji",
    role: "Engineering Manager · Paystack",
    avatar: "JO",
    gradient: "from-amber-500 to-orange-500",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <Container>
        <SectionTitle
          label="Social proof"
          title="Loved by students, "
          highlight="mentors & recruiters"
          className="mb-16"
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role, avatar, gradient }) => (
            <div
              key={name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 card-shadow hover:card-shadow-hover"
            >
              <Quote size={22} className="text-primary mb-4 opacity-60" />
              <p className="flex-1 text-sm text-foreground leading-relaxed mb-6">"{quote}"</p>

              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${gradient} text-white text-xs font-bold`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
