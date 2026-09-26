import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Spacer matching fixed header height (announcement bar + nav) */}
      <div className="h-[100px] md:h-[116px]" aria-hidden />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
