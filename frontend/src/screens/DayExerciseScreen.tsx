import { useMemo } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mockWorkoutState } from '../data/mockData';
import type { RootStackParamList } from '../navigation';
import type { TrainingDay } from '../types/workout';
import { useTheme } from '../theme';

type DayExerciseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DayExercise'
>;

export function DayExerciseScreen({
  navigation,
  route,
}: DayExerciseScreenProps) {
  const { theme } = useTheme();
  const { trainingDayId } = route.params;

  const trainingDay = useMemo<TrainingDay | undefined>(() => {
    for (const plan of mockWorkoutState.plans) {
      const day = plan.trainingDays.find((td) => td.id === trainingDayId);
      if (day) return day;
    }
    return undefined;
  }, [trainingDayId]);

  if (!trainingDay) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.palette.background,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
          }}
        >
          <Text
            style={{
              ...theme.typography.heading2,
              color: theme.palette.text.primary,
              marginBottom: theme.spacing.md,
            }}
          >
            Training Day Not Found
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: theme.palette.primary,
              borderRadius: theme.radii.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
            }}
          >
            <Text
              style={{
                ...theme.typography.button,
                color: theme.palette.background,
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.palette.background,
      }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.palette.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              alignSelf: 'flex-start',
              marginBottom: theme.spacing.md,
            }}
          >
            <Text
              style={{
                ...theme.typography.body,
                color: theme.palette.primary,
              }}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              ...theme.typography.heading1,
              color: theme.palette.text.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {trainingDay.name}
          </Text>
          {trainingDay.description ? (
            <Text
              style={{
                ...theme.typography.body,
                color: theme.palette.text.secondary,
              }}
            >
              {trainingDay.description}
            </Text>
          ) : null}
        </View>

        {/* Exercise List */}
        <FlatList
          data={trainingDay.exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.spacing.md }} />
          )}
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: theme.palette.surface,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.palette.border,
              }}
            >
              {/* Exercise Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.palette.primary,
                    width: 32,
                    height: 32,
                    borderRadius: theme.radii.full,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: theme.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      ...theme.typography.button,
                      color: theme.palette.background,
                      fontSize: 14,
                    }}
                  >
                    {item.orderNumber}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...theme.typography.heading2,
                      color: theme.palette.text.primary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>

              {/* Exercise Details Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: item.notes ? theme.spacing.md : 0,
                }}
              >
                <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.text.muted,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Sets
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.palette.text.primary,
                      fontWeight: '600' as const,
                    }}
                  >
                    {item.sets}
                  </Text>
                </View>
                <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.text.muted,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Reps
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.palette.text.primary,
                      fontWeight: '600' as const,
                    }}
                  >
                    {item.reps}
                  </Text>
                </View>
                <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.text.muted,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Tempo
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.palette.text.primary,
                      fontWeight: '600' as const,
                    }}
                  >
                    {item.tempo}
                  </Text>
                </View>
                <View style={{ width: '50%', marginBottom: theme.spacing.sm }}>
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.text.muted,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Rest
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.palette.text.primary,
                      fontWeight: '600' as const,
                    }}
                  >
                    {item.restSeconds}s
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {item.notes ? (
                <View
                  style={{
                    backgroundColor: theme.palette.background,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      ...theme.typography.caption,
                      color: theme.palette.text.muted,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Notes
                  </Text>
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {item.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('WorkoutSession', { trainingDayId })
              }
              style={{
                backgroundColor: theme.palette.primary,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.lg,
                marginTop: theme.spacing.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...theme.typography.button,
                  color: theme.palette.background,
                }}
              >
                Start Workout
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default DayExerciseScreen;
