import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FF2E2E', // Brand red-orange color #FF2E2E
            tabBarInactiveTintColor: '#8B8FA3',
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '700',
              marginTop: 4,
            },
            tabBarStyle: {
              backgroundColor: '#0F1017', // Solid dark black background matching mockup
              borderTopWidth: 1,
              borderTopColor: '#1E2030',
              height: 75,
              paddingBottom: 12,
              paddingTop: 8,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: '홈',
              tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="projects"
            options={{
              title: '프로젝트',
              tabBarIcon: ({ color }) => <IconSymbol size={22} name="folder.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="scan"
            options={{
              title: '스캔',
              tabBarIcon: ({ color, focused }) => (
                <View style={[
                  styles.scanTabContainer,
                  { backgroundColor: focused ? '#D02E2E' : '#FF2E2E' }
                ]}>
                  <IconSymbol size={24} name="qrcode.viewfinder" color="#FFFFFF" />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="assembly"
            options={{
              title: '조립',
              tabBarIcon: ({ color }) => <IconSymbol size={22} name="square.grid.3x3.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: '나',
              tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.fill" color={color} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
  },
  mainContent: {
    flex: 1,
  },
  scanTabContainer: {
    width: 46,
    height: 46, // Perfect square matching mockup
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16, // Lifted higher to create space and prevent overlap with "스캔" text below
    shadowColor: '#FF2E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});
