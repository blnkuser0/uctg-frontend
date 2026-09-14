"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { registerOrganization } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  organizationName: z.string().trim().min(2, "Name is too short"),
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await registerOrganization(values);
      toast.success("Workspace created. Please log in.");
      router.push("/login");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("An account with this email already exists.");
      } else {
        toast.error("Could not create your workspace. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-cyan-500/20">
        <CardHeader className="items-center gap-2 text-center">
          <Image
            src="/assets/branding/logo-square.jpg"
            alt="Ugnexa Catalyst"
            width={44}
            height={44}
            className="size-11 rounded-xl"
          />
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>Set up your organization and admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-1.5">
              <Label htmlFor="organizationName">Organization / company name</Label>
              <Input id="organizationName" autoComplete="organization" {...register("organizationName")} />
              {errors.organizationName && (
                <p className="text-xs text-destructive">{errors.organizationName.message}</p>
              )}
            </div>
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
            <Button type="submit" disabled={isSubmitting} className="mt-1 bg-cyan-600 text-white hover:bg-cyan-500">
              {isSubmitting ? "Creating..." : "Create workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
