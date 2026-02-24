"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // OTP Countdown Timer
    useEffect(() => {
        if (countdown === 0) { setCanResend(true); return; }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (paste.length === 6) setOtp(paste.split(""));
    };

    const handleResend = () => {
        setCountdown(60);
        setCanResend(false);
        // TODO: call /api/auth/resend-otp
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) return;
        setIsLoading(true);
        // TODO: call /api/auth/verify-otp
        setTimeout(() => setIsLoading(false), 1500);
    };

    const isComplete = otp.every((d) => d !== "");

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">E</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Extinctbook</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Enter the 6-digit OTP sent to your mobile number
                    </p>
                </div>

                <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Inputs */}
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:border-primary transition-all"
                                />
                            ))}
                        </div>

                        {/* Resend */}
                        <div className="text-center text-sm">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                <span className="text-muted-foreground">
                                    Resend OTP in{" "}
                                    <span className="text-foreground font-semibold tabular-nums">{countdown}s</span>
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!isComplete || isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Validate OTP"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
