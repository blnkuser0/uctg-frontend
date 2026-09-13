"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { registerFirstAdmin } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closed, setClosed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await registerFirstAdmin(values);
      toast.success("Admin account created. Please log in.");
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        setClosed(true);
      } else {
        toast.error("Could not create the account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-amber-500/20">
        <CardHeader className="items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-sm font-bold text-stone-900">
            UC
          </div>
          <CardTitle>Create the admin account</CardTitle>
          <CardDescription>This is only available once, for the very first user.</CardDescription>
        </CardHeader>
        <CardContent>
          {closed ? (
            <div className="grid gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Registration is closed — an admin account already exists. Ask your admin to create your account.
              </p>
              <Button variant="secondary" render={<Link href="/login">Back to sign in</Link>} />
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" autoComplete="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="mt-1 bg-amber-500 text-stone-900 hover:bg-amber-400">
                {isSubmitting ? "Creating..." : "Create admin account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
