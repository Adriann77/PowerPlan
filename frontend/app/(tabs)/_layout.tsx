import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className='flex flex-row flex-1 w-full min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'
      >
        <Image
          source={icon}
          tintColor='#151312'
          className='size-5'
        />
        <Text className='ml-2 text-base font-semibold text-secondary'>
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className='items-center justify-center px-4 mt-2'>
      <Image
        source={icon}
        style={{ width: 20, height: 20, tintColor: '#A8b5db' }}
      />
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          backgroundColor: '#0f0d23',
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#0f0d23',
          paddingHorizontal: 14,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <>
              <TabIcon
                focused={focused}
                icon={icons.home}
                title='Home'
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          headerShown: false,
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <>
              <TabIcon
                focused={focused}
                icon={icons.search}
                title='Search'
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='saved'
        options={{
          headerShown: false,
          title: 'Saved',
          tabBarIcon: ({ focused }) => (
            <>
              <TabIcon
                focused={focused}
                icon={icons.save}
                title='Saved'
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <>
              <TabIcon
                focused={focused}
                icon={icons.person}
                title='Profile'
              />
            </>
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
