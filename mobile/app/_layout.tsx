import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../src/store/themeStore';

export default function RootLayout() {
  const { isDark } = useThemeStore();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ headerShown: true, title: 'Book Details' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
        <Stack.Screen name="admin/representatives" options={{ headerShown: false, title: 'Representatives' }} />
        <Stack.Screen name="admin/schools" options={{ headerShown: false, title: 'Schools' }} />
        <Stack.Screen name="admin/reports" options={{ headerShown: false, title: 'Reports' }} />
        <Stack.Screen name="rep/my-schools" options={{ headerShown: false, title: 'My Schools' }} />
        <Stack.Screen name="rep/create-order" options={{ headerShown: false, title: 'Create Order' }} />
      </Stack>
    </>
  );
}
