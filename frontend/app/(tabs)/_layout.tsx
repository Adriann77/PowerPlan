import { Tabs, Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function TabLayout() {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href='/login' />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <>
      <StatusBar barStyle='light-content' />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#030014',
          },
          headerTintColor: '#9ca4ab',
          headerTitle: currentUser?.username ?? 'PowerPlan',
          headerRight: () =>
            currentUser ? (
              <TouchableOpacity
                onPress={handleLogout}
                accessibilityRole='button'
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ color: '#AB8BFF', fontWeight: '600' }}>
                  Wyloguj
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/login')}
                accessibilityRole='button'
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ color: '#AB8BFF', fontWeight: '600' }}>
                  Zaloguj
                </Text>
              </TouchableOpacity>
            ),
          tabBarStyle: {
            backgroundColor: '#030014',
            borderTopColor: '#151312',
            borderTopWidth: 1,
            paddingTop: 15,
            height: 85,
          },

          tabBarActiveTintColor: '#AB8BFF',
          tabBarInactiveTintColor: '#9ca4ab',
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Główna',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='plans'
          options={{
            title: 'Plany',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='history'
          options={{
            title: 'Historia',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='progress'
          options={{
            title: 'Postęp',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
