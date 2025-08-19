import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { OrderSummary } from './components/OrderSummary';
import { ActionList } from './components/ActionList';

interface CheckoutParams {
    userId: number;
    period: string;
    scenario: any;
    result: any;
}

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, period, scenario, result } = route.params as CheckoutParams;

    const [loading, setLoading] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);

    const handleCheckout = async () => {
        try {
            setLoading(true);

            const actions = [];

            if (scenario.plan_id) {
                actions.push({
                    type: 'change_plan',
                    payload: { plan_id: scenario.plan_id }
                });
            }

            if (scenario.addons && scenario.addons.length > 0) {
                scenario.addons.forEach((addonId: number) => {
                    actions.push({
                        type: 'add_addon',
                        payload: { addon_id: addonId }
                    });
                });
            }

            if (scenario.disable_vas) {
                actions.push({
                    type: 'cancel_vas',
                    payload: { vas_id: 'all' }
                });
            }

            if (scenario.block_premium_sms) {
                actions.push({
                    type: 'block_premium_sms',
                    payload: { enable: true }
                });
            }

            const response = await apiClient.post('/checkout', {
                user_id: userId,
                actions: actions
            });

            setOrderDetails(response.data.data);
            setOrderCompleted(true);

            Alert.alert(
                'Başarılı!',
                'Siparişiniz başarıyla tamamlandı. Değişiklikler bir sonraki fatura döneminde aktif olacak.',
                [{ text: 'Tamam', onPress: () => navigation.navigate('Dashboard', { userId, userName: 'Kullanıcı' }) }]
            );

        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Hata', 'Sipariş işlemi tamamlanamadı');
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
            <View className="flex-1 bg-gray-50">
                <View className="bg-green-600 pt-12 pb-6 px-6">
                    <Text className="text-white text-2xl font-bold">Sipariş Tamamlandı</Text>
                    <Text className="text-green-100 mt-1">Değişiklikler uygulandı</Text>
                </View>

                <ScrollView className="flex-1">
                    <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
                        <View className="items-center mb-6">
                            <Text className="text-6xl mb-4">✅</Text>
                            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                                Sipariş Başarıyla Tamamlandı
                            </Text>
                            <Text className="text-gray-600 text-center">
                                Sipariş numarası: {orderDetails.order_id}
                            </Text>
                        </View>

                        <View className="space-y-4">
                            <View className="bg-green-50 rounded-lg p-4">
                                <Text className="text-green-800 font-semibold text-center text-lg">
                                    Toplam Tasarruf: ₺{orderDetails.total_saving}
                                </Text>
                            </View>

                            <View className="bg-blue-50 rounded-lg p-4">
                                <Text className="text-blue-800 font-medium text-center">
                                    Etkinlik Tarihi: {orderDetails.effective_date}
                                </Text>
                            </View>

                            <View className="bg-gray-50 rounded-lg p-4">
                                <Text className="text-gray-800 font-medium text-center">
                                    Sonraki Fatura Tahmini: ₺{orderDetails.next_bill_estimate}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-blue-600 rounded-lg p-4 items-center mt-6"
                            onPress={() => navigation.navigate('Dashboard', { userId, userName: 'Kullanıcı' })}
                        >
                            <Text className="text-white font-semibold text-lg">Ana Sayfaya Dön</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-green-600 pt-12 pb-6 px-6">
                <Text className="text-white text-2xl font-bold">Sipariş Onayı</Text>
                <Text className="text-green-100 mt-1">Değişiklikleri gözden geçirin</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Order Summary */}
                <OrderSummary result={result} />

                {/* Action List */}
                <ActionList scenario={scenario} />

                {/* Action Buttons */}
                <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            className="flex-1 bg-green-600 rounded-lg p-4 items-center"
                            onPress={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    Siparişi Onayla
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-500 rounded-lg p-4 px-6 items-center"
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text className="text-white font-semibold">İptal</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-500 text-sm text-center mt-3">
                        Onayladığınızda değişiklikler bir sonraki fatura döneminde aktif olacaktır.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default CheckoutScreen;
