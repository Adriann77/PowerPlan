import { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getActivePlan, mockWorkoutState } from '../data/mockData';
import type { MainTabParamList } from '../navigation';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../theme';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen(_props: HomeScreenProps) {
  const { theme } = useTheme();
  const activePlan = useMemo(() => getActivePlan(), []);
  const { currentUser, logout } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.background,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          ...theme.typography.heading1,
          color: theme.palette.text.primary,
          marginBottom: theme.spacing.md,
        }}
      >
        Welcome back, {currentUser?.username ?? mockWorkoutState.user.username}
      </Text>
      {currentUser ? (
        <TouchableOpacity
          onPress={logout}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: theme.palette.surface,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.palette.primary,
            }}
          >
            Sign out
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text
        style={{
          ...theme.typography.body,
          color: theme.palette.text.secondary,
          marginBottom: theme.spacing.lg,
        }}
      >
        Active plan • {activePlan?.name ?? 'No active plan assigned'}
      </Text>

      <FlatList
        ItemSeparatorComponent={() => (
          <View style={{ height: theme.spacing.md }} />
        )}
        data={activePlan?.trainingDays ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.heading2,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing.sm,
              }}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text
                style={{
                  ...theme.typography.body,
                  color: theme.palette.text.secondary,
                  marginBottom: theme.spacing.md,
                }}
              >
                {item.description}
              </Text>
            ) : null}
            <Text
              style={{
                ...theme.typography.caption,
                color: theme.palette.text.muted,
              }}
            >
              {item.exercises.length} exercises • first move:{' '}
              {item.exercises[0]?.name ?? 'TBD'}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: theme.palette.surface,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                ...theme.typography.body,
                color: theme.palette.text.secondary,
              }}
            >
              Training days will appear here once plans are configured.
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default HomeScreen;
