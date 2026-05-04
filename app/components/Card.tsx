export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition cursor-pointer">
      {children}
    </div>
  );
}