import React, { forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  Keyboard,
} from "react-native";
import { useTheme } from "@/theme";

type TextFieldProps = TextInputProps & {
  label: string;
  errorMessage?: string;
};

const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    { label, errorMessage, onSubmitEditing, returnKeyType = "done", ...props },
    ref
  ) => {
    const theme = useTheme();

    const styles = StyleSheet.create({
      container: { marginVertical: 10 },
      label: {
        color: theme.colors.textDark,
        ...theme.textStyles.titleMedium,
        marginBottom: 4,
      },
      input: {
        borderWidth: 1,
        borderColor: theme.colors.neutral,
        borderRadius: 8,
        backgroundColor: theme.colors.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: theme.colors.text,
      },
      error: {
        marginTop: 4,
        color: "red",
        ...theme.textStyles.bodySmall,
      },
    });

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={styles.input}
          returnKeyType={returnKeyType}
          onSubmitEditing={e=>onSubmitEditing(e)}
          {...props}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    );
  }
);

export default TextField;
