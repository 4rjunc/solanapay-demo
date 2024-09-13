"use client";
import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 p-6 bg-gradient-to-b from-yellow-50 to-yellow-100">
      <h1 className="text-2xl font-semibold text-black">Banana Payment</h1>
      <p className="text-black">
        Thank you for your payment. Your transaction is being processed.
      </p>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        onClick={() => router.push("/")}
      >
        Go back
      </button>
    </div>
  );
}
