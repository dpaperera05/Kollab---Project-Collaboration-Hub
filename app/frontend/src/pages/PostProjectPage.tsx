import Navbar from "@/components/layout/Navbar";
import PostProjectWizard from "@/components/projects/post/PostProjectWizard";
import { useParams } from "react-router-dom";

const PostProjectPage = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <PostProjectWizard projectId={id} />
      </main>
    </div>
  );
};

export default PostProjectPage;
