'use client'

import { useActionState } from "react"
import { signInWithOTP } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInWithOTP, null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <Image src="/logo.png" alt="Rebus Holdings Logo" width={125} height={100} className="mb-6" />
      {/* Original Design Card */}
      <Card className="w-full max-w-md border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="pt-8 px-8 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            Rebus Holdings Internal LMS
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Enter your company email to receive a login code.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-4">
          <form action={formAction} className="space-y-4">
            <Input 
              name="email" 
              type="email" 
              placeholder="name@rebus.ae" 
              required 
              className="h-12 border-slate-200 rounded-lg focus-visible:ring-[#00ADEF]"
            />

            {state?.error && (
              <p className="text-xs font-medium text-destructive">{state.error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#00ADEF] hover:bg-[#0096d1] text-white h-12 rounded-lg font-bold transition-all" 
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Code"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Registration link outside the card */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          First time here?{" "}
          <Link 
            href="/register" 
            className="text-[#00ADEF] font-semibold hover:underline inline-flex items-center gap-1 group"
          >
            Create your account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  )
}