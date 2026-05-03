import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">TeachSabai</h1>

      <p className="mt-2 text-gray-600">
        Manage your students, classes, and payments easily.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/students"
          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-center"
        >
          Go to Students
        </Link>

        <Link
          href="/login"
          className="border px-4 py-2 rounded-xl text-center"
        >
          Login
        </Link>
      </div>
    </main>
  );
}