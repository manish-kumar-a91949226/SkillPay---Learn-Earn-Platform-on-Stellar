"use client";
import NavBar from "../../components/NavBar";

export const sortEarners = (earners) => [...earners].sort((a, b) => b.earnings - a.earnings);

export default function LeaderboardPage() {
  const topEarners = [
    { rank: 1, name: "Shaurya Patel", earnings: 200 },
    { rank: 2, name: "Sneha Rao", earnings: 150 },
    { rank: 3, name: "Vikram Singh", earnings: 150 },
    { rank: 4, name: "Aarohi Kulkarni", earnings: 150 },
    { rank: 5, name: "Karan Pillai", earnings: 120 },
    { rank: 6, name: "Swati Verma", earnings: 120 },
    { rank: 7, name: "Diya Desai", earnings: 120 },
    { rank: 8, name: "Anjali Iyer", earnings: 100 },
    { rank: 9, name: "Arjun Banerjee", earnings: 100 },
    { rank: 10, name: "Pooja Pillai", earnings: 80 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-medium mb-2">Top Earners Leaderboard</h1>
        <p className="text-bone-dim mb-8 text-sm">See who is leading the pack on the Stellar Testnet.</p>
        
        <div className="ledger">
          <div className="ledger-row grid-cols-[50px_1fr_100px] gap-6 items-center text-bone-dim text-xs font-mono tracking-tagwide uppercase border-b-2">
            <span>Rank</span>
            <span>Learner</span>
            <span className="text-right">Earnings</span>
          </div>
          {topEarners.map((user) => (
            <div key={user.rank} className="ledger-row grid-cols-[50px_1fr_100px] gap-6 items-center">
              <span className="text-signal-gold font-mono">#{user.rank}</span>
              <span className="text-bone">{user.name}</span>
              <span className="mono-amount text-signal-gold text-right">{user.earnings} XLM</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
