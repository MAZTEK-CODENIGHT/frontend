import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiService, AnomalyAnalysis } from '../../api/services';
import { AnomalyCard } from './components/AnomalyCard';
import { RiskScoreCard } from './components/RiskScoreCard';

const AnomaliesScreen = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { userId, period } = route.params as { userId: number; period: string };

    const [anomaliesData, setAnomaliesData] = useState<AnomalyAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnomalies();
    }, [userId, period]);

    // Geri tuşu handling'i
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // Dashboard'a dön
                navigation.goBack();
                return true; // Back press handled
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [navigation])
    );

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const anomaliesResponse = await apiService.detectAnomalies(userId, period);
            setAnomaliesData(anomaliesResponse);
        } catch (error: any) {
            console.error('Anomalies fetch error:', error);
            const errorMessage = error.response?.data?.message || 'Anomali verileri yüklenemedi';
            Alert.alert('Hata', errorMessage);
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
            tax: 'Vergiler',
            monthly_fee: 'Aylık Ücret',
            voice_overage: 'Ses Aşımı',
            data_overage: 'Veri Aşımı',
            sms_overage: 'SMS Aşımı',
            plan: 'Plan'
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
            tax: '🏛️',
            monthly_fee: '📅',
            voice_overage: '📞',
            data_overage: '📱',
            sms_overage: '💬',
            plan: '📋'
        };
        return icons[category] || '❓';
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text style={{ fontSize: 18, color: '#6b7280', marginTop: 16 }}>Anomaliler analiz ediliyor...</Text>
            </View>
        );
    }

    if (!anomaliesData || !anomaliesData.anomalies || anomaliesData.anomalies.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={{ backgroundColor: '#f59e0b', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 24 }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Anomali Analizi</Text>
                    <Text style={{ color: '#fef3c7', marginTop: 4 }}>Fatura güvenlik kontrolü</Text>
                </View>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                    <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                        Anomali Tespit Edilmedi
                    </Text>
                    <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18 }}>
                        Bu dönem için fatura kalemlerinde şüpheli bir durum bulunmuyor.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#f59e0b', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 24 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Anomali Analizi</Text>
                <Text style={{ color: '#fef3c7', marginTop: 4 }}>
                    {anomaliesData.anomalies.length} anomali tespit edildi
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Risk Score */}
                <RiskScoreCard riskScore={anomaliesData.risk_score} />

                {/* Anomalies List */}
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16, paddingHorizontal: 8 }}>
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
                <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Özet</Text>
                    <View style={{ gap: 8 }}>
                        <Text style={{ color: '#374151' }}>
                            • Toplam {anomaliesData.anomalies.length} anomali tespit edildi
                        </Text>
                        <Text style={{ color: '#374151' }}>
                            • Risk skoru: {anomaliesData.risk_score}/100
                        </Text>
                        <Text style={{ color: '#374151' }}>
                            • En yüksek risk: {anomaliesData.anomalies.find(a => a.severity === 'high')?.category || 'Yok'}
                        </Text>
                        {anomaliesData.recommendations && anomaliesData.recommendations.length > 0 && (
                            <Text style={{ color: '#374151' }}>
                                • Öneriler: {anomaliesData.recommendations[0]}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AnomaliesScreen;
