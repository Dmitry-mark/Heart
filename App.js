import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from './screens/StartScreen';
import Main from './screens/Main';
import Pulse from './screens/Pulse';

const Stack = createStackNavigator();

function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Pulse">
          <Stack.Screen 
            name="Pulse" 
            component={Pulse} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="StartScreen" 
            component={StartScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Main" 
            component={Main} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;
