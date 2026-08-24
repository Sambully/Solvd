import Sidebar from "@/components/Sidebar";

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-white dark:bg-black">
        {children}
      </div>
    </div>
  );
}
