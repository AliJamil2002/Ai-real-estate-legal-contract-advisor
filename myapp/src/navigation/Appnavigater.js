import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen     from '../screen/login';
import RegisterScreen  from '../screen/register';
import DashboardScreen from '../screen/dashboard';
import UploadScreen    from '../screen/upload';
import SummaryScreen   from '../screen/summary';
import ChatScreen      from '../screen/chat';
import VoiceScreen     from '../screen/voice';
import HelpScreen      from '../screen/help';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login"     component={LoginScreen} />
        <Stack.Screen name="Register"  component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Upload"    component={UploadScreen} />
        <Stack.Screen name="Summary"   component={SummaryScreen} />
        <Stack.Screen name="Chat"      component={ChatScreen} />
        <Stack.Screen name="Voice"     component={VoiceScreen} />
        <Stack.Screen name="Help"      component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
