import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">TeachSabai</h1>
      <div className="mt-4">
        <Link
          href="/students"
          className="text-blue-500 underline"
        >
          Go to Students
        </Link>
      </div>
    </main>
  );
}