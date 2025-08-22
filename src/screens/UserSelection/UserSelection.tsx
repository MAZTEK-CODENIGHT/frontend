import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService, User } from '../../api/services';

// Navigation types
type RootStackParamList = {
    UserSelection: undefined;
    Dashboard: { userId: number; userName: string };
    WhatIfSimulator: { userId: number; period: string };
    Anomalies: { userId: number; period: string };
    Checkout: { userId: number; period: string; scenario: any; result: any };
};

type UserSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserSelection'>;

const UserSelectionScreen = () => {
    const navigation = useNavigation<UserSelectionScreenNavigationProp>();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersData = await apiService.getAllUsers();
            setUsers(usersData);
        } catch (error: any) {
            console.error('Users fetch error:', error);
            const errorMessage = error.response?.data?.message || 'Kullanıcı listesi yüklenemedi';
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user: User) => {
        navigation.navigate('Dashboard', {
            userId: user.user_id,
            userName: user.name
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ fontSize: 18, color: '#6b7280', marginTop: 16 }}>Kullanıcılar yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#2563eb', paddingTop: 48, paddingBottom: 32, paddingHorizontal: 24 }}>
                <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>
                    Fatura Asistanı
                </Text>
                <Text style={{ color: '#bfdbfe', fontSize: 18, textAlign: 'center', marginTop: 8 }}>
                    Şeffaf Fatura Açıklayıcı & Anomali Avcısı
                </Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                        Kullanıcınızı Seçin
                    </Text>
                    <Text style={{ color: '#6b7280' }}>
                        Fatura analizi yapmak istediğiniz kullanıcıyı seçin
                    </Text>
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {users.map((user) => (
                        <TouchableOpacity
                            key={user.user_id}
                            style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#f3f4f6' }}
                            onPress={() => handleUserSelect(user)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                                        {user.name}
                                    </Text>
                                    <Text style={{ color: '#6b7280', marginBottom: 8 }}>
                                        {user.msisdn}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ backgroundColor: '#dbeafe', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 }}>
                                            <Text style={{ color: '#1e40af', fontSize: 14, fontWeight: '500' }}>
                                                {user.type === 'postpaid' ? 'Postpaid' : 'Prepaid'}
                                            </Text>
                                        </View>
                                        {user.current_plan && (
                                            <Text style={{ color: '#2563eb', fontWeight: '500' }}>
                                                {user.current_plan.plan_name}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                    {user.current_plan ? (
                                        <>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb' }}>
                                                ₺{user.current_plan.monthly_price}
                                            </Text>
                                            <Text style={{ color: '#6b7280', fontSize: 14 }}>Aylık</Text>
                                        </>
                                    ) : (
                                        <Text style={{ color: '#6b7280', fontSize: 14 }}>Plan yok</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Footer Info */}
                <View style={{ backgroundColor: '#dbeafe', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                    <Text style={{ color: '#1e40af', fontSize: 14, textAlign: 'center' }}>
                        💡 Bu uygulama, faturalarınızı analiz eder, anomalileri tespit eder ve
                        alternatif planları simüle eder.
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default UserSelectionScreen;
