import React from 'react';
import { View, Text } from 'react-native';

interface SimulationResult {
    current_total: number;
    new_total: number;
    saving: number;
    saving_percent: number;
    details: string[];
    recommendations: string[];
}

interface OrderSummaryProps {
    result: SimulationResult;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ result }) => {
    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Sipariş Özeti</Text>

            {/* Summary Cards */}
            <View className="flex-row space-x-3 mb-6">
                {/* Current Total */}
                <View className="flex-1 bg-gray-100 rounded-lg p-4">
                    <Text className="text-sm text-gray-500 mb-1">Mevcut Fatura</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                        ₺{result.current_total.toFixed(2)}
                    </Text>
                </View>

                {/* New Total */}
                <View className="flex-1 bg-blue-100 rounded-lg p-4">
                    <Text className="text-sm text-blue-600 mb-1">Yeni Fatura</Text>
                    <Text className="text-2xl font-bold text-blue-900">
                        ₺{result.new_total.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Savings */}
            <View className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <View className="items-center">
                    <Text className="text-2xl mb-2">💰</Text>
                    <Text className="text-lg font-semibold text-green-800">
                        Toplam Tasarruf: ₺{Math.abs(result.saving).toFixed(2)}
                    </Text>
                    <Text className="text-sm text-green-600">
                        %{result.saving_percent.toFixed(1)} oranında
                    </Text>
                </View>
            </View>

            {/* Details */}
            <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Değişiklik Detayları</Text>
                <View className="space-y-2">
                    {result.details.map((detail, index) => (
                        <View key={index} className="bg-gray-50 rounded-lg p-3">
                            <Text className="text-gray-700 text-sm">{detail}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
                <View>
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Öneriler</Text>
                    {result.recommendations.map((rec, index) => (
                        <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2 border-l-4 border-blue-400">
                            <Text className="text-blue-800 text-sm">💡 {rec}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};
