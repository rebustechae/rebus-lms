'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyOTP, resendOTP } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { isRedirectError } from "next/dist/client/components/redirect-error"; // Added for redirect handling
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function VerifyForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(60) // 60 second countdown
    const [canResend, setCanResend] = useState(false)
    const [isResending, setIsResending] = useState(false)

    // Handle countdown timer
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true)
            return
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])

    async function handleVerify() {
        setIsLoading(true)
        setError(null)

        try {
            const result = await verifyOTP(email, code)
            
            if (result?.error) {
                setError(result.error)
                setIsLoading(false) // Only stop loading if there is a functional error
            }
            // Note: If successful, the redirect happens here and is caught by the 'catch'
        } catch (e) {
            // Check if the "error" is actually a Next.js redirect
            if (isRedirectError(e)) {
                // Re-throw it so Next.js can handle the navigation
                throw e 
            }

            setError('Invalid or expired code. Please try again.')
            setIsLoading(false)
        }
    }

    async function handleResendOTP() {
        setIsResending(true)
        setError(null)

        try {
            const result = await resendOTP(email)
            
            if (result?.error) {
                setError(result.error)
                setIsResending(false)
            } else {
                // Reset countdown
                setCountdown(60)
                setCanResend(false)
                setCode('')
                setIsResending(false)
            }
        } catch (e) {
            setError('Failed to resend OTP. Please try again.')
            setIsResending(false)
        }
    }

    return (
        <Card className='w-full max-w-md shadow-lg border-slate-200 rounded-[2rem]'>
            <CardHeader className='text-center pt-10'>
                <CardTitle className='text-3xl font-bold tracking-tight text-slate-900'>Verify Account</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                    Enter the 6-digit OTP sent to <br />
                    <span className='font-semibold text-rebus-purple'>{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-8 pb-10'>
                <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={((val) => setCode(val))}
                    disabled={isLoading}
                >
                    <InputOTPGroup className="">
                        <InputOTPSlot index={0} className="border-1 size-12 text-lg font-bold" />
                        <InputOTPSlot index={1} className="border-1 size-12 text-lg font-bold" />
                        <InputOTPSlot index={2} className="border-1 size-12 text-lg font-bold" />
                        <InputOTPSlot index={3} className="border-1 size-12 text-lg font-bold" />
                        <InputOTPSlot index={4} className="border-1 size-12 text-lg font-bold" />
                        <InputOTPSlot index={5} className="border-1 size-12 text-lg font-bold" />
                    </InputOTPGroup>
                </InputOTP>

                {error && (
                    <div className='bg-rose-50 border border-rose-100 p-3 rounded-xl w-full'>
                        <p className='text-[10px] text-rose-600 font-black uppercase text-center tracking-widest'>
                            {error}
                        </p>
                    </div>
                )}

                <div className="w-full space-y-4">
                    <Button
                        onClick={handleVerify}
                        className='w-full bg-rebus-blue hover:bg-rebus-blue/80 text-white py-7 rounded-xl font-semibold uppercase text-xs transition-all shadow-xl shadow-slate-200'
                        disabled={code.length !== 6 || isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className='size-4 animate-spin' />
                                <span>Authenticating...</span>
                            </div>
                        ) : (
                            "Submit OTP"
                        )}
                    </Button>

                    <button
                        onClick={handleResendOTP}
                        disabled={!canResend || isResending}
                        className={`w-full text-[10px] font-semibold uppercase tracking-widest py-3 px-4 rounded-lg transition-all ${
                            canResend
                                ? 'bg-slate-100 hover:bg-slate-200 text-rebus-blue'
                                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isResending ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className='size-3 animate-spin' />
                                <span>Resending...</span>
                            </div>
                        ) : canResend ? (
                            'Resend OTP'
                        ) : (
                            `Resend OTP in ${countdown}s`
                        )}
                    </button>

                    <button
                        onClick={() => window.location.href = '/login'}
                        className='w-full text-[10px] font-medium text-slate-400 hover:text-slate-900 hover:text-underline transition-colors'
                    >
                        Back to login
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function VerifyPage() {
    return (
        <div className='min-h-screen items-center justify-center p-4 bg-[#F8FAFC] flex relative overflow-hidden'>
            {/* Subtle UI Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#00ADEF]/5 rounded-full blur-[100px]" />
            
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Identity...</p>
                </div>
            }>
                <VerifyForm />
            </Suspense>
        </div>
    )
}