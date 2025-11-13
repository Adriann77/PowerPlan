import { SafeAreaView, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation';
import { useTheme } from '../theme';

type ProgressScreenProps = BottomTabScreenProps<MainTabParamList, 'Progress'>;

export function ProgressScreen(_props: ProgressScreenProps) {
  const { theme } = useTheme();

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
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        }}
      >
        <Text
          style={{
            ...theme.typography.heading1,
            color: theme.palette.text.primary,
            marginBottom: theme.spacing.md,
          }}
        >
          Progress
        </Text>
        <Text
          style={{
            ...theme.typography.body,
            color: theme.palette.text.secondary,
          }}
        >
          Visualizations for volume, intensity, and readiness will live here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default ProgressScreen;
