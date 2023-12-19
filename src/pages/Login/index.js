import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../Home';

export default function Login() {

    const navigation = useNavigation();
    const [credentials, setCredentials] = useState({
        email: '',
        senha: '',
        client_id: '',
        client_secret: '',
        access_token: '',
        isKeyboardVisible: false,
    });

    const [borderColors, setBorderColors] = useState({
        emailBorderColor: '#1f1f1f',
        senhaBorderColor: '#1f1f1f',
        clientIdBorderColor: '#1f1f1f',
        clientSecretBorderColor: '#1f1f1f',
    });


    const updateField = (field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        setBorderColors(prev => ({ ...prev, [`${field}BorderColor`]: '#1f1f1f' }));
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const email = await EncryptedStorage.getItem("email") || '';
                const senha = await EncryptedStorage.getItem("senha") || '';
                const client_id = await EncryptedStorage.getItem("client_id") || '';
                const client_secret = await EncryptedStorage.getItem("client_secret") || '';
                const access_token = await EncryptedStorage.getItem("access_token") || '';

                setCredentials({
                    email: email.trim(),
                    senha: senha.trim(),
                    client_id: client_id.trim(),
                    client_secret: client_secret.trim(),
                    access_token: access_token.trim(),
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


    useEffect(() => {

        const updateStorage = async (key, value) => {
            if (value !== undefined && value !== '') {
                try {
                    await EncryptedStorage.setItem(key, value.trim());
                } catch (error) {
                    console.error(`Erro ao salvar ${key}:`, error);
                }
            }
        };

        updateStorage("email", credentials.email);
        updateStorage("senha", credentials.senha);
        updateStorage("client_id", credentials.client_id);
        updateStorage("client_secret", credentials.client_secret);
        updateStorage("access_token", credentials.access_token);
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
                    Alert.alert("Falha", "Mensagem de erro: " + JSON.stringify(json));
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
            setBorderColors({ // Atualiza o estado de borderColors
                emailBorderColor: !email ? 'red' : '#1f1f1f',
                senhaBorderColor: !senha ? 'red' : '#1f1f1f',
                clientIdBorderColor: !client_id ? 'red' : '#1f1f1f',
                clientSecretBorderColor: !client_secret ? 'red' : '#1f1f1f',
            });
            Alert.alert("Falha", "Preencha todos os campos para continuar.");
        } else {
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


    return (
        <View style={styles.container}>
            <ScrollView>
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
        flex: 85,
        backgroundColor: '#eee',

    },
    containerBotaoFinish: {
        flex: 15,
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

});


