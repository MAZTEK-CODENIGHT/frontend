import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import styles from './Home.style';

import { Picker } from '@react-native-picker/picker';
import MonthPicker from 'react-native-month-year-picker';
import apiClient from '../../api/client';
import moment from 'moment';
import 'moment/locale/tr';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState<any>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null); // fatura verisi

  useEffect(() => {
    moment.locale('tr'); // Türkçe ay isimleri
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersData = await apiClient.get('/users');
        setUsers(usersData.data.data);
      } catch (error) {
        console.log('ERROR', error);
      }
    };
    fetchUsersData();
  }, []);

  // Month Picker callback
  const onValueChange = (event: any, newDate?: Date) => {
    setShowMonthPicker(Platform.OS === 'ios'); // iOS'ta picker ekranda kalır
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  // Fatura getirme fonksiyonu
  const fetchInvoice = async () => {
    if (!selectedUser) {
      Alert.alert('Uyarı', 'Lütfen bir kullanıcı seçin.');
      return;
    }

    try {
      const period = moment(selectedDate).format('YYYY-MM'); // period formatı

      const response = await apiClient.get(
        `/bills/${selectedUser.user_id}?period=${period}`
      );

      setInvoice(response.data); // API response set
      Alert.alert('Başarılı', 'Fatura getirildi.');
    } catch (error) {
      console.log('ERROR fetching invoice', error);
      Alert.alert('Hata', 'Fatura getirilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>

        {/* Müşteri Seçimi */}
        <View style={styles.inputContainer}>
          <Text style={styles.pickerTitle}>Müşteri Seçimi</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedUser}
              onValueChange={itemValue => setSelectedUser(itemValue)}
            >
              {users.map(user => (
                <Picker.Item key={user.id} label={user.name} value={user} />
              ))}
            </Picker>
          </View>
          {selectedUser && (
            <Text style={styles.phoneNumber}>
              Tel: +90{selectedUser.msisdn}
            </Text>
          )}
        </View>

        {/* Fatura Periyodu Seçimi */}
        <View style={styles.inputContainer}>
          <Text style={styles.pickerTitle}>Fatura Periyodu Seçimi</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowMonthPicker(true)}
            style={styles.selectDateButton}
          >
            <Text style={styles.selectDateButtonText}>
              {selectedDate
                ? moment(selectedDate).format('MMMM YYYY')
                : 'Seçim Yap'}
            </Text>
          </TouchableOpacity>

          {showMonthPicker && (
            <MonthPicker
              onChange={onValueChange}
              value={selectedDate}
              minimumDate={new Date(2020, 0)}
              maximumDate={new Date(2030, 11)}
              locale="tr"
            />
          )}
        </View>

        {/* Faturayı Getir Butonu */}
        {selectedUser && selectedDate && (
          <TouchableOpacity
            style={styles.selectDateButton}
            onPress={fetchInvoice}
          >
            <Text style={styles.selectDateButtonText}>Faturayı Getir</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

export default Home;
