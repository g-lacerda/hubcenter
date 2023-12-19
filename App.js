import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, Button, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';


const screenWidth = Dimensions.get('window').width;
const buttonWidth = screenWidth * 0.25;

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

  async componentDidMount() {
    try {
      const email = await EncryptedStorage.getItem("email");
      const senha = await EncryptedStorage.getItem("senha");
      const client_id = await EncryptedStorage.getItem("client_id");
      const client_secret = await EncryptedStorage.getItem("client_secret");
      const access_token = await EncryptedStorage.getItem("access_token");

      this.setState({
        email: email || this.state.email,
        senha: senha || this.state.senha,
        client_id: client_id || this.state.client_id,
        client_secret: client_secret || this.state.client_secret,
        access_token: access_token || this.state.access_token,
      });
    } catch (error) {
      console.log(error);
    }

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  _keyboardDidShow = () => {
    this.setState({ isKeyboardVisible: true });
  };

  _keyboardDidHide = () => {
    this.setState({ isKeyboardVisible: false });
  };

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }



  async componentDidUpdate(prevProps, prevState) {
    // Funções para verificar se os valores são diferentes e precisam ser atualizados
    const needsUpdate = (key, prevValue) => {
      const currentValue = this.state[key];
      return currentValue !== undefined && currentValue !== prevValue;
    };

    const updateStorage = async (key, value) => {
      try {
        await EncryptedStorage.setItem(key, value);
      } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
      }
    };

    // Verifica e atualiza os valores alterados
    if (needsUpdate('email', prevState.email)) {
      updateStorage("email", this.state.email);
    }

    if (needsUpdate('senha', prevState.senha)) {
      updateStorage("senha", this.state.senha);
    }

    if (needsUpdate('client_id', prevState.client_id)) {
      updateStorage("client_id", this.state.client_id);
    }

    if (needsUpdate('client_secret', prevState.client_secret)) {
      updateStorage("client_secret", this.state.client_secret);
    }

    if (needsUpdate('access_token', prevState.access_token)) {
      updateStorage("access_token", this.state.access_token);
    }
  }


  async loginApi() {
    try {
      const email_descriptografado = await EncryptedStorage.getItem("email");
      const senha_descriptografada = await EncryptedStorage.getItem("senha");
      const client_id_descriptografado = await EncryptedStorage.getItem("client_id");
      const client_secret_descriptografado = await EncryptedStorage.getItem("client_secret");

      if (email_descriptografado !== undefined && senha_descriptografada !== undefined && client_id_descriptografado !== undefined && client_secret_descriptografado !== undefined) {
        const requestBody = {
          client_id: client_id_descriptografado,
          client_secret: client_secret_descriptografado,
          username: email_descriptografado,
          password: senha_descriptografada,
          grant_type: "password"
        };

        // Convertendo o corpo da requisição para uma string JSON
        const requestBodyString = JSON.stringify(requestBody);

        // Exibindo o corpo da requisição em um alerta
        Alert.alert('Corpo da Requisição', requestBodyString);

        const response = await fetch('https://api.teste.hubsoft.com.br/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBodyString,
        });

        const json = await response.json();
        if (response.ok) {
          // Sucesso
          this.setState({ access_token: json.access_token });
        } else {
          // Falha
          //Alert.alert("Falha", "Mensagem de erro: " + JSON.stringify(json));
        }
      } else {
        // Falha por falta de dados descriptografados
        Alert.alert("Falha", "Não foi possível recuperar todas as credenciais necessárias.");
      }
    } catch (error) {
      // Tratamento de erro geral
      Alert.alert("Falha", "Ocorreu um erro: " + error.message);
    }
  }

  validarLogin() {
    const { email, senha, client_id, client_secret } = this.state;
    if (!email || !senha || !client_id || !client_secret) {
      this.setState({
        emailBorderColor: !email ? 'red' : '#1f1f1f',
        senhaBorderColor: !senha ? 'red' : '#1f1f1f',
        clientIdBorderColor: !client_id ? 'red' : '#1f1f1f',
        clientSecretBorderColor: !client_secret ? 'red' : '#1f1f1f',
      });
      Alert.alert("Falha", "Preencha todos os campos para continuar.");
    } else {
      this.loginApi();
      this.setState({
        emailBorderColor: !email ? 'red' : '#1f1f1f',
        senhaBorderColor: !senha ? 'red' : '#1f1f1f',
        clientIdBorderColor: !client_id ? 'red' : '#1f1f1f',
        clientSecretBorderColor: !client_secret ? 'red' : '#1f1f1f',
      });
    }
  };



  render() {

    const {
      emailBorderColor,
      senhaBorderColor,
      clientIdBorderColor,
      clientSecretBorderColor,
    } = this.state;

    return (

      <View style={styles.container}>

        <View style={styles.container}>

          <ScrollView>

            <Image source={require('./src/img/hubsoft.png')} style={styles.img}></Image>

            <View style={styles.divisoriaImg} />

            <Text style={styles.titulo}>Realize seu Login</Text>

            {this.state.email && <Text style={styles.label}>Usuário</Text>}
            <TextInput
              style={[styles.input, { borderBottomColor: emailBorderColor }]}
              underlineColorAndroid="transparent"
              placeholder='Digite seu email'
              placeholderTextColor="rgba(31, 31, 31, 0.5)"
              value={this.state.email}
              onChangeText={(email) => this.setState({ email: email })}
              textContentType='emailAddress'
            />

            <View style={styles.divisoria} />

            {this.state.senha && <Text style={styles.label}>Senha</Text>}
            <TextInput
              style={[styles.input, { borderBottomColor: senhaBorderColor }]}
              underlineColorAndroid="transparent"
              placeholder='Digite sua senha'
              placeholderTextColor="rgba(31, 31, 31, 0.5)"
              value={this.state.senha}
              onChangeText={(senha) => this.setState({ senha: senha })}
              textContentType="password"
              secureTextEntry={true}
            />

            <View style={styles.divisoria} />

            {this.state.client_id && <Text style={styles.label}>Client ID</Text>}
            <TextInput
              style={[styles.input, { borderBottomColor: clientIdBorderColor }]}

              underlineColorAndroid="transparent"
              placeholder='Digite seu Client ID'
              placeholderTextColor="rgba(31, 31, 31, 0.5)"
              value={this.state.client_id}
              onChangeText={(client_id) => this.setState({ client_id: client_id })}
            />

            <View style={styles.divisoria} />

            {this.state.client_secret && <Text style={styles.label}>Client Secret</Text>}
            <TextInput
              style={[styles.input, { borderBottomColor: clientSecretBorderColor }]}
              underlineColorAndroid="transparent"
              placeholder='Digite seu Client Secret'
              placeholderTextColor="rgba(31, 31, 31, 0.5)"
              value={this.state.client_secret}
              onChangeText={(client_secret) => this.setState({ client_secret: client_secret })}
            />

          </ScrollView>
        </View>

        {!this.state.isKeyboardVisible && (
          <View style={styles.containerBotaoFinish}>


            <TouchableOpacity
              onPress={() => this.validarLogin()}
              style={styles.botaoFinish}
            >
              <Text style={styles.botaoTextoFinish}>Realizar Login</Text>
            </TouchableOpacity>


          </View>
        )}

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
  containerBotaoFinish: {
    flex: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    paddingLeft: screenWidth / 4.6,
    //paddingTop: 50
  },
  picker: {
    padding: 1,
    width: 250,
    height: 90,
    alignSelf: 'center',

  },
  img: {
    width: 150,
    height: 150,
    marginTop: 20,
    alignSelf: 'center',
  },
  input: {
    margin: 25,
    height: 45,
    marginHorizontal: 10,
    fontSize: 20,
    padding: 10,
    paddingHorizontal: 20,
    color: '#1f1f1f',
    width: screenWidth * 0.8,
    alignSelf: 'center',
    textAlign: 'center',
    borderBottomColor: '#1f1f1f',
    borderBottomWidth: 1
  },
  inputContainer: {
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputNumerico: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    fontSize: 20,
    borderRadius: 12,
    color: '#eee',
    width: screenWidth * 0.45,
    textAlign: 'center',
  },
  botaoPequeno: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
    borderColor: '#eee',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  inputSlider: {
    width: screenWidth * 0.6,
    alignSelf: 'center',
    textAlign: 'center',
  },
  texto: {
    textAlign: 'center',
    fontSize: 18,
    paddingBottom: 20,
    paddingTop: 20,
    color: '#1f1f1f',
    fontWeight: 'bold'
  },
  textoMaior: {
    textAlign: 'center',
    fontSize: 24,
    paddingTop: 20,
    color: '#eee',
    fontWeight: 'bold'
  },
  textoUltimoTempo: {
    textAlign: 'center',
    fontSize: 18,
    paddingTop: 2,
    color: '#eee',
    fontWeight: 'bold'
  },
  botao: {
    margin: 30,
    width: buttonWidth,
    height: buttonWidth,
    backgroundColor: 'transparent',
    borderColor: '#eee',
    borderWidth: 1,
    color: '#eee',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoFinish: {
    width: "60%",
    height: "50%",
    backgroundColor: 'transparent',
    borderColor: '#0475e8',
    borderWidth: 2,
    color: '#0475e8',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoTextoFinish: {
    color: '#0475e8',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20
  },
  botaoTexto: {
    color: '#eee',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20
  },
  switch: {
    alignSelf: 'center',
  },
  textoSwitch: {
    fontSize: 18,
    paddingBottom: 20,
    paddingTop: 20,
    color: '#eee',
    paddingLeft: 10,
    fontWeight: 'bold'
  },
  box1: {
    backgroundColor: 'red',
    height: 250,
    width: 150
  },
  box2: {
    backgroundColor: 'yellow',
    height: 250,
    width: 150
  },
  box3: {
    backgroundColor: 'green',
    height: 250,
    width: 150
  },
  box4: {
    backgroundColor: 'blue',
    height: 250,
    width: 150
  },

  titulo: {
    color: '#0049fa',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },
  pizzas: {
    marginTop: 15,
    fontSize: 24,
    textAlign: 'center'
  },

  pickerWrapper: {
    marginHorizontal: '20%',
    marginVertical: 30,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 12,
  },
  divisoria: {
    height: 1,
    backgroundColor: 'rgba(0, 31, 31, 0.05)',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 2,
  },
  divisoriaImg: {
    height: 1,
    backgroundColor: 'rgba(0, 31, 31, 0.1)',
    width: '70%',
    alignSelf: 'center',
    marginVertical: 2,
  },
  sliderContainer: {
    margin: 25,
  },
  label: {
    marginTop: 20,
    marginBottom: -25,
    marginLeft: 30,
    fontSize: 16,
    color: '#1f1f1f',
  },

});


/*
flexDirection: 'column',
justifyContent:'center'
*/