import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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

interface AnomalyCardProps {
    anomaly: Anomaly;
    categoryName: string;
    categoryIcon: string;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({
    anomaly,
    categoryName,
    categoryIcon
}) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 border-red-300';
            case 'medium': return 'bg-yellow-100 border-yellow-300';
            case 'low': return 'bg-orange-100 border-orange-300';
            default: return 'bg-yellow-100 border-yellow-300';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-800';
            case 'medium': return 'text-yellow-800';
            case 'low': return 'text-orange-800';
            default: return 'text-yellow-800';
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'high': return '🔴 Yüksek Risk';
            case 'medium': return '🟡 Orta Risk';
            case 'low': return '🟠 Düşük Risk';
            default: return '🟡 Orta Risk';
        }
    };

    return (
        <View className={`rounded-xl p-4 mb-4 border ${getSeverityColor(anomaly.severity)}`}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{categoryIcon}</Text>
                    <Text className="text-lg font-bold text-gray-900">{categoryName}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getSeverityColor(anomaly.severity)}`}>
                    <Text className={`text-xs font-medium ${getSeverityTextColor(anomaly.severity)}`}>
                        {getSeverityBadge(anomaly.severity)}
                    </Text>
                </View>
            </View>

            {/* Delta Info */}
            <View className="bg-white rounded-lg p-3 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Mevcut Tutar:</Text>
                    <Text className="font-bold text-gray-900">₺{anomaly.current_amount.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Geçmiş Ortalama:</Text>
                    <Text className="font-medium text-gray-700">₺{anomaly.historical_average.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Değişim:</Text>
                    <Text className={`font-bold ${anomaly.delta.includes('+') ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {anomaly.delta}
                    </Text>
                </View>
            </View>

            {/* Reason */}
            <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-1">Neden:</Text>
                <Text className="text-gray-600">{anomaly.reason}</Text>
            </View>

            {/* Suggested Action */}
            <View className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                <Text className="text-sm font-medium text-blue-800 mb-1">Önerilen Aksiyon:</Text>
                <Text className="text-blue-700">{anomaly.suggested_action}</Text>
            </View>

            {/* First Occurrence Badge */}
            {anomaly.first_occurrence && (
                <View className="mt-3 bg-purple-100 rounded-lg p-2">
                    <Text className="text-purple-800 text-sm font-medium text-center">
                        🆕 İlk kez görülen ücret
                    </Text>
                </View>
            )}
        </View>
    );
};
