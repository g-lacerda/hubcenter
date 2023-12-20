import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, ScrollView, FlatList, Keyboard, Switch, Button, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function Atendimentos() {
  const navigation = useNavigation();

  const redirectPage = async (page) => {
    navigation.navigate(page);
  }

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));

  const [isStartPicker, setIsStartPicker] = useState(false); // Estado para saber qual DatePicker está ativo

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || (isStartPicker ? startDate : endDate);
    setShow(Platform.OS === 'ios');
    if (isStartPicker) {
      setStartDate(currentDate);
    } else {
      setEndDate(currentDate);
    }
  };

  const showDatepicker = (isStart) => {
    setShow(true);
    setIsStartPicker(isStart);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const [itemsPerPage, setItemsPerPage] = useState('15');
  const onItemsPerPageChange = (value) => {
    if (value) {
      let num = parseInt(value.replace(/[^0-9]/g, ''), 10);
      if (num >= 1 && num <= 100) {
        setItemsPerPage(String(num)); // Atualiza o estado se estiver dentro do limite
      } else if (value === '') {
        setItemsPerPage(''); // Permite campo vazio para limpar
      } else {
        setItemsPerPage(num > 100 ? '100' : '1'); // Ajusta para os limites máximos ou mínimos
      }
    }
  };

  const [pageRequest, setPageRequest] = useState('1');
  const onPageRequest = (pageRequest) => {
    if (pageRequest > 0 && pageRequest <= last_page) {
      setPageRequest(String(pageRequest));
    }
  };

  const [atendimentos, setAtendimentos] = useState([]);
  const [last_page, setLastPage] = useState([]);
  const [current_page, setCurrentPage] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatAPIDate = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };


  const fetchAtendimentos = async () => {

    setLoading(true);
    setAtendimentos(null);

    const token = await EncryptedStorage.getItem("access_token");

    const formattedStartDate = formatAPIDate(startDate);
    const formattedEndDate = formatAPIDate(endDate);

    const page = pageRequest;
    console.log('page: ' + page);

    const url = `https://api.teste.hubsoft.com.br/api/v1/integracao/atendimento/paginado/${itemsPerPage}?pagina=${page}&data_inicio=${formattedStartDate}&data_fim=${formattedEndDate}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (response.ok) {
          setAtendimentos(json.atendimentos.data);
          setLastPage(json.atendimentos.last_page);
          setCurrentPage(json.atendimentos.current_page);

          console.log('cp ' + current_page)
        } else {
          throw new Error(`Erro ${response.status}: ${text}`);
        }
      } catch (error) {
        throw new Error(`Falha ao analisar a resposta como JSON: ${text}`);
      }
    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  return (
    <View style={styles.container}>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.homeButton} onPress={() => redirectPage('Home')}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="chevron-back" size={30} color="#eee" />
          </View>
        </TouchableOpacity>

        <Text style={styles.titulo}>Atendimentos e OS</Text>
      </View>

      <View style={styles.pageCountContainer}>
        <Text style={styles.pageCount}>Página {current_page} de {last_page}</Text>
      </View>

      <View style={styles.itensPerPage}>
        <Text style={styles.label}>Quantidade de Itens por página</Text>
        <TextInput
          style={styles.inputNumerico}
          underlineColorAndroid="transparent"
          placeholder='Itens por página'
          placeholderTextColor="rgba(4, 117, 232, 0.3)"
          value={itemsPerPage}
          onChangeText={onItemsPerPageChange}
          keyboardType='numeric'
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.botao} onPress={() => { onPageRequest(parseInt(pageRequest) - 1) }}>
          <FontAwesome6 name="arrow-left" style={styles.icon} size={30} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Voltar
          </Text>
        </TouchableOpacity>

        <View>

          <Text style={styles.labelData}>Data Início</Text>

          <TouchableOpacity onPress={() => showDatepicker(true)} style={styles.datePickerContainer}>
            <MaterialCommunityIcons name="calendar" size={25} color="#0475e8" style={styles.calendarIcon} />
            <Text style={styles.dataTexto}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>

          <View style={styles.divisoria} />

          <Text style={styles.labelData}>Data Fim</Text>

          <TouchableOpacity onPress={() => showDatepicker(true)} style={styles.datePickerContainer}>
            <MaterialCommunityIcons name="calendar" size={25} color="#0475e8" style={styles.calendarIcon} />
            <Text style={styles.dataTexto}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>

          <View style={styles.divisoria} />

        </View>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={isStartPicker ? startDate : endDate}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
        <TouchableOpacity style={styles.botao} onPress={() => onPageRequest(parseInt(pageRequest) + 1)}>
          <FontAwesome6 name="arrow-right" style={styles.icon} size={30} color="#0475e8" />
          <Text style={styles.botaoTexto}>
            Próximo
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => fetchAtendimentos()} style={styles.searchButton}>
          <Text style={styles.dataTexto}>
            Carregar
          </Text>
        </TouchableOpacity>
      </View>

        <FlatList
          style={{ flexGrow: 1 }}
          data={atendimentos}
          keyExtractor={(item) => item.id_atendimento.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{item.protocolo}</Text>
              {/* Renderize outros detalhes do atendimento como desejar */}
            </View>
          )}
        />
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute', // Posiciona sobre toda a UI
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fundo preto com transparência
    alignItems: 'center', // Centraliza horizontalmente
    justifyContent: 'center', // Centraliza verticalmente
    zIndex: 1, // Garante que o carregamento fique acima de outros elementos
  },
  dataTexto: {
    color: '#0475e8',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderColor: '#0475e8',
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    marginVertical: 5
  },
  filtersContainer: {
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  pageCountContainer: {
    height: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  itensPerPage: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  searchContainer: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  iconButton: {
    width: 30,
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
    width: 80,
    height: 80,
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
    fontSize: 14,
  },
  titulo: {
    color: '#eee',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  icon: {
    alignSelf: 'center',
  },
  homeButton: {
    position: 'absolute',
    alignItems: 'center',
    padding: 5,
    left: 10,
    top: 10,
  },
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',

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
  itemTitle: {
    textAlign: 'center',
    fontSize: 18,
    paddingBottom: 20,
    paddingTop: 20,
    color: '#000',
    fontWeight: 'bold'
  },
  texto: {
    textAlign: 'center',
    fontSize: 18,
    paddingBottom: 2,
    color: '#0475e8',
    fontWeight: 'bold'
  },
  pageCount: {
    textAlign: 'center',
    fontSize: 18,
    color: '#0475e8',
    fontWeight: 'bold',
  },
  divisoria: {
    height: 1,
    backgroundColor: 'rgba(4, 117, 232, 0.3)',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  calendarIcon: {
    marginRight: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#0475e8',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 5
  },
  dataTexto: {
    color: '#0475e8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputNumerico: {
    borderBottomColor: '#0475e8',
    borderBottomWidth: 1,
    fontSize: 20,
    borderRadius: 12,
    color: '#0475e8',
    width: 170,
    textAlign: 'center',
  },
  label: {
    marginTop: 0,
    marginBottom: -15,
    fontSize: 16,
    color: '#0475e8',
  },
  labelData: {
    fontSize: 16,
    color: '#0475e8',
  },
  searchButton: {
    color: '#0475e8',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderColor: '#0475e8',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 30
  }

});