import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, Keyboard, Switch } from 'react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';

import Home from '../Home';

export default function Login() {

    const navigation = useNavigation();
    const [credentials, setCredentials] = useState({
        email: '',
        senha: '',
        client_id: '',
        client_secret: '',
        access_token: '',
        manter_login: '',
        isKeyboardVisible: false,
    });

    const [borderColors, setBorderColors] = useState({
        emailBorderColor: '#1f1f1f',
        senhaBorderColor: '#1f1f1f',
        clientIdBorderColor: '#1f1f1f',
        clientSecretBorderColor: '#1f1f1f',
    });


    const updateField = async (field, value) => {
        setCredentials(prev => {
          const newCredentials = { ...prev, [field]: value };
          updateStorage(field, value); // Persistir a mudança imediatamente
          return newCredentials;
        });
      };
      

    useEffect(() => {
        const loadData = async () => {
            try {
                const email = await EncryptedStorage.getItem("email") || '';
                const senha = await EncryptedStorage.getItem("senha") || '';
                const client_id = await EncryptedStorage.getItem("client_id") || '';
                const client_secret = await EncryptedStorage.getItem("client_secret") || '';
                const access_token = await EncryptedStorage.getItem("access_token") || '';
                
                const manter_login = await AsyncStorage.getItem("manter_login");
                const manterLoginBool = manter_login === 'true';
        
                setCredentials({
                    email: email.trim(),
                    senha: senha.trim(),
                    client_id: client_id.trim(),
                    client_secret: client_secret.trim(),
                    access_token: access_token.trim(),
                    manter_login: manterLoginBool,
                    isKeyboardVisible: false,
                });
            } catch (error) {
                console.log(error);
            }
        };        

        loadData();


        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setCredentials(s => ({ ...s, isKeyboardVisible: true }))
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setCredentials(s => ({ ...s, isKeyboardVisible: false }))
        );


        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const updateStorage = async (key, value) => {
        let stringValue = '';
        if (typeof value === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else {
            stringValue = value.trim();
        }

        if (stringValue !== undefined && stringValue !== '') {
            try {
                if (key != 'manter_login'){
                    await EncryptedStorage.setItem(key, stringValue);
                } else {
                    await AsyncStorage.setItem(key, stringValue);
                }
            } catch (error) {
                console.error(`Erro ao salvar ${key}:`, error);
            }
        }
    };


    useEffect(() => {
        Object.entries(credentials).forEach(([key, value]) => {
            updateStorage(key, value);
        });
    }, [credentials]);



    const loginApi = async () => {
        try {
            const email_descriptografado = await EncryptedStorage.getItem("email");
            const senha_descriptografada = await EncryptedStorage.getItem("senha");
            const client_id_descriptografado = await EncryptedStorage.getItem("client_id");
            const client_secret_descriptografado = await EncryptedStorage.getItem("client_secret");

            if (email_descriptografado && senha_descriptografada && client_id_descriptografado && client_secret_descriptografado) {
                const requestBody = {
                    client_id: client_id_descriptografado,
                    client_secret: client_secret_descriptografado,
                    username: email_descriptografado,
                    password: senha_descriptografada,
                    grant_type: "password"
                };

                const requestBodyString = JSON.stringify(requestBody);

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
                    setCredentials(currentCredentials => ({
                        ...currentCredentials,
                        access_token: json.access_token
                    }));
                    redirectHome();
                } else {
                    // Falha
                    Alert.alert("Falha (" + response.status + ")", "Mensagem de erro:\n" + json.msg);
                }
            } else {
                Alert.alert("Falha", "Não foi possível recuperar todas as credenciais necessárias.");
            }
        } catch (error) {
            Alert.alert("Falha", "Ocorreu um erro: " + error.message);
        }
    }


    const validarLogin = async () => {
        const { email, senha, client_id, client_secret } = credentials;
        if (!email || !senha || !client_id || !client_secret) {
            setBorderColors({
                emailBorderColor: !email ? 'red' : '#1f1f1f',
                senhaBorderColor: !senha ? 'red' : '#1f1f1f',
                clientIdBorderColor: !client_id ? 'red' : '#1f1f1f',
                clientSecretBorderColor: !client_secret ? 'red' : '#1f1f1f',
            });
            Alert.alert("Falha", "Preencha todos os campos para continuar.");
        } else {
            setBorderColors({
                emailBorderColor: !email ? 'red' : '#1f1f1f',
                senhaBorderColor: !senha ? 'red' : '#1f1f1f',
                clientIdBorderColor: !client_id ? 'red' : '#1f1f1f',
                clientSecretBorderColor: !client_secret ? 'red' : '#1f1f1f',
            });
            loginApi();
        }
    };


    const redirectHome = async () => {
        navigation.navigate('Home');
    }

    const inputStyle = {
        margin: 25,
        height: 45,
        marginHorizontal: 10,
        fontSize: 20,
        padding: 10,
        paddingHorizontal: 20,
        color: '#1f1f1f',
        alignSelf: 'center',
        textAlign: 'center',
        borderBottomColor: '#1f1f1f',
        borderBottomWidth: 1,
        width: Dimensions.get('window').width * 0.8,
    };

    const verificarTokenEBuscarAtendimentos = async () => {
        const token = await EncryptedStorage.getItem("access_token");

        if (!token) {
            await tentarAtualizarToken();
            if (!token) {
                return;
            }
        }

        const url = 'https://teste.hubsoft.com.br/api/v1/integracao/cliente/atendimento';
        const params = new URLSearchParams({
            busca: 'cpf_cnpj',
            termo_busca: '14653839646',
            limit: '1',
            apenas_pendente: 'nao',
            order_by: 'data_cadastro',
            order_type: 'asc',
        });

        try {
            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                navigation.navigate('Home');
            } else if (response.status === 401) {
                await tentarAtualizarToken();
            } else {
                navigation.navigate('Login');
                Alert.alert('Falha no acesso', 'Retornando a tela de Login\n' + response.status);
            }
        } catch (error) {
            console.error(error);
            navigation.navigate('Login');
        }
    };


    const tentarAtualizarToken = async () => {
        try {
            await loginApi();
            const token = await EncryptedStorage.getItem("access_token");


            if (token.length > 1) {
                Alert.alert('Novo token gerado', 'Ok');

                verificarTokenEBuscarAtendimentos();
            } else {
                Alert.alert('Falha ao atualizar token', 'Retornando a tela de Login');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error(error);
            navigation.navigate('Login');
        }
    };

    useEffect(() => {
        if (credentials.manter_login) {
            verificarTokenEBuscarAtendimentos();
        }
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container}>
                <Image source={require('../../img/hubsoft.png')} style={styles.img} />
                <View style={styles.divisoriaImg} />
                <Text style={styles.titulo}>Realize seu Login</Text>

                <Text style={styles.label}>Usuário</Text>
                <TextInput
                    style={[inputStyle, { borderBottomColor: borderColors.emailBorderColor }]}
                    underlineColorAndroid="transparent"
                    placeholder='Digite seu email'
                    placeholderTextColor="rgba(31, 31, 31, 0.5)"
                    value={credentials.email}
                    onChangeText={(text) => updateField('email', text)}
                    textContentType='emailAddress'
                    keyboardType='email-address'
                />

                <View style={styles.divisoria} />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={[inputStyle, { borderBottomColor: borderColors.senhaBorderColor }]}
                    underlineColorAndroid="transparent"
                    placeholder='Digite sua senha'
                    placeholderTextColor="rgba(31, 31, 31, 0.5)"
                    value={credentials.senha}
                    onChangeText={(text) => updateField('senha', text)}
                    textContentType="password"
                    secureTextEntry={true}
                />

                <View style={styles.divisoria} />

                <Text style={styles.label}>Client ID</Text>
                <TextInput
                    style={[inputStyle, { borderBottomColor: borderColors.clientIdBorderColor }]}
                    underlineColorAndroid="transparent"
                    placeholder='Digite seu Client ID'
                    placeholderTextColor="rgba(31, 31, 31, 0.5)"
                    value={credentials.client_id}
                    onChangeText={(text) => updateField('client_id', text)}
                />

                <View style={styles.divisoria} />

                <Text style={styles.label}>Client Secret</Text>
                <TextInput
                    style={[inputStyle, { borderBottomColor: borderColors.clientSecretBorderColor }]}
                    underlineColorAndroid="transparent"
                    placeholder='Digite seu Client Secret'
                    placeholderTextColor="rgba(31, 31, 31, 0.5)"
                    value={credentials.client_secret}
                    onChangeText={(text) => updateField('client_secret', text)}
                />

                <View style={[styles.switchContainer, { transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }]}>

                    <Switch
                        value={credentials.manter_login}
                        onValueChange={(value) => updateField('manter_login', value)}
                        thumbColor={credentials.manter_login ? "#eee" : "#767577"}
                        trackColor={{ false: "rgba(0, 0, 0, 0.2)", true: "#0475e8" }}
                        style={styles.switch}
                    />
                    
                    <Text style={styles.textoSwitch}>
                        Manter Login {credentials.manter_login ? 'true' : 'false'}
                    </Text>

                </View>

            </ScrollView>

            {!credentials.isKeyboardVisible && (
                <View style={styles.containerBotaoFinish}>
                    <TouchableOpacity
                        onPress={validarLogin}
                        style={styles.botaoFinish}
                    >
                        <Text style={styles.botaoTextoFinish}>Realizar Login</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',

    },
    containerBotaoFinish: {
        height: '15%',
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    img: {
        width: 150,
        height: 150,
        marginTop: 20,
        alignSelf: 'center',
    },
    texto: {
        textAlign: 'center',
        fontSize: 18,
        paddingBottom: 20,
        paddingTop: 20,
        color: '#1f1f1f',
        fontWeight: 'bold'
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
    titulo: {
        color: '#0049fa',
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 15,
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
    label: {
        marginTop: 20,
        marginBottom: -25,
        marginLeft: 30,
        fontSize: 16,
        color: '#1f1f1f',
    },
    switchContainer: {
        flexDirection: 'row',
        paddingLeft: '15%',
    },
    switch: {
        alignSelf: 'center',
    },
    textoSwitch: {
        fontSize: 18,
        paddingBottom: 20,
        paddingTop: 20,
        color: '#1f1f1f',
        paddingLeft: 10,
    },

});


