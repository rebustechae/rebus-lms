'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyOTP } from '@/app/(auth)/actions'
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

    return (
        <Card className='w-full max-w-md shadow-lg border-slate-200 rounded-[2rem]'>
            <CardHeader className='text-center pt-10'>
                <CardTitle className='text-3xl font-bold tracking-tight text-slate-900'>Verify Account</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                    Enter the 6-digit OTP sent to <br />
                    <span className='font-bold text-[#00ADEF]'>{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-8 pb-10'>
                <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={((val) => setCode(val))}
                    disabled={isLoading}
                >
                    <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="rounded-xl border-2 size-12 text-lg font-bold" />
                        <InputOTPSlot index={1} className="rounded-xl border-2 size-12 text-lg font-bold" />
                        <InputOTPSlot index={2} className="rounded-xl border-2 size-12 text-lg font-bold" />
                        <InputOTPSlot index={3} className="rounded-xl border-2 size-12 text-lg font-bold" />
                        <InputOTPSlot index={4} className="rounded-xl border-2 size-12 text-lg font-bold" />
                        <InputOTPSlot index={5} className="rounded-xl border-2 size-12 text-lg font-bold" />
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
                        className='w-full bg-slate-900 hover:bg-slate-800 text-white py-7 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-slate-200'
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
                        onClick={() => window.location.href = '/login'}
                        className='w-full text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors'
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