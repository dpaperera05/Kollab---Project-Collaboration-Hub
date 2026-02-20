import Navbar from "@/components/layout/Navbar";
import PostProjectWizard from "@/components/projects/post/PostProjectWizard";

const PostProjectPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <PostProjectWizard />
      </main>
    </div>
  );
};

export default PostProjectPage;
