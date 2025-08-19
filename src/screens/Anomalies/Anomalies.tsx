import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { AnomalyCard } from './components/AnomalyCard';
import { RiskScoreCard } from './components/RiskScoreCard';

interface Anomaly {
    category: string;
    current_amount: number;
    historical_average: number;
    delta: string;
    severity: 'high' | 'medium' | 'low';
    reason: string;
    suggested_action: string;
    first_occurrence: boolean;
}

interface AnomaliesData {
    anomalies: Anomaly[];
    total_anomalies: number;
    risk_score: number;
}

const AnomaliesScreen = () => {
    const route = useRoute();
    const { userId, period } = route.params as { userId: number; period: string };

    const [anomaliesData, setAnomaliesData] = useState<AnomaliesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnomalies();
    }, [userId, period]);

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const response = await apiClient.post('/anomalies', {
                user_id: userId,
                period: period
            });
            setAnomaliesData(response.data.data);
        } catch (error) {
            console.error('Anomalies fetch error:', error);
            Alert.alert('Hata', 'Anomali verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (category: string) => {
        const names: Record<string, string> = {
            data: 'Veri Kullanımı',
            voice: 'Ses Aramaları',
            sms: 'SMS',
            roaming: 'Yurt Dışı Kullanım',
            premium_sms: 'Premium SMS',
            vas: 'VAS Servisleri',
            one_off: 'Tek Seferlik Ücretler',
            discount: 'İndirimler',
            tax: 'Vergiler'
        };
        return names[category] || category;
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            data: '📱',
            voice: '📞',
            sms: '💬',
            roaming: '✈️',
            premium_sms: '🎮',
            vas: '🎵',
            one_off: '💰',
            discount: '🎉',
            tax: '🏛️'
        };
        return icons[category] || '❓';
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text className="text-lg text-gray-600 mt-4">Anomaliler analiz ediliyor...</Text>
            </View>
        );
    }

    if (!anomaliesData || anomaliesData.anomalies.length === 0) {
        return (
            <View className="flex-1 bg-gray-50">
                <View className="bg-orange-500 pt-12 pb-6 px-6">
                    <Text className="text-white text-2xl font-bold">Anomali Analizi</Text>
                    <Text className="text-orange-100 mt-1">Fatura güvenlik kontrolü</Text>
                </View>

                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-6xl mb-4">✅</Text>
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Anomali Tespit Edilmedi
                    </Text>
                    <Text className="text-gray-600 text-center text-lg">
                        Bu dönem için fatura kalemlerinde şüpheli bir durum bulunmuyor.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-orange-500 pt-12 pb-6 px-6">
                <Text className="text-white text-2xl font-bold">Anomali Analizi</Text>
                <Text className="text-orange-100 mt-1">
                    {anomaliesData.total_anomalies} anomali tespit edildi
                </Text>
            </View>

            <ScrollView className="flex-1">
                {/* Risk Score */}
                <RiskScoreCard riskScore={anomaliesData.risk_score} />

                {/* Anomalies List */}
                <View className="px-4">
                    <Text className="text-xl font-bold text-gray-900 mb-4 px-2">
                        Tespit Edilen Anomaliler
                    </Text>

                    {anomaliesData.anomalies.map((anomaly, index) => (
                        <AnomalyCard
                            key={index}
                            anomaly={anomaly}
                            categoryName={getCategoryName(anomaly.category)}
                            categoryIcon={getCategoryIcon(anomaly.category)}
                        />
                    ))}
                </View>

                {/* Summary */}
                <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Özet</Text>
                    <View className="space-y-2">
                        <Text className="text-gray-700">
                            • Toplam {anomaliesData.total_anomalies} anomali tespit edildi
                        </Text>
                        <Text className="text-gray-700">
                            • Risk skoru: {anomaliesData.risk_score}/10
                        </Text>
                        <Text className="text-gray-700">
                            • En yüksek risk: {anomaliesData.anomalies.find(a => a.severity === 'high')?.category || 'Yok'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AnomaliesScreen;
