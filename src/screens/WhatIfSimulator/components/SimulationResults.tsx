import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface SimulationResult {
    current_total: number;
    new_total: number;
    saving: number;
    saving_percent: number;
    details: string[];
    recommendations: string[];
}

interface SimulationResultsProps {
    result: SimulationResult;
    onCheckout: () => void;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
    result,
    onCheckout
}) => {
    const getSavingColor = () => {
        if (result.saving > 0) return 'text-green-600';
        if (result.saving < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getSavingIcon = () => {
        if (result.saving > 0) return '💰';
        if (result.saving < 0) return '⚠️';
        return '➖';
    };

    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Simülasyon Sonuçları</Text>

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
            <View className={`bg-green-50 rounded-lg p-4 mb-6 border border-green-200`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Text className="text-2xl mr-2">{getSavingIcon()}</Text>
                        <View>
                            <Text className="text-lg font-semibold text-green-800">
                                Tasarruf: ₺{Math.abs(result.saving).toFixed(2)}
                            </Text>
                            <Text className="text-sm text-green-600">
                                %{result.saving_percent.toFixed(1)} oranında
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Details */}
            <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Detaylı Hesaplama</Text>
                <ScrollView className="max-h-40">
                    {result.details.map((detail, index) => (
                        <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                            <Text className="text-gray-700">{detail}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Öneriler</Text>
                    {result.recommendations.map((rec, index) => (
                        <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2 border-l-4 border-blue-400">
                            <Text className="text-blue-800">💡 {rec}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
                className="bg-green-600 rounded-lg p-4 items-center"
                onPress={onCheckout}
            >
                <Text className="text-white font-semibold text-lg">
                    Bu Değişiklikleri Uygula
                </Text>
                <Text className="text-green-100 text-sm mt-1">
                    ₺{Math.abs(result.saving).toFixed(2)} tasarruf edin
                </Text>
            </TouchableOpacity>
        </View>
    );
};
