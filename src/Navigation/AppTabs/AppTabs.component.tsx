import { useState } from 'react';
import { Text, View } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  AddScreen,
  BudgetScreen,
  DashboardScreen,
  ProfileScreen,
  ReportsScreen,
} from '../../Screens';
import { colors } from '../../Theme';

import AddTransactionSheet from './AddTransactionSheet.component';
import styles from './AppTabs.styles';
import type { AppTabsParamList } from './AppTabs.types';

const Tab = createBottomTabNavigator<AppTabsParamList>();
const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.slate400,
  tabBarLabelStyle: styles.label,
  tabBarStyle: styles.tabBar,
};

type TabIconProps = {
  color: string;
  icon: string;
};

function TabIcon({ color, icon }: TabIconProps) {
  return <Text style={[styles.icon, { color }]}>{icon}</Text>;
}

function HomeTabIcon({ color }: { color: string }) {
  return <TabIcon color={color} icon="⌂" />;
}

function ReportsTabIcon({ color }: { color: string }) {
  return <TabIcon color={color} icon="▥" />;
}

function BudgetTabIcon({ color }: { color: string }) {
  return <TabIcon color={color} icon="♟" />;
}

function ProfileTabIcon({ color }: { color: string }) {
  return <TabIcon color={color} icon="●" />;
}

const tabScreens = [
  { component: DashboardScreen, icon: HomeTabIcon, name: 'Home' },
  { component: ReportsScreen, icon: ReportsTabIcon, name: 'Reports' },
  {
    component: AddScreen,
    icon: AddTabIcon,
    label: '',
    name: 'Add',
  },
  { component: BudgetScreen, icon: BudgetTabIcon, name: 'Budget' },
  { component: ProfileScreen, icon: ProfileTabIcon, name: 'Profile' },
] as const;

function AddTabIcon() {
  return (
    <View style={styles.addButton}>
      <Text style={styles.addIcon}>+</Text>
    </View>
  );
}

function getAddTabListeners(onOpen: () => void) {
  return {
    tabPress: (event: { preventDefault: () => void }) => {
      event.preventDefault();
      onOpen();
    },
  };
}

function getTabListeners(screenName: string, onOpen: () => void) {
  return screenName === 'Add' ? getAddTabListeners(onOpen) : undefined;
}

function getTabOptions(screen: (typeof tabScreens)[number]) {
  return {
    tabBarIcon: screen.icon,
    tabBarLabel: 'label' in screen ? screen.label : undefined,
  };
}

function AppTabs() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);

  return (
    <>
      <Tab.Navigator screenOptions={screenOptions}>
        {tabScreens.map(screen => (
          <Tab.Screen
            component={screen.component}
            key={screen.name}
            listeners={getTabListeners(screen.name, () => setAddSheetVisible(true))}
            name={screen.name}
            options={getTabOptions(screen)}
          />
        ))}
      </Tab.Navigator>
      <AddTransactionSheet
        onClose={() => setAddSheetVisible(false)}
        visible={isAddSheetVisible}
      />
    </>
  );
}

export default AppTabs;
