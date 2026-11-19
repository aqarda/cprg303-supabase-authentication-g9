import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    email,
    password: z
      .string()
      .min(8, "Use at least 8 characters for your password.")
      .regex(/[a-zA-Z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ["confirmPassword"],
    message: "Your passwords do not match.",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
