import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/theme";

type DateFieldProps = {
  label: string;
  value?: string; // ISO date string
  onChange: (dateString: string) => void;
  errorMessage?: string;
};

const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  errorMessage,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
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
      justifyContent: "center",
    },
    error: {
      marginTop: 4,
      color: "red",
      ...theme.textStyles.bodySmall,
    },
    dateText: {
      color: theme.colors.text,
    },
  });

  const displayValue = value
    ? new Date(value).toLocaleDateString()
    : "Select a date";

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === "web" ? (
        // Web fallback
        <input
          type="date"
          value={value ? value.split("T")[0] : ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.colors.neutral}`,
            backgroundColor: theme.colors.surfaceLight,
            color: theme.colors.text,
          }}
        />
      ) : (
        <View
          style={{ alignSelf: "flex-start", marginLeft: 0, paddingLeft: 0 }}
        >
          <DateTimePicker
            style={{ margin: 0, padding: 0 }}
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={"default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onChange(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        </View>
      )}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

export default DateField;
