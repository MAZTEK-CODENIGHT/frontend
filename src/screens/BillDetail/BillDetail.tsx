import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../../api/client';

// Navigation types
type RootStackParamList = {
    UserSelection: undefined;
    Dashboard: { userId: number; userName: string };
    BillDetail: { userId: number; period: string };
    WhatIfSimulator: { userId: number; period: string };
    Anomalies: { userId: number; period: string };
    Checkout: { userId: number; period: string; scenario: any; result: any };
};

type BillDetailScreenRouteProp = RouteProp<RootStackParamList, 'BillDetail'>;

interface BillItem {
    item_id: string;
    category: string;
    subtype: string;
    description: string;
    amount: number;
    unit_price: number;
    quantity: number;
    tax_rate: number;
    created_at: string;
}

interface BillData {
    bill: {
        bill_id: string;
        total_amount: number;
        subtotal: number;
        taxes: number;
        currency: string;
        period_start: string;
        period_end: string;
        issue_date: string;
    };
    items: BillItem[];
}

const BillDetailScreen = () => {
    const route = useRoute<BillDetailScreenRouteProp>();
    const { userId, period } = route.params;

    const [billData, setBillData] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillData();
    }, [userId, period]);

    const fetchBillData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/bills/${userId}?period=${period}`);
            setBillData(response.data.data);
        } catch (error) {
            console.error('Bill fetch error:', error);
            Alert.alert('Hata', 'Fatura detayları yüklenemedi');
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ fontSize: 18, color: '#6b7280', marginTop: 16 }}>Fatura detayları yükleniyor...</Text>
            </View>
        );
    }

    if (!billData) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#6b7280' }}>Fatura bulunamadı</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#2563eb', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 24 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Fatura Detayları</Text>
                <Text style={{ color: '#bfdbfe', marginTop: 4 }}>
                    {formatDate(billData.bill.period_start)} - {formatDate(billData.bill.period_end)}
                </Text>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* Bill Summary */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Fatura Özeti</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 14, color: '#6b7280' }}>Toplam Tutar</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
                                ₺{billData.bill.total_amount.toFixed(2)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 14, color: '#6b7280' }}>Fatura Tarihi</Text>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                                {formatDate(billData.bill.issue_date)}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontSize: 14, color: '#6b7280' }}>Hizmetler</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                                ₺{billData.bill.subtotal.toFixed(2)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 14, color: '#6b7280' }}>Vergiler</Text>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                                ₺{billData.bill.taxes.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bill Items */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Fatura Kalemleri</Text>

                    {billData.items.map((item, index) => (
                        <View key={item.item_id} style={{
                            borderBottomWidth: index === billData.items.length - 1 ? 0 : 1,
                            borderBottomColor: '#f3f4f6',
                            paddingVertical: 16
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 20, marginRight: 8 }}>{getCategoryIcon(item.category)}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                                        {getCategoryName(item.category)}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                                        {item.description}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                    ₺{item.amount.toFixed(2)}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                    {item.quantity} × ₺{item.unit_price.toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                    KDV: %{(item.tax_rate * 100).toFixed(0)}
                                </Text>
                            </View>

                            {item.created_at && (
                                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                                    Tarih: {formatDate(item.created_at)}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={{ backgroundColor: '#dbeafe', borderRadius: 12, margin: 16, padding: 16 }}>
                    <Text style={{ color: '#1e40af', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                        💡 Bu fatura {billData.items.length} kalemden oluşmaktadır.
                        Detaylı analiz için ana sayfaya dönebilirsiniz.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default BillDetailScreen;
