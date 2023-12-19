import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/pages/Login';
import Home from './src/pages/Home';
import Atendimentos from './src/pages/Atendimentos';

const Stack = createNativeStackNavigator();

export default class hubcenter extends Component {

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>

          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>

          <Stack.Screen name="Atendimentos" component={Atendimentos} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
