import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { apiService, AvailablePeriod } from '../../../api/services';

interface PeriodSelectorProps {
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
    userId: number;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    selectedPeriod,
    onPeriodChange,
    userId
}) => {
    const [availablePeriods, setAvailablePeriods] = useState<AvailablePeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAvailablePeriods();
    }, [userId]);

    const loadAvailablePeriods = async () => {
        try {
            setLoading(true);
            setError(null);

            const periods = await apiService.getAvailablePeriods(userId);
            setAvailablePeriods(periods);

            // Eğer seçili dönem mevcut değilse, ilk mevcut dönemi seç
            if (periods.length > 0 && !periods.find(p => p.period === selectedPeriod)) {
                onPeriodChange(periods[0].period);
            }
        } catch (err) {
            console.error('Dönemler yüklenirken hata:', err);
            setError('Dönemler yüklenemedi');
            // Hata durumunda fallback olarak son 12 ayı göster
            setAvailablePeriods(generateFallbackPeriods());
        } finally {
            setLoading(false);
        }
    };

    const generateFallbackPeriods = () => {
        const periods = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

            periods.push({
                period,
                displayName: monthName,
                isCurrent: i === 0,
                total_amount: 0,
                bill_id: '',
                period_start: date.toISOString(),
                period_end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
                issue_date: date.toISOString()
            });
        }

        return periods;
    };

    const formatPeriodDisplay = (period: string) => {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Dönem Seçimi</Text>
                <View style={{ alignItems: 'center', padding: 20 }}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={{ marginTop: 8, color: '#6b7280' }}>Dönemler yükleniyor...</Text>
                </View>
            </View>
        );
    }

    if (error && availablePeriods.length === 0) {
        return (
            <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Dönem Seçimi</Text>
                <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error}</Text>
                    <TouchableOpacity
                        style={{ marginTop: 12, padding: 8, backgroundColor: '#2563eb', borderRadius: 6 }}
                        onPress={loadAvailablePeriods}
                    >
                        <Text style={{ color: 'white', fontWeight: '500' }}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const periods = availablePeriods.length > 0 ? availablePeriods : generateFallbackPeriods();

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                Dönem Seçimi
                {availablePeriods.length > 0 && (
                    <Text style={{ fontSize: 14, fontWeight: '400', color: '#6b7280' }}>
                        {' '}({availablePeriods.length} dönem mevcut)
                    </Text>
                )}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                    {periods.map((period) => {
                        const isAvailable = availablePeriods.length > 0 && availablePeriods.find(p => p.period === period.period);
                        const isCurrent = period.period === new Date().toISOString().slice(0, 7);

                        return (
                            <TouchableOpacity
                                key={period.period}
                                style={{
                                    borderRadius: 8,
                                    padding: 12,
                                    margin: 4,
                                    minWidth: 100,
                                    backgroundColor: selectedPeriod === period.period ? '#2563eb' :
                                        isAvailable ? '#f3f4f6' : '#fef2f2',
                                    borderWidth: selectedPeriod === period.period ? 2 : 1,
                                    borderColor: selectedPeriod === period.period ? '#1d4ed8' :
                                        isAvailable ? '#d1d5db' : '#fecaca',
                                    opacity: isAvailable ? 1 : 0.6
                                }}
                                onPress={() => isAvailable && onPeriodChange(period.period)}
                                disabled={!isAvailable}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: selectedPeriod === period.period ? 'white' :
                                            isAvailable ? '#374151' : '#ef4444'
                                    }}
                                >
                                    {formatPeriodDisplay(period.period)}
                                </Text>

                                {isCurrent && (
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 12,
                                            marginTop: 4,
                                            color: selectedPeriod === period.period ? '#bfdbfe' : '#2563eb'
                                        }}
                                    >
                                        Güncel
                                    </Text>
                                )}

                                {!isAvailable && (
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 10,
                                            marginTop: 4,
                                            color: '#ef4444'
                                        }}
                                    >
                                        Fatura Yok
                                    </Text>
                                )}

                                {isAvailable && period.total_amount > 0 && (
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 10,
                                            marginTop: 4,
                                            color: selectedPeriod === period.period ? '#bfdbfe' : '#6b7280'
                                        }}
                                    >
                                        {period.total_amount.toFixed(2)} TL
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};
