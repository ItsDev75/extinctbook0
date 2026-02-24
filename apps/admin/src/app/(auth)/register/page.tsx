"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Phone, Mail, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: connect to /api/auth/register
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">E</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Extinctbook</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Fill in your details to get started</p>
                </div>

                <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Your full name"
                                    required
                                    minLength={2}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1.5">
                            <label htmlFor="mobile" className="text-sm font-medium text-foreground">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">+91</span>
                                </div>
                                <input
                                    id="mobile"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    required
                                    pattern="[6-9][0-9]{9}"
                                    maxLength={10}
                                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending OTP...
                                </>
                            ) : (
                                "Send OTP & Continue"
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="w-full flex items-center justify-center py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition text-sm"
                    >
                        Sign In Instead
                    </Link>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Need help?{" "}
                    <a href="tel:+918295674272" className="text-primary hover:underline">
                        +91 82956 74272
                    </a>
                </p>
            </div>
        </div>
    );
}
