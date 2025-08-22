import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Home.style';

import { Picker } from '@react-native-picker/picker';
import MonthPicker from 'react-native-month-year-picker';
import BillCard from '../../components/BillCard';

import { apiService } from '../../api/services';
import moment from 'moment';
import 'moment/locale/tr';

const Home = () => {
  const navigation = useNavigation<any>();
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
        const usersData = await apiService.getAllUsers();
        // Kullanıcı verileri geldikten sonra, liste boş değilse ilk kullanıcıyı otomatik seç
        setUsers(usersData);
        if (usersData.length > 0) {
          setSelectedUser(usersData[0]);
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
      const response = await apiService.getBill(selectedUser.user_id, period);
      setInvoice(response);
      Alert.alert('Başarılı', 'Fatura getirildi.');
    } catch (error) {
      console.log('ERROR fetching invoice', error);
      Alert.alert('Hata', 'Fatura bulunamadı.');
    }
  };

  const navigateToWhatIf = () => {
    if (!selectedUser) {
      Alert.alert('Uyarı', 'Lütfen önce bir kullanıcı seçin.');
      return;
    }

    const period = moment(selectedDate).format('YYYY-MM');
    navigation.navigate('WhatIfSimulator', {
      userId: selectedUser.user_id,
      period: period
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {/* Müşteri Seçimi */}
        <View style={styles.inputContainer}>
          <Text style={styles.pickerTitle}>Müşteri Seçimi</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedUser?.user_id}
              onValueChange={(itemValue) => {
                const user = users.find(u => u.user_id === itemValue);
                setSelectedUser(user);
              }}
            >
              <Picker.Item label="Lütfen bir kullanıcı seçin..." value={null} color="#a9a9a9" />
              {users.map(user => (
                <Picker.Item key={user.user_id} label={user.name} value={user.user_id} />
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

        {/* Action Buttons */}
        {selectedUser && selectedDate && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.selectDateButton, styles.primaryButton]}
              onPress={fetchInvoice}
            >
              <Text style={styles.selectDateButtonText}>Faturayı Getir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectDateButton, styles.secondaryButton]}
              onPress={navigateToWhatIf}
            >
              <Text style={styles.selectDateButtonText}>What-If Simülasyonu</Text>
            </TouchableOpacity>
          </View>
        )}

        {invoice && <BillCard data={invoice} />}
      </View>
    </View>
  );
};

export default Home;