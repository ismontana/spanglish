import { ThemeProvider } from '@/app/theme/themeContext';
import { Stack } from 'expo-router';


export default function Layout() {
  return(
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_left' }} />
    </ThemeProvider>
  )
}