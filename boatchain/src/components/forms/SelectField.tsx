import React from "react";
import RNPickerSelect from "react-native-picker-select";
import {Controller, useFormContext} from "react-hook-form";
import {View, Text, StyleSheet} from "react-native";
import {useTheme} from "@/theme";

type Option = { label: string; value: string };

type SelectFieldProps = {
    name: string;
    label: string;
    placeholder: string;
    options: Option[];
    rules?: object;
};

export default function SelectField({
                                        name,
                                        label,
                                        placeholder,
                                        options,
                                        rules,
                                    }: SelectFieldProps) {
    const theme = useTheme();
    const {
        control,
        formState: {errors},
    } = useFormContext();

    const fieldError = errors[name];

    const styles = StyleSheet.create({
        container: {
            marginVertical: 10,
        },
        label: {
            color: theme.colors.textDark,
            ...theme.textStyles.titleMedium,
            marginBottom: 4,
        },
        picker: {
            borderWidth: 1,
            borderColor: theme.colors.neutral,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceLight,
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

            <Controller
                control={control}
                name={name}
                rules={rules}
                render={({field: {onChange, value}}) => (
                    <RNPickerSelect
                        placeholder={{label: placeholder, value: ""}}
                        items={options}
                        value={value}
                        onValueChange={onChange}
                        style={{
                            inputIOS: styles.picker,
                            inputAndroid: styles.picker,
                        }}
                    />
                )}
            />

            {fieldError && (
                <Text style={styles.error}>{(fieldError as any).message}</Text>
            )}
        </View>
    );
}
