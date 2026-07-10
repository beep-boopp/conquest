import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">ConquestBet</h1>
      <p className="text-gray-500">
        Create a private room with your friends, wager land on World Cup match predictions, and conquer their
        territory when TxLINE confirms the result on-chain.
      </p>
      <LoginButton />
      {/* TODO: redirect to /dashboard on successful login */}
    </main>
  );
}
