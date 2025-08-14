import React, { useRef } from "react";
import RNPickerSelect from "react-native-picker-select";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "@/theme";

type Option = { label: string; value: string };

type SelectFieldProps = {
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
};

export default function SelectField({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  errorMessage,
}: SelectFieldProps) {
  const theme = useTheme();

  const pickerRef = useRef<any>(null);

  const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    label: {
      color: theme.colors.textDark,
      ...theme.textStyles.titleMedium,
      marginBottom: 4,
    },
    fakeInput: {
      borderWidth: 1,
      borderColor: theme.colors.neutral,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: 12,
      paddingVertical: 12,
      justifyContent: "center",
    },
    fakeInputText: {
      fontSize: theme.textStyles.bodyLarge.fontSize,
      color: theme.colors.textDark,
    },
    iconOverlay: {
      position: "absolute",
      right: 12,
      top: "60%",
      transform: "translate(-50%,0%)",
      width: 12,
      height: 12,
      pointerEvents: "none", // let touches pass through
      borderTopWidth: 6,
      borderTopColor: theme.colors.textDark,
      borderRightWidth: 6,
      borderRightColor: "transparent",
      borderLeftWidth: 6,
      borderLeftColor: "transparent",
    },
    error: {
      marginTop: 4,
      color: "red",
      ...theme.textStyles.bodySmall,
    },
  });

  // On iOS, tapping anywhere should open the picker
  // We render a hidden RNPickerSelect and simulate open by focusing it

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          // @ts-ignore
          pickerRef.current?.togglePicker?.(); // works only on Android unfortunately
          // On iOS no direct togglePicker, so we just focus the underlying hidden picker by triggering a dummy action
          // But RNPickerSelect does not expose open method for iOS, so no simple solution here
        }}
        style={styles.fakeInput}
      >
        <Text style={styles.fakeInputText}>
          {value
            ? options.find((opt) => opt.value === value)?.label || ""
            : placeholder}
        </Text>
      </TouchableOpacity>

      <RNPickerSelect
        ref={pickerRef}
        placeholder={{ label: placeholder, value: "" }}
        items={options}
        value={value}
        onValueChange={(value) => {
          // Protéger contre les valeurs null/undefined
          if (value !== null && value !== undefined) {
            onValueChange(value);
          }
        }}
        style={{
          inputIOS: { height: 0, width: 0, opacity: 0 },
          inputAndroid: { height: 0, width: 0, opacity: 0 },
        }}
        useNativeAndroidPickerStyle={false}
      />
      <View style={styles.iconOverlay} />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}
