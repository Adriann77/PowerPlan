import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle='light-content' />
      <Tabs
        screenOptions={{
          headerShown: false,
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
