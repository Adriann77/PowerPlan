import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name='Home'
        component={HomeScreen}
      />
      <Tab.Screen
        name='Plans'
        component={PlansScreen}
      />
      <Tab.Screen
        name='WorkoutHistory'
        component={WorkoutHistoryScreen}
      />
      <Tab.Screen
        name='Progress'
        component={ProgressScreen}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

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
