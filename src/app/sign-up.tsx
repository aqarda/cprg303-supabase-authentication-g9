import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthField, AuthForm } from "@/components/auth/AuthForm";
import { signUpSchema, type SignUpValues } from "@/components/auth/validation";
import PublicResourceList from "@/components/PublicResourceList";
import { useAuth } from "@/context/AuthContext";

const fields = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "email", label: "Email", autoComplete: "email" },
  { name: "password", label: "Password", autoComplete: "new-password" },
  {
    name: "confirmPassword",
    label: "Confirm password",
    autoComplete: "new-password",
  },
] as const;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [notice, setNotice] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function submit({ fullName, email, password }: SignUpValues) {
    const result = await signUp({ fullName, email, password });

    if (result.error) {
      setError("root", { message: result.error });
      return;
    }

    reset();

    if (result.needsConfirmation) {
      setNotice("Check your inbox for a confirmation link, then sign in.");
    }
  }

  return (
    <AuthForm
      title="Create an account"
      submitLabel="Sign up"
      busy={isSubmitting}
      onSubmit={() => {
        setNotice("");
        void handleSubmit(submit)();
      }}
      error={errors.root?.message}
      notice={notice}
      href="/sign-in"
      linkLabel="Already have an account? Sign in"
      footer={<PublicResourceList />}
    >
      {fields.map(({ name, label, autoComplete }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <AuthField
              label={label}
              autoComplete={autoComplete}
              autoCapitalize={name === "fullName" ? "words" : "none"}
              keyboardType={name === "email" ? "email-address" : "default"}
              secureTextEntry={
                name === "password" || name === "confirmPassword"
              }
              editable={!isSubmitting}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />
      ))}
    </AuthForm>
  );
}
