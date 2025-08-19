import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BillSummaryCard } from './components/BillSummaryCard';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { QuickActions } from './components/QuickActions';
import { PeriodSelector } from './components/PeriodSelector';
import { apiClient } from '../../api/client';

// Navigation types
type RootStackParamList = {
    UserSelection: undefined;
    Dashboard: { userId: number; userName: string };
    WhatIfSimulator: { userId: number; period: string };
    Anomalies: { userId: number; period: string };
    Checkout: { userId: number; period: string; scenario: any; result: any };
    BillDetail: { userId: number; period: string };
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

interface BillData {
    bill: {
        bill_id: string;
        total_amount: number;
        subtotal: number;
        taxes: number;
        currency: string;
        period_start: string;
        period_end: string;
    };
    items: Array<{
        item_id: string;
        category: string;
        amount: number;
        description: string;
    }>;
}

interface Anomaly {
    category: string;
    delta: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
}

const DashboardScreen = () => {
    const navigation = useNavigation<DashboardScreenNavigationProp>();
    const route = useRoute<DashboardScreenRouteProp>();
    const { userId, userName } = route.params;

    const [billData, setBillData] = useState<BillData | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('2025-07');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillData();
        fetchAnomalies();
    }, [userId, selectedPeriod]);

    const fetchBillData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/bills/${userId}?period=${selectedPeriod}`);
            setBillData(response.data.data);
        } catch (error) {
            console.error('Bill fetch error:', error);
            Alert.alert('Hata', 'Fatura bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnomalies = async () => {
        try {
            const response = await apiClient.post('/anomalies', {
                user_id: userId,
                period: selectedPeriod
            });
            setAnomalies(response.data.data.anomalies);
        } catch (error) {
            console.error('Anomalies fetch error:', error);
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
        navigation.navigate('WhatIfSimulator', { userId, period: selectedPeriod });
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
