import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import styles from './Home.style';

import { Picker } from '@react-native-picker/picker';
import MonthPicker from 'react-native-month-year-picker';
import BillCard from '../../components/BillCard';

import apiClient from '../../api/client';
import moment from 'moment';
import 'moment/locale/tr';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    moment.locale('tr');
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersData = await apiClient.get('/users');
        // Kullanıcı verileri geldikten sonra, liste boş değilse ilk kullanıcıyı otomatik seç
        const fetchedUsers = usersData.data.data;
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setSelectedUser(fetchedUsers[0]);
        }
      } catch (error) {
        console.log('ERROR', error);
      }
    };
    fetchUsersData();
  }, []);

  const onValueChange = (event: any, newDate?: Date) => {
    setShowMonthPicker(Platform.OS === 'ios');
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const fetchInvoice = async () => {
    if (!selectedUser) {
      Alert.alert('Uyarı', 'Lütfen bir kullanıcı seçin.');
      return;
    }

    try {
      const period = moment(selectedDate).format('YYYY-MM');
      const response = await apiClient.get(
        `/bills/${selectedUser.user_id}?period=${period}`,
      );
      setInvoice(response.data.data);
      Alert.alert('Başarılı', 'Fatura getirildi.');
    } catch (error) {
      console.log('ERROR fetching invoice', error);
      Alert.alert('Hata', 'Fatura bulunamadı.');
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
              selectedValue={selectedUser?.id}
              onValueChange={(itemValue) => {
                const user = users.find(u => u.id === itemValue);
                setSelectedUser(user);
              }}
            >
              <Picker.Item label="Lütfen bir kullanıcı seçin..." value={null} color="#a9a9a9" />
              {users.map(user => (
                <Picker.Item key={user.id} label={user.name} value={user.id} />
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
              {moment(selectedDate).format('MMMM YYYY')}
            </Text>
          </TouchableOpacity>

          {showMonthPicker && (
            <MonthPicker
              onChange={onValueChange}
              value={selectedDate}
              minimumDate={new Date(2020, 0)}
              maximumDate={new Date()}
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

        {invoice && <BillCard data={invoice}/>}
      </View>
    </View>
  );
};

export default Home;