'use client'

import { useState, Suspense } from 'react' // 1. Added Suspense
import { useSearchParams } from 'next/navigation'
import { verifyOTP } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Move your logic into a separate component
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
            }
        } catch (e) {
            setError('Invalid or expired code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className='w-full max-w-md shadow-lg'>
            <CardHeader className='text-center'>
                <CardTitle className='text-2xl font-bold'>Verify Your E-mail</CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to <br />
                    <span className='font-semibold text-foreground'>{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-6'>
                <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={((val) => setCode(val))}
                    disabled={isLoading}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>

                {error && (
                    <p className='text-sm text-destructive font-bold bg-destructive/10 p-2 rounded w-full text-center uppercase tracking-tighter'>
                        {error}
                    </p>
                )}

                <Button
                    onClick={handleVerify}
                    className='w-full bg-slate-900 hover:bg-slate-800 py-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all'
                    disabled={code.length !== 6 || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className='mr-2 size-4 animate-spin' />
                            Verifying Securely...
                        </>
                    ) : (
                        "Verify and Authenticate"
                    )}
                </Button>

                <button
                    onClick={() => window.location.href = '/login'}
                    className='text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors'
                >
                    Back to login
                </button>
            </CardContent>
        </Card>
    )
}

// Main page component wraps the form in Suspense
export default function VerifyPage() {
    return (
        <div className='flex min-h-screen items-center justify-center p-4 bg-slate-50'>
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-slate-300" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Initializing Secure Handshake...</p>
                </div>
            }>
                <VerifyForm />
            </Suspense>
        </div>
    )
}