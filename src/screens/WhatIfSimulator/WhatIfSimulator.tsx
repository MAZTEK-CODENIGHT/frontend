import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { SimulationResults } from './components/SimulationResults';
import { PlanComparison } from './components/PlanComparison';

interface WhatIfScenario {
    plan_id?: number;
    addons?: number[];
    disable_vas?: boolean;
    block_premium_sms?: boolean;
    enable_roaming_block?: boolean;
}

interface SimulationResult {
    current_total: number;
    new_total: number;
    saving: number;
    saving_percent: number;
    details: string[];
    recommendations: string[];
}

const WhatIfScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, period } = route.params as { userId: number; period: string };

    const [scenario, setScenario] = useState<WhatIfScenario>({});
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [catalog, setCatalog] = useState<any>(null);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const response = await apiClient.get('/catalog');
            setCatalog(response.data.data);
        } catch (error) {
            console.error('Catalog fetch error:', error);
        }
    };

    const handleScenarioChange = (newScenario: WhatIfScenario) => {
        setScenario(newScenario);
    };

    const runSimulation = async () => {
        if (Object.keys(scenario).length === 0) {
            Alert.alert('Uyarı', 'Lütfen en az bir senaryo seçeneği belirleyin');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/whatif', {
                user_id: userId,
                period: period,
                scenario: scenario
            });
            setSimulationResult(response.data.data);
        } catch (error) {
            console.error('Simulation error:', error);
            Alert.alert('Hata', 'Simülasyon çalıştırılamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        if (!simulationResult) return;

        navigation.navigate('Checkout', {
            userId,
            period,
            scenario,
            result: simulationResult
        });
    };

    const resetScenario = () => {
        setScenario({});
        setSimulationResult(null);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-purple-600 pt-12 pb-6 px-6">
                <Text className="text-white text-2xl font-bold">What-If Simülasyonu</Text>
                <Text className="text-purple-100 mt-1">Alternatif senaryoları test edin</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Scenario Builder */}
                <ScenarioBuilder
                    scenario={scenario}
                    catalog={catalog}
                    onScenarioChange={handleScenarioChange}
                />

                {/* Action Buttons */}
                <View className="bg-white rounded-xl m-4 p-6 shadow-lg">
                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            className="flex-1 bg-purple-600 rounded-lg p-4 items-center"
                            onPress={runSimulation}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">Simülasyonu Çalıştır</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-500 rounded-lg p-4 px-6 items-center"
                            onPress={resetScenario}
                        >
                            <Text className="text-white font-semibold">Sıfırla</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Simulation Results */}
                {simulationResult && (
                    <SimulationResults
                        result={simulationResult}
                        onCheckout={handleCheckout}
                    />
                )}

                {/* Plan Comparison */}
                {catalog && (
                    <PlanComparison catalog={catalog} />
                )}
            </ScrollView>
        </View>
    );
};

export default WhatIfScreen;
