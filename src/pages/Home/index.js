import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';


export default function Home() {
  const navigation = useNavigation();

  const logout = async () => {
    const token = await EncryptedStorage.getItem("access_token");

    if (!token) {
      navigation.navigate('Login');
      return;
    }

    const url = 'https://teste.hubsoft.com.br/api/logout'

    try {
      const response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      

      if (response.ok) {
        Alert.alert('Sucesso', 'Logout realizado com sucesso');
        await EncryptedStorage.setItem('access_token', '');
        await EncryptedStorage.setItem('senha', '');
        
        navigation.navigate('Login');
      } else if (response.status === 401) {
        const text = await response.text(); 

        Alert.alert('Falha no Logout (' + response.status + ')', 'Logout falhou.\n' + text);
      } else {
        const text = await response.text();

        Alert.alert('Falha no Logout (' + response.status + ')', 'Logout falhou.\n' + text);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const redirectPage = async (page) => {
    navigation.navigate(page);
}

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="logout" size={30} color="#eee" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.titulo}>Hubcenter</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>

        <TouchableOpacity style={styles.botao} onPress={() => { redirectPage('Atendimentos') }}>
          <MaterialCommunityIcons name="calendar-clock" style={styles.icon} size={40} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Atendimentos e OS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => { }}>
          <FontAwesome5 name="user-circle" style={styles.icon} size={40} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Clientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => { }}>
          <Feather name="box" style={styles.icon} size={40} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Estoque
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={() => { }}>
          <Feather name="users" style={styles.icon} size={40} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Prospectos
          </Text>
        </TouchableOpacity>

        <View style={styles.backgroundArea}>
          <Image
            source={require('../../img/hubsoft.png')}
            resizeMode="cover"
            style={styles.backgroundImage}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'space-between',
  },
  headerContainer: {
    height: 60,
    backgroundColor: '#0475e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'relative'
  },
  iconButton: {
    width: 30,
  },
  logoutButton: {

  },
  titulo: {
    color: '#eee',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
  },
  botao: {
    margin: 15,
    width: 125,
    height: 125,
    backgroundColor: 'transparent',
    borderColor: '#0475e8',
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  botaoTexto: {
    color: '#0475e8',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
  },
  titulo: {
    color: '#eee',
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'bold',
  },
  icon: {
    alignSelf: 'center',
  },
  logoutButton: {
    position: 'absolute', 
    alignItems: 'center',
    padding: 5,
    left: 10,
    top: 4,
  },
  headerIconContainer: {
    alignItems: 'center', 
    justifyContent: 'center', 

  },
  logoutText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingRight: 5
  },
  backgroundArea: {
    
    position: 'absolute',
    top: "40%",
    left: 0,
    right: 0,
    bottom: "-15%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '80%',
    opacity: 0.08,
  },

});