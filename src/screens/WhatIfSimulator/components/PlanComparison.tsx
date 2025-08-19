import React from 'react';
import { View, Text, ScrollView } from 'react-native';

interface PlanComparisonProps {
    catalog: any;
}

export const PlanComparison: React.FC<PlanComparisonProps> = ({ catalog }) => {
    if (!catalog?.plans) return null;

    return (
        <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-900 mb-4">Plan Karşılaştırması</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                    {catalog.plans.map((plan: any) => (
                        <View key={plan.plan_id} className="bg-gray-50 rounded-lg p-4 m-2 min-w-[180px] border border-gray-200">
                            <Text className="text-lg font-bold text-gray-900 mb-2">{plan.plan_name}</Text>

                            <View className="space-y-2 mb-3">
                                <View className="flex-row justify-between">
                                    <Text className="text-sm text-gray-600">Veri:</Text>
                                    <Text className="text-sm font-medium text-gray-900">{plan.quota_gb}GB</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-sm text-gray-600">Dakika:</Text>
                                    <Text className="text-sm font-medium text-gray-900">{plan.quota_min}dk</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-sm text-gray-600">SMS:</Text>
                                    <Text className="text-sm font-medium text-gray-900">{plan.quota_sms}adet</Text>
                                </View>
                            </View>

                            <View className="border-t border-gray-200 pt-2">
                                <Text className="text-2xl font-bold text-blue-600 text-center">
                                    ₺{plan.monthly_price}
                                </Text>
                                <Text className="text-xs text-gray-500 text-center">aylık</Text>
                            </View>

                            <View className="mt-3 space-y-1">
                                <Text className="text-xs text-gray-500 text-center">
                                    Aşım: ₺{plan.overage_gb}/GB
                                </Text>
                                <Text className="text-xs text-gray-500 text-center">
                                    Aşım: ₺{plan.overage_min}/dk
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
