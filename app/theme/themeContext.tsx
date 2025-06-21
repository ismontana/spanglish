import { darkTheme, lightTheme } from "@/constants/theme";
import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext({
    isdark:false,
    theme: lightTheme,
    toggleTheme: ()=>{},
    colors:lightTheme
})

export const ThemeProvider = ({children}:{children: React.ReactNode}) =>{
    const [isdark, setIsDark] = useState(false)

    const toggleTheme = () => setIsDark((prev) => !prev);
    const theme = isdark ? darkTheme : lightTheme;
    const colors =  isdark ? darkTheme : lightTheme;
    return (
    <ThemeContext.Provider value={{ isdark, theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme =() => useContext(ThemeContext)