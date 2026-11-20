import { Link } from "expo-router";
import type { ComponentPropsWithRef, ReactNode } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  inputRef?: ComponentPropsWithRef<typeof TextInput>["ref"];
};

export function AuthField({ label, error, inputRef, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        accessibilityHint={error}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        style={[styles.input, error ? styles.invalid : undefined]}
      />

      {Boolean(error) && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

type FormProps = {
  title: string;
  children: ReactNode;
  submitLabel: string;
  busy: boolean;
  onSubmit: () => void;
  error?: string;
  notice?: string;
  linkLabel: string;
  href: "/sign-in" | "/sign-up";
  footer?: ReactNode;
};

export function AuthForm(props: FormProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>
              {props.title}
            </Text>

            {props.children}

            {Boolean(props.error) && (
              <Text accessibilityRole="alert" style={styles.error}>
                {props.error}
              </Text>
            )}

            {Boolean(props.notice) && (
              <Text accessibilityLiveRegion="polite" style={styles.notice}>
                {props.notice}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={props.submitLabel}
              accessibilityState={{ disabled: props.busy, busy: props.busy }}
              disabled={props.busy}
              onPress={props.onSubmit}
              style={({ pressed }) => [
                styles.button,
                (pressed || props.busy) && styles.dim,
              ]}
            >
              {props.busy && <ActivityIndicator color="#fff" />}
              <Text style={styles.buttonText}>{props.submitLabel}</Text>
            </Pressable>

            {!props.busy && (
              <Link replace href={props.href} style={styles.link}>
                {props.linkLabel}
              </Link>
            )}

            {props.footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f8fb",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#17243b",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#17243b",
  },
  input: {
    minHeight: 48,
    backgroundColor: "#fff",
    color: "#17243b",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#77859a",
    borderRadius: 8,
  },
  invalid: {
    borderColor: "#a5272b",
  },
  error: {
    color: "#a5272b",
    fontSize: 15,
  },
  notice: {
    color: "#195b44",
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#234d88",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dim: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    color: "#234d88",
    textDecorationLine: "underline",
    textAlign: "center",
    paddingVertical: 12,
  },
});
