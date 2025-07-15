import React, { forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { useTheme } from "@/theme";

export type TextFieldProps = {
  name: string;
  label: string;
  details?: string;
  placeholder?: string;
  rules?: object;
  inputProps?: TextInputProps;
  borderBottomWidth?: number;
};

// forwardRef pour gérer focus “suivant”
const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ name, label, details, placeholder, rules, inputProps = {} ,borderBottomWidth = 1,}, ref) => {
    const theme = useTheme();
    const {
      control,
      formState: { errors },
    } = useFormContext();

    const styles = StyleSheet.create({
      container: {
        paddingVertical: 10,
        borderBottomWidth: borderBottomWidth,
        borderColor: theme.colors.neutral,
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      textBlock: { maxWidth: "70%" },
      title: {
        color: theme.colors.textDark,
        ...theme.textStyles.titleMedium,
      },
      details: {
        color: theme.colors.textDark,
        ...theme.textStyles.bodyMedium,
      },
      input: {
        flex: 1,
        maxWidth: 200,
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: theme.colors.neutral,
        textAlign: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
      },
      error: {
        marginTop: 6,
        color: "red",
        ...theme.textStyles.bodySmall,
      },
    });

    const fieldError = errors[name];

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{label}</Text>
            {details && <Text style={styles.details}>{details}</Text>}
          </View>

          <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
              field: { onChange, value, onBlur },
            }) => (
              <TextInput
                ref={ref}
                style={styles.input}
                placeholder={placeholder}
                value={value as string}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType={inputProps.returnKeyType ?? "next"}
                {...inputProps}
              />
            )}
          />
        </View>

        {fieldError && (
          <Text style={styles.error}>
            {(fieldError as any).message}
          </Text>
        )}
      </View>
    );
  }
);

export default TextField;
