'use client'

import { useState } from 'react'
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

export const dynamic = 'force-dynamic'

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleVerify() {
        setIsLoading(true)
        setError(null)

        try{
            const result = await verifyOTP(email, code)
            if(result?.error) {
                setError(result.error)
            }
        } catch (e) {
            setError('Invalid or expired code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center p-4'>
            <Card className='w-full max-w-md shadow lg'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl'>Verify Your E-mail</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to <br/>
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
                        <p className='text-sm text-destructive font-medium bg-destructive/10 p-2 rounded w-full text-center'>
                            {error}
                        </p>
                    )}

                    <Button
                        onClick={handleVerify}
                        className='w-full'
                        disabled={code.length !== 6 || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 size-4 animate-spin'/>
                                Verifying...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <button
                        onClick={() => window.location.href ='/login'}
                        className='text-sm text-muted-foreground hover:underline'
                    >
                        Back to login
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}