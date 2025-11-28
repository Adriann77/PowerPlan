import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { WorkoutHistoryScreen } from '../screens/WorkoutHistoryScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { WorkoutSessionScreen } from '../screens/WorkoutSessionScreen';
import { DayExerciseScreen } from '../screens/DayExerciseScreen';
import { useAuth } from '../providers/AuthProvider';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Plans: undefined;
  WorkoutHistory: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DayExercise: { trainingDayId: string };
  WorkoutSession: { trainingDayId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen
        name='Login'
        component={LoginScreen}
      />
      <AuthStack.Screen
        name='Register'
        component={RegisterScreen}
      />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#030014',3
          borderTopColor: '#151312',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#AB8BFF',
        tabBarInactiveTintColor: '#9ca4ab',
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'WorkoutHistory') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else {
            iconName = 'home';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          title: 'Główna',
        }}
      />
      <Tab.Screen
        name='Plans'
        component={PlansScreen}
        options={{
          title: 'Plany',
        }}
      />
      <Tab.Screen
        name='WorkoutHistory'
        component={WorkoutHistoryScreen}
        options={{
          title: 'Historia',
        }}
      />
      <Tab.Screen
        name='Progress'
        component={ProgressScreen}
        options={{
          title: 'Postęp',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center bg-slate-900'>
        <ActivityIndicator
          size='large'
          color='#AB8BFF'
        />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <RootStack.Screen
            name='Main'
            component={MainTabs}
          />
          <RootStack.Screen
            name='DayExercise'
            component={DayExerciseScreen}
          />
          <RootStack.Screen
            name='WorkoutSession'
            component={WorkoutSessionScreen}
          />
        </>
      ) : (
        <RootStack.Screen
          name='Auth'
          component={AuthNavigator}
        />
      )}
    </RootStack.Navigator>
  );
}
