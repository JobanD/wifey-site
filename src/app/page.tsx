import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeartButton from "@/components/HeartButton"; // Adjust the path if necessary

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const handleLogout = async () => {
    "use server";
    const supabase = createServerComponentClient({ cookies });
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start space-y-8 bg-cover bg-center bg-opacity-50"
      style={{ backgroundImage: "url('/login.webp')" }}
    >
      <div className="mt-4 w-full bg-pink-100 bg-opacity-70 p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 gap-8 mt-8 lg:grid-cols-4">
          <HeartButton color="text-purple-500" href="/recipes">
            Recipes
          </HeartButton>
          <HeartButton color="text-orange-500" href="/games">
            Games
          </HeartButton>
          <HeartButton color="text-blue-500" href="/dates">
            Dates
          </HeartButton>
          <HeartButton color="text-red-500" href="/movies">
            Movies
          </HeartButton>
        </div>
      </div>
    </div>
  );
}
