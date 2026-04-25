'use client'

import { useActionState } from "react"
import { signInWithOTP } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInWithOTP, null)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rebus Holdings Internal LMS</CardTitle>
          <CardDescription>Enter your company email to receive a login code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input 
                name="email" 
                type="email" 
                placeholder="name@rebus.ae" 
                required 
              />
            </div>

            {state?.error && (
              <p className="text-sm font-medium text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full bg-rebus-blue hover:bg-rebus-blue/80 text-white py-6" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}