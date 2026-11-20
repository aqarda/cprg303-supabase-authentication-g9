import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { AuthField, AuthForm } from "@/components/auth/AuthForm";
import { signInSchema, type SignInValues } from "@/components/auth/validation";
import { useAuth } from "@/context/AuthContext";

export default function SignInScreen() {
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function submit({ email, password }: SignInValues) {
    const { error } = await signIn({ email, password });

    if (error) {
      setError("root", { message: error });
    }
  }

  return (
    <AuthForm
      title="Welcome back"
      submitLabel="Sign in"
      busy={isSubmitting}
      onSubmit={handleSubmit(submit)}
      error={errors.root?.message}
      href="/sign-up"
      linkLabel="Need an account? Sign up"
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <AuthField
            label="Email"
            keyboardType="email-address"
            autoComplete="username"
            editable={!isSubmitting}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <AuthField
            label="Password"
            secureTextEntry
            autoComplete="current-password"
            editable={!isSubmitting}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={fieldState.error?.message}
          />
        )}
      />
    </AuthForm>
  );
}
