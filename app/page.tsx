"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createQR } from "@solana/pay";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const exchangeRate = 0.00012;
  const [count, setCount] = useState(0);
  const [qrCode, setQrCode] = useState<string>();
  const [reference, setReference] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => Math.max(0, prev - 1));
  const [totalAmount, setTotalAmount] = useState("0.000000");
  const [retryCount, setRetryCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const solAmount = (count * 10 * exchangeRate).toFixed(6);
    setTotalAmount(solAmount);
  }, [count]);

  const handleGenerateClick = async () => {
    const inrAmount = count * 10;
    try {
      const res = await axios.post(
        "/api/pay",
        { inrAmount },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(res.data);
      const { url, ref } = res.data;
      const qr = createQR(url);
      const qrBlob = await qr.getRawData("png");
      if (!qrBlob) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setQrCode(event.target.result);
        }
      };
      reader.readAsDataURL(qrBlob);
      setReference(ref);
      console.log(reference);
      handleVerify(ref);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleVerify = useCallback(
    async (ref: string) => {
      if (!ref) {
        alert("Please generate a payment request first");
        return;
      }

      setIsVerifying(true);
      let wentThrough = false;
      let localRetryCount = retryCount;
      const maxRetries = 25;

      while (!wentThrough && localRetryCount < maxRetries) {
        console.log("Verifying payment...");
        try {
          const res = await axios.get(`/api/pay?reference=${ref}`);
          const { status } = res.data;
          console.log(`status: ${status}`);
          if (status === "verified") {
            router.push("/success");
            wentThrough = true;
          }

          await delay(Math.min(1000 * Math.pow(2, localRetryCount), 1000 * 15));
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
        localRetryCount++;
        setRetryCount(localRetryCount);
      }

      if (!wentThrough) {
        alert("Failed to verify payment after multiple attempts.");
      }

      setIsVerifying(false);
    },
    [router, retryCount],
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-6 p-6 bg-gradient-to-b from-yellow-50 to-yellow-100">
      <h1 className="font-bold text-3xl text-yellow-600">
        Pay SOL, Get Banana!
      </h1>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <Image
            src="https://t3.ftcdn.net/jpg/09/60/61/80/240_F_960618068_W27RcIlTMT6aBSgfiVa8fanBr5GJWHqV.jpg"
            alt="banana"
            width={200}
            height={200}
            className="rounded-lg shadow-md"
          />
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-between w-full">
            <Button
              onClick={decrement}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </Button>
            <span className="text-4xl font-bold">{count}</span>
            <Button
              onClick={increment}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add
            </Button>
          </div>

          <div className="w-full space-y-2">
            <p className="text-xl flex justify-between">
              <span>INR:</span>{" "}
              <span className="font-semibold">{10 * count}</span>
            </p>
            <p className="text-xl flex justify-between">
              <span>SOL:</span>{" "}
              <span className="font-semibold">{totalAmount}</span>
            </p>
          </div>

          {!reference && (
            <Button
              variant="default"
              className="w-full text-xl bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={handleGenerateClick}
            >
              Checkout 💳
            </Button>
          )}
        </CardContent>
      </Card>

      {qrCode && (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Scan QR Code to Pay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Image
              src={qrCode}
              className="rounded-lg shadow-md"
              alt="QR Code"
              width={300}
              height={300}
              priority
            />
          </CardContent>
        </Card>
      )}

      {retryCount >= 3 && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={() => handleVerify(reference!)}
        >
          Verify Payment
        </button>
      )}
    </main>
  );
}
