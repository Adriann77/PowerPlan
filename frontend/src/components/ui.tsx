import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Loading Overlay for full-screen loading states
type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message = 'Ładowanie...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/70">
        <View className="bg-slate-800 rounded-2xl p-8 items-center mx-6">
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-white text-base mt-4 text-center">{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

// Loading Spinner for inline loading
type LoadingSpinnerProps = {
  message?: string;
  size?: 'small' | 'large';
};

export function LoadingSpinner({ message, size = 'large' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size={size} color="#AB8BFF" />
      {message && <Text className="text-gray-400 mt-4 text-base">{message}</Text>}
    </View>
  );
}

// Error State Component
type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({ message, onRetry, retryLabel = 'Spróbuj ponownie' }: ErrorStateProps) {
  return (
    <View className="bg-red-900/20 border border-red-500 rounded-xl p-6">
      <Text className="text-red-400 text-base mb-2">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 bg-red-500 rounded-lg py-3 px-4 self-start"
        >
          <Text className="text-white font-semibold">{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Empty State Component
type EmptyStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="bg-slate-800 rounded-xl p-6 items-center">
      {title && <Text className="text-white text-lg font-bold mb-2 text-center">{title}</Text>}
      <Text className="text-gray-400 text-base text-center">{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="mt-4 bg-purple-600 rounded-lg py-3 px-6"
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Custom RefreshControl factory
export function createRefreshControl(refreshing: boolean, onRefresh: () => void) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#AB8BFF"
      colors={['#AB8BFF']}
    />
  );
}

// Section Header Component
type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, rightElement }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-1">
        <Text className="text-xl font-bold text-white">{title}</Text>
        {subtitle && <Text className="text-gray-400 text-sm mt-1">{subtitle}</Text>}
      </View>
      {rightElement}
    </View>
  );
}

// Card Component
type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'muted';
  onPress?: () => void;
  className?: string;
};

export function Card({ children, variant = 'default', onPress, className = '' }: CardProps) {
  const variantStyles = {
    default: 'bg-slate-800 border-gray-700',
    active: 'bg-slate-700 border-purple-500',
    muted: 'bg-slate-800/50 border-gray-700/50',
  };

  const content = (
    <View className={`rounded-xl p-5 border ${variantStyles[variant]} ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Badge Component
type BadgeProps = {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    info: 'bg-purple-600',
  };

  return (
    <View className={`px-3 py-1 rounded-full ${variantStyles[variant]}`}>
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </View>
  );
}

// Button Component
type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-purple-600',
    secondary: 'bg-slate-600',
    danger: 'bg-red-600',
    success: 'bg-green-600',
    outline: 'bg-transparent border border-purple-500',
  };

  const sizeStyles = {
    small: 'py-2 px-3',
    medium: 'py-3 px-4',
    large: 'py-4 px-6',
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-lg items-center justify-center flex-row
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className={`text-white font-semibold ${textSizes[size]}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// Progress Bar Component
type ProgressBarProps = {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
};

export function ProgressBar({
  progress,
  color = 'bg-purple-600',
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View className="w-full">
      <View
        className="w-full bg-slate-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className={`h-full ${color} rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
      {showLabel && (
        <Text className="text-gray-400 text-xs mt-1 text-right">
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

// Stat Card Component
type StatCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

export function StatCard({ label, value, subtitle, trend, trendValue }: StatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <View className="bg-slate-800 rounded-xl p-4 flex-1">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-400 text-sm">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      {(subtitle || (trend && trendValue)) && (
        <View className="flex-row items-center mt-1">
          {trend && trendValue && (
            <Text className={`text-sm ${trendColors[trend]} mr-2`}>
              {trendIcons[trend]} {trendValue}
            </Text>
          )}
          {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

// Filter Chip Component
type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        px-4 py-2 rounded-full mr-2 mb-2 border
        ${selected 
          ? 'bg-purple-600 border-purple-500' 
          : 'bg-slate-800 border-gray-600'}
      `}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Divider Component
export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-gray-700 ${className}`} />;
}

// Select Component
type SelectOption = {
  value: string | null;
  label: string;
};

type SelectProps = {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export function Select({ label, placeholder = 'Wybierz...', options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <View>
      {label && (
        <Text className="text-white font-semibold mb-2">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between bg-slate-800 border border-gray-600 rounded-xl px-4 py-3"
      >
        <Text className={`text-base ${selectedOption ? 'text-white' : 'text-gray-400'}`}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 bg-black/60 justify-end"
        >
          <View className="bg-slate-800 rounded-t-3xl max-h-[60%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-700">
              <Text className="text-lg font-bold text-white">{label || 'Wybierz'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-80">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value ?? 'null'}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-6 py-4 border-b border-gray-700/50 ${
                    value === option.value ? 'bg-purple-600/20' : ''
                  }`}
                >
                  <Text className={`text-base ${value === option.value ? 'text-purple-400 font-semibold' : 'text-white'}`}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#AB8BFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="h-8" />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
