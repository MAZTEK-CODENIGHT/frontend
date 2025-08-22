import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import UserSelectionScreen from './screens/UserSelection/UserSelection';
import DashboardScreen from './screens/Dashboard/Dashboard';
import BillDetailScreen from './screens/BillDetail/BillDetail';
import WhatIfScreen from './screens/WhatIfSimulator/WhatIfSimulator';
import AnomaliesScreen from './screens/Anomalies/Anomalies';
import CheckoutScreen from './screens/Checkout/Checkout';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="UserSelection"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen
          name="UserSelection"
          component={UserSelectionScreen}
          options={{ title: 'Kullanıcı Seçimi' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Ana Sayfa' }}
        />
        <Stack.Screen
          name="BillDetail"
          component={BillDetailScreen}
          options={{ title: 'Fatura Detayları' }}
        />
        <Stack.Screen
          name="WhatIfSimulator"
          component={WhatIfScreen}
          options={{ title: 'What-If Simülasyonu' }}
        />
        <Stack.Screen
          name="Anomalies"
          component={AnomaliesScreen}
          options={{ title: 'Anomali Analizi' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Sipariş Onayı' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}