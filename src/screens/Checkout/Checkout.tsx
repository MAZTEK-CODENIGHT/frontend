import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../api/services';

interface CheckoutParams {
    userId: number;
    userName: string;
    period: string;
    scenario: any;
    result: any;
}

const CheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { userId, userName, period, scenario, result } = route.params as CheckoutParams;

    console.log('🚀 Checkout - Route params:', { userId, userName, period });

    const [loading, setLoading] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);

    // Geri tuşu handling'i
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // WhatIf ekranına dön
                navigation.goBack();
                return true; // Back press handled
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [navigation])
    );

    const handleCheckout = async () => {
        try {
            setLoading(true);

            // Prepare actions for checkout based on scenario
            const actions = [];

            if (scenario.plan_change?.to) {
                actions.push({
                    type: 'change_plan',
                    payload: {
                        plan_id: scenario.plan_change.to
                    },
                    description: 'Plan değişikliği'
                });
            }

            if (scenario.addons && scenario.addons.length > 0) {
                // Add addon actions
                actions.push(...scenario.addons.map((addonId: number) => ({
                    type: 'add_addon',
                    payload: {
                        addon_id: addonId
                    },
                    description: 'Ek paket ekleme'
                })));
            }

            // Note: VAS services addition is not supported by backend
            // Only cancellation is supported via cancel_vas

            // Add boolean option actions
            if (scenario.disable_vas) {
                actions.push({
                    type: 'cancel_vas',
                    payload: {
                        vas_id: 'all' // Cancel all VAS services
                    },
                    description: 'VAS servislerini devre dışı bırak'
                });
            }

            if (scenario.block_premium_sms) {
                actions.push({
                    type: 'block_premium_sms',
                    payload: {},
                    description: 'Premium SMS bloklaması'
                });
            }

            if (scenario.enable_roaming_block) {
                actions.push({
                    type: 'enable_roaming_block',
                    payload: {},
                    description: 'Yurt dışı kullanımı engelle'
                });
            }

            console.log('🚀 Checkout - Sending actions:', actions);

            const order = await apiService.processCheckout(userId, actions);

            setOrderDetails(order);
            setOrderCompleted(true);

            // Alert kaldırıldı - zaten "Sipariş Tamamlandı" ekranı gösteriliyor

        } catch (error: any) {
            console.error('Checkout error:', error);
            const errorMessage = error.response?.data?.message || 'Sipariş işlemi tamamlanamadı';
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'İptal Et',
            'Siparişi iptal etmek istediğinizden emin misiniz?',
            [
                { text: 'Hayır', style: 'cancel' },
                { text: 'Evet', onPress: () => navigation.goBack() }
            ]
        );
    };

    if (orderCompleted && orderDetails) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Sipariş Tamamlandı</Text>
                    <Text style={styles.headerSubtitle}>Değişiklikler uygulandı</Text>
                </View>

                <ScrollView style={styles.scrollView}>
                    <View style={styles.card}>
                        <View style={styles.successContent}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={styles.successTitle}>
                                Sipariş Başarıyla Tamamlandı
                            </Text>
                            <Text style={styles.orderNumber}>
                                Sipariş numarası: {orderDetails.order_id}
                            </Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoCard}>
                                <Text style={styles.infoTitle}>
                                    Toplam Tasarruf: ₺{result?.saving?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View style={styles.infoCard}>
                                <Text style={styles.infoText}>
                                    Etkinlik Tarihi: Bir sonraki fatura dönemi
                                </Text>
                            </View>

                            <View style={styles.infoCard}>
                                <Text style={styles.infoText}>
                                    Sonraki Fatura Tahmini: ₺{result?.new_total?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => {
                                console.log('🚀 Checkout - Dashboard\'a dönüyor:', { userId, userName });
                                navigation.navigate('Dashboard', { userId, userName });
                            }}
                        >
                            <Text style={styles.primaryButtonText}>Dashboard'a Dön</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sipariş Onayı</Text>
                <Text style={styles.headerSubtitle}>Değişiklikleri gözden geçirin</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Sipariş Özeti</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Mevcut Tutar:</Text>
                        <Text style={styles.summaryValue}>₺{result?.current_total?.toFixed(2) || '0.00'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Yeni Tutar:</Text>
                        <Text style={styles.summaryValue}>₺{result?.new_total?.toFixed(2) || '0.00'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tasarruf:</Text>
                        <Text style={styles.savingValue}>₺{result?.saving?.toFixed(2) || '0.00'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tasarruf Oranı:</Text>
                        <Text style={styles.savingValue}>%{result?.saving_percent?.toFixed(1) || '0.0'}</Text>
                    </View>
                </View>

                {/* Action List */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Yapılacak Değişiklikler</Text>

                    {scenario.plan_change && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>📱 Plan Değişikliği</Text>
                            <Text style={styles.actionDescription}>
                                Mevcut plan değiştirilecek
                            </Text>
                        </View>
                    )}

                    {scenario.addons && scenario.addons.length > 0 && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>📦 Ek Paket Ekleme</Text>
                            <Text style={styles.actionDescription}>
                                {scenario.addons.length} adet ek paket eklenecek
                            </Text>
                        </View>
                    )}

                    {scenario.vas_services && scenario.vas_services.length > 0 && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>🔧 VAS Servisi Ekleme</Text>
                            <Text style={styles.actionDescription}>
                                {scenario.vas_services.length} adet VAS servisi eklenecek
                            </Text>
                        </View>
                    )}

                    {scenario.disable_vas && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>❌ VAS Servisleri Kapatma</Text>
                            <Text style={styles.actionDescription}>
                                Tüm VAS servisleri devre dışı bırakılacak
                            </Text>
                        </View>
                    )}

                    {scenario.block_premium_sms && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>🚫 Premium SMS Engelleme</Text>
                            <Text style={styles.actionDescription}>
                                Premium SMS'ler engellenecek
                            </Text>
                        </View>
                    )}

                    {scenario.enable_roaming_block && (
                        <View style={styles.actionItem}>
                            <Text style={styles.actionTitle}>🌍 Yurt Dışı Kullanım Engelleme</Text>
                            <Text style={styles.actionDescription}>
                                Yurt dışı kullanım engellenecek
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.card}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    Siparişi Onayla
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.secondaryButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.disclaimer}>
                        Onayladığınızda değişiklikler bir sonraki fatura döneminde aktif olacaktır.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#059669',
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#a7f3d0',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    summaryLabel: {
        fontSize: 16,
        color: '#374151',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    savingValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    actionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#059669',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#6b7280',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        minWidth: 100,
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    successContent: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    infoContainer: {
        gap: 16,
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        color: '#059669',
        textAlign: 'center',
    },
});

export default CheckoutScreen;
