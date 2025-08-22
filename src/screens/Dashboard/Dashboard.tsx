import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BillSummaryCard } from './components/BillSummaryCard';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { QuickActions } from './components/QuickActions';
import { PeriodSelector } from './components/PeriodSelector';
import { apiService, BillData, AnomalyAnalysis } from '../../api/services';

// Navigation types
type RootStackParamList = {
    UserSelection: undefined;
    Dashboard: { userId: number; userName: string };
    WhatIfSimulator: { userId: number; userName: string; period: string };
    Anomalies: { userId: number; period: string };
    Checkout: { userId: number; userName: string; period: string; scenario: any; result: any };
    BillDetail: { userId: number; period: string };
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
    const navigation = useNavigation<DashboardScreenNavigationProp>();
    const route = useRoute<DashboardScreenRouteProp>();
    const { userId, userName } = route.params;

    const [billData, setBillData] = useState<BillData | null>(null);
    const [anomalies, setAnomalies] = useState<AnomalyAnalysis | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('2025-07');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBillData();
        fetchAnomalies();
    }, [userId, selectedPeriod]);

    // Geri tuşu handling'i
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // UserSelection'a dön
                navigation.navigate('UserSelection');
                return true; // Back press handled
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [navigation])
    );

    const fetchBillData = async () => {
        try {
            setLoading(true);
            setError(null);
            const billDataResponse = await apiService.getBill(userId, selectedPeriod);
            setBillData(billDataResponse);
        } catch (error: any) {
            console.error('Bill fetch error:', error);

            // Backend'den gelen hata mesajını al
            let errorMessage = 'Fatura bilgileri yüklenemedi';

            if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // 404 hatası için özel mesaj
            if (error.response?.status === 404) {
                errorMessage = `${selectedPeriod} dönemi için fatura bulunamadı. Lütfen farklı bir dönem seçin.`;
            }

            setError(errorMessage);
            setBillData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnomalies = async () => {
        try {
            const anomaliesResponse = await apiService.detectAnomalies(userId, selectedPeriod);
            setAnomalies(anomaliesResponse);
        } catch (error: any) {
            console.error('Anomalies fetch error:', error);
            // Don't show alert for anomalies as they're not critical
        }
    };

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
    };

    const handleViewBillDetail = () => {
        navigation.navigate('BillDetail', { userId, period: selectedPeriod });
    };

    const handleViewAnomalies = () => {
        navigation.navigate('Anomalies', { userId, period: selectedPeriod });
    };

    const handleWhatIfSimulation = () => {
        navigation.navigate('WhatIfSimulator', { userId, userName, period: selectedPeriod });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#6b7280' }}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#2563eb', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 24 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Merhaba, {userName}</Text>
                <Text style={{ color: '#bfdbfe', marginTop: 4 }}>Fatura Asistanı</Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Period Selector */}
                <PeriodSelector
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={handlePeriodChange}
                    userId={userId}
                />

                {/* Bill Summary */}
                {billData && (
                    <BillSummaryCard
                        bill={billData.bill}
                        anomalies={anomalies}
                        onViewDetail={handleViewBillDetail}
                        onViewAnomalies={handleViewAnomalies}
                    />
                )}

                {/* Error State */}
                {error && (
                    <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 12 }}>
                                Fatura Yüklenemedi
                            </Text>
                            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                                {error}
                            </Text>

                            <View style={{ backgroundColor: '#fef3c7', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                                <Text style={{ fontSize: 14, color: '#92400e', textAlign: 'center' }}>
                                    💡 Öneriler:
                                </Text>
                                <Text style={{ fontSize: 12, color: '#92400e', textAlign: 'center', marginTop: 4 }}>
                                    • Farklı bir dönem seçmeyi deneyin{'\n'}
                                    • Sayfayı yenilemeyi deneyin{'\n'}
                                    • Sistem yöneticisi ile iletişime geçin
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={{ backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                                onPress={() => {
                                    setError(null);
                                    fetchBillData();
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>Tekrar Dene</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Category Breakdown */}
                {billData && (
                    <CategoryBreakdown items={billData.items} />
                )}

                {/* Quick Actions */}
                <QuickActions
                    onWhatIf={handleWhatIfSimulation}
                    onBillDetail={handleViewBillDetail}
                    onAnomalies={handleViewAnomalies}
                />
            </ScrollView>
        </View>
    );
};

export default DashboardScreen;
