import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";

const SimulationDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Container className="py-16">
        <h1 className="text-3xl font-bold text-foreground">Simulation Detail</h1>
        <p className="mt-2 text-muted-foreground text-sm">Slug: {slug}</p>
      </Container>
      <Footer />
    </div>
  );
};

export default SimulationDetailPage;
