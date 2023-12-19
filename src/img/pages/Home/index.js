import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch } from 'react-native';

export default class hubcenter extends Component {

    constructor(props) {
      super(props);
      this.state = {
        email: null,
        senha: null,
        client_id: null,
        client_secret: null,
        access_token: null,
        nome: null,
        idade: null,
        sexo: null,
        limite: 0,
        estudante: false,
        isKeyboardVisible: false,
      };
    }
  
    render() {
  
      return (
  
        <View style={styles.container}>
  
          
  
        </View>
  
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 85,
      backgroundColor: '#eee',
      /*justifyContent: 'center',
      alignItems: 'center',*/
    },
    
  });