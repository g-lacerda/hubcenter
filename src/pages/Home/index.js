import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


export default function Home() {
  const navigation = useNavigation();

  return (

    <View style={styles.container}>

      <Text style={styles.texto}>Home</Text>

    </View>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  texto: {
    textAlign: 'center',
    fontSize: 18,
    paddingBottom: 20,
    paddingTop: 20,
    color: '#1f1f1f',
    fontWeight: 'bold'
  },

});