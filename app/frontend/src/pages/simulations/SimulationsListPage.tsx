import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";

const SimulationsListPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Container className="py-16">
        <h1 className="text-3xl font-bold text-foreground">Job Simulations</h1>
        <p className="mt-2 text-muted-foreground">
          Browse role-based guided simulations and prove your skills.
        </p>
      </Container>
      <Footer />
    </div>
  );
};

export default SimulationsListPage;
