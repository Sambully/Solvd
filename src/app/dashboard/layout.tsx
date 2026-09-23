import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_80%_60%_at_10%_-10%,rgba(224,231,255,0.7),transparent),radial-gradient(ellipse_70%_50%_at_90%_-10%,rgba(254,243,199,0.5),transparent)]">
      <Sidebar />
      <div className="flex-1 w-full min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
