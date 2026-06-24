import Header from "../components/Header";
import Footer from "../components/Footer";
import { SearchProvider } from "../components/searchContext";
import { ComparisonProvider } from "../components/comparisonContext";
import ComparisonBar from "../components/ComparisonBar";
import ComparisonModal from "../components/ComparisonModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <ComparisonProvider>
        <Header />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
        <ComparisonBar />
        <ComparisonModal />
      </ComparisonProvider>
    </SearchProvider>
  );
}