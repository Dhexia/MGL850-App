import {createContext, useContext, useMemo} from "react";
import {TextStyle, useColorScheme} from "react-native";

const colors = {
    light: {
        surfaceDark: "#1B1F3B",
        secondary: "#007AFF",
        primary: "#0536F8",
        backgroundLight: "#F9FBFB",
        neutral: "#E5E7EB",
        backgroundDark: "#000000",
        surfaceLight: "#FFFFFF",
        destructive: "#E61515",
        textDark: "#000000",
        textLight: "#FFFFFF",
        background: "#F9FBFB",
        border: 'rgb(216, 216, 216)',
        text: "#000",
    },
    dark: {
        surfaceDark: "#F9FBFB",
        secondary: "#007AFF",
        primary: "#640CFD",
        backgroundLight: "#0F131B",
        neutral: "#3A506B",
        backgroundDark: "#FFFFFF",
        surfaceLight: "#1B1F3B",
        destructive: "#E61515",
        textDark: "#FFFFFF",
        textLight: "#000000",
        background: "#0F131B",
        text: "#FFF",
    }
}

type NamedTextStyles = {
    [key: string]: TextStyle;
};

const textStyles: NamedTextStyles = {
    titleBig: {
        fontFamily: "Space Grotesk",
        fontSize: 35,
        fontWeight: "bold",
    },
    titleLarge: {
        fontFamily: "Space Grotesk",
        fontSize: 20,
        fontWeight: "bold",
    },
    titleMedium: {
        fontFamily: "Alberta Sans",
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 18,
    },
    titleSmall: {
        fontFamily: "Alberta Sans",
        fontSize: 12,
        fontWeight: "bold",
        lineHeight: 14,
    },
    bodyLarge: {
        fontFamily: "Alberta Sans",
        fontSize: 13,
        fontWeight: "regular",
        lineHeight: 15,
    },
    bodyMedium: {
        fontFamily: "Alberta Sans",
        fontSize: 11,
        fontWeight: "regular",
        lineHeight: 14,
    },
    bodyMoney: {
        fontFamily: "Space Grotesk",
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 18
    }

}


const lightTheme = {
    colors: colors.light,
    textStyles: textStyles,
}

const darkTheme = {
    colors: colors.dark,
    textStyles: textStyles,
}

const ThemeContext = createContext(lightTheme);

export function ThemeProvider({children}) {
    const colorScheme = useColorScheme();

    const theme = useMemo(() => {
        return colorScheme === 'dark' ? darkTheme : lightTheme;
    }, [colorScheme]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);