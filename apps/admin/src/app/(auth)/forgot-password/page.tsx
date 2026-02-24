"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<"mobile" | "otp" | "password">("mobile");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleMobileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); setStep("otp"); }, 1500);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); setStep("password"); }, 1500);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Extinctbook</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {step === "mobile" && "Enter your registered mobile number"}
                        {step === "otp" && "Enter the OTP sent to your number"}
                        {step === "password" && "Create a strong new password"}
                    </p>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {["mobile", "otp", "password"].map((s, i) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all ${["mobile", "otp", "password"].indexOf(step) >= i
                                ? "w-16 bg-primary"
                                : "w-8 bg-border"
                                }`}
                        />
                    ))}
                </div>

                <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
                    {/* Step 1: Mobile */}
                    {step === "mobile" && (
                        <form onSubmit={handleMobileSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Mobile Number</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        required
                                        pattern="[6-9][0-9]{9}"
                                        maxLength={10}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                            >
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending OTP...</> : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === "otp" && (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">6-Digit OTP</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter OTP"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-center text-xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                            >
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</> : "Verify OTP"}
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === "password" && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                                        required
                                        minLength={8}
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                    />
                                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        required
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                    />
                                    <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Rules */}
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                                <li>✓ At least 8 characters</li>
                                <li>✓ One uppercase letter</li>
                                <li>✓ One number</li>
                                <li>✓ One special character</li>
                            </ul>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                            >
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save New Password"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
