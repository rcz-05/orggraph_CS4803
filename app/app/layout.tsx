import { Navbar } from "@/components/shell/navbar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
      <footer className="border-t border-[#eee] py-6 text-center text-[11px] text-[#bbb]">
        OrgGraph · CS 4803 capstone · Group 6
      </footer>
    </div>
  );
}
