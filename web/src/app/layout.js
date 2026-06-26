import "../styles/globals.css";
import { AuthProvider } from "../lib/auth";
import AnalyticsInit from "../components/AnalyticsInit";
import NavBar from "../components/NavBar";

export const metadata = {
  title: "SkillPay — Learn. Prove it. Get paid.",
  description: "A ledger of skill, proof, and payment — built on Stellar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink text-bone">
        <AuthProvider>
          <AnalyticsInit />
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
