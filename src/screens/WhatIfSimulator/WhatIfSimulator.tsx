import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { apiService, Plan, Addon, VAS } from '../../api/services';

// Navigation types
type RootStackParamList = {
    UserSelection: undefined;
    Dashboard: { userId: number; userName: string };
    WhatIfSimulator: { userId: number; userName: string; period: string };
    Anomalies: { userId: number; period: string };
    Checkout: { userId: number; userName: string; period: string; scenario: any; result: any };
    BillDetail: { userId: number; period: string };
};

type WhatIfScreenNavigationProp = any; // Using any for now to avoid complex typing

interface WhatIfScenario {
    plan_change?: {
        from: number;
        to: number;
    };
    addons?: number[];
    vas_services?: string[];
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
    const navigation = useNavigation<WhatIfScreenNavigationProp>();
    const route = useRoute();
    const { userId, userName, period } = route.params as { userId: number; userName: string; period: string };

    console.log('🚀 WhatIf - Route params:', { userId, userName, period });

    const [scenario, setScenario] = useState<WhatIfScenario>({});
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [vasServices, setVasServices] = useState<VAS[]>([]);
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
    const [catalogLoading, setCatalogLoading] = useState(true);

    useEffect(() => {
        fetchCatalog();
        fetchCurrentPlan();
    }, []);

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

    const fetchCatalog = async () => {
        setCatalogLoading(true);
        try {
            console.log('🚀 fetchCatalog - Starting to fetch catalog data...');

            const [plansData, addonsData, vasData] = await Promise.all([
                apiService.getPlans(),
                apiService.getAddons(),
                apiService.getVAS(),
            ]);

            console.log('📊 fetchCatalog - Plans data received:', plansData);
            console.log('📊 fetchCatalog - Addons data received:', addonsData);
            console.log('📊 fetchCatalog - VAS data received:', vasData);
            console.log('📊 fetchCatalog - VAS data type:', typeof vasData);
            console.log('📊 fetchCatalog - VAS data is array:', Array.isArray(vasData));
            console.log('📊 fetchCatalog - VAS data length:', vasData?.length);

            setPlans(plansData || []);
            setAddons(addonsData || []);
            setVasServices(vasData || []);

            console.log('📊 fetchCatalog - State after setState:');
            console.log('📊 fetchCatalog - plans state:', plansData);
            console.log('📊 fetchCatalog - addons state:', addonsData);
            console.log('📊 fetchCatalog - vasServices state:', vasData);

        } catch (error) {
            console.error('❌ fetchCatalog Error:', error);
            Alert.alert('Hata', 'Katalog verileri yüklenirken bir hata oluştu.');
        } finally {
            setCatalogLoading(false);
        }
    };

    const fetchCurrentPlan = async () => {
        try {
            const userDetails = await apiService.getUserById(userId);
            if (userDetails.current_plan) {
                const plan = await apiService.getPlanDetails(userDetails.current_plan.plan_id);
                setCurrentPlan(plan);
            }
        } catch (error) {
            console.error('Current plan fetch error:', error);
        }
    };

    const handlePlanChange = (planId: number) => {
        setScenario(prev => ({
            ...prev,
            plan_change: {
                from: currentPlan?.plan_id || 0,
                to: planId
            }
        }));
    };

    const handleAddonToggle = (addonId: number) => {
        setScenario(prev => {
            const currentAddons = prev.addons || [];
            const newAddons = currentAddons.includes(addonId)
                ? currentAddons.filter(id => id !== addonId)
                : [...currentAddons, addonId];

            return {
                ...prev,
                addons: newAddons
            };
        });
    };

    const handleVasToggle = (vasId: string) => {
        setScenario(prev => {
            const currentVas = prev.vas_services || [];
            const newVas = currentVas.includes(vasId)
                ? currentVas.filter(id => id !== vasId)
                : [...currentVas, vasId];

            return {
                ...prev,
                vas_services: newVas
            };
        });
    };

    const handleToggleOption = (option: keyof WhatIfScenario) => {
        setScenario(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const runSimulation = async () => {
        console.log('🚀 runSimulation - Starting with scenario:', scenario);

        // Check if any scenario options are selected
        const hasPlanChange = scenario.plan_change?.to;
        const hasAddons = scenario.addons && scenario.addons.length > 0;
        const hasVasServices = scenario.vas_services && scenario.vas_services.length > 0;
        const hasOptions = scenario.disable_vas || scenario.block_premium_sms || scenario.enable_roaming_block;

        console.log('🔍 runSimulation - Scenario check:', {
            hasPlanChange,
            hasAddons,
            hasVasServices,
            hasOptions,
            plan_change: scenario.plan_change,
            addons: scenario.addons,
            vas_services: scenario.vas_services,
            disable_vas: scenario.disable_vas,
            block_premium_sms: scenario.block_premium_sms,
            enable_roaming_block: scenario.enable_roaming_block
        });

        if (!hasPlanChange && !hasAddons && !hasVasServices && !hasOptions) {
            console.log('❌ runSimulation - No scenario options selected');
            Alert.alert('Uyarı', 'Lütfen en az bir senaryo seçeneği belirleyin');
            return;
        }

        try {
            setLoading(true);

            // Prepare scenario object for backend
            const backendScenario: any = {};

            // Add plan change if selected
            if (hasPlanChange) {
                backendScenario.plan_id = scenario.plan_change?.to;
            }

            // Add addons if selected
            if (hasAddons) {
                backendScenario.addons = scenario.addons;
            }

            // Add VAS services if selected
            if (hasVasServices) {
                backendScenario.vas_services = scenario.vas_services;
            }

            // Add boolean options
            if (scenario.disable_vas) {
                backendScenario.disable_vas = true;
            }
            if (scenario.block_premium_sms) {
                backendScenario.block_premium_sms = true;
            }
            if (scenario.enable_roaming_block) {
                backendScenario.enable_roaming_block = true;
            }

            console.log('🚀 runSimulation - Sending scenario to backend:', backendScenario);
            console.log('🚀 runSimulation - Backend scenario keys:', Object.keys(backendScenario));

            const result = await apiService.calculateWhatIf(userId, period, backendScenario);

            console.log('✅ runSimulation - Backend response:', result);

            // Convert backend response to local format
            setSimulationResult({
                current_total: result.current_total || (result.new_total + result.saving),
                new_total: result.new_total,
                saving: result.saving,
                saving_percent: parseFloat(result.saving_percent || result.saving_percentage || '0'),
                details: result.details || [result.name || 'Simülasyon tamamlandı'],
                recommendations: result.recommendations || []
            });
        } catch (error: any) {
            console.error('❌ runSimulation Error:', error);
            const errorMessage = error.response?.data?.message || 'Simülasyon çalıştırılamadı';
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        if (!simulationResult) return;

        navigation.navigate('Checkout', {
            userId,
            userName,
            period,
            scenario,
            result: simulationResult
        });
    };

    const resetScenario = () => {
        setScenario({});
        setSimulationResult(null);
    };

    const getSelectedPlanName = () => {
        if (scenario.plan_change?.to) {
            const plan = plans.find(p => p.plan_id === scenario.plan_change?.to);
            return plan?.plan_name || 'Bilinmeyen Plan';
        }
        return currentPlan?.plan_name || 'Mevcut Plan';
    };

    const getSelectedAddons = () => {
        if (!scenario.addons || scenario.addons.length === 0) return [];
        return addons.filter(addon => scenario.addons?.includes(addon.addon_id));
    };

    const getSelectedVas = () => {
        if (!scenario.vas_services || scenario.vas_services.length === 0) return [];
        return vasServices.filter(vas => scenario.vas_services?.includes(vas.vas_id));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>What-If Simülasyonu</Text>
                <Text style={styles.headerSubtitle}>Alternatif senaryoları test edin</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Current Plan Info */}
                {currentPlan && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Mevcut Plan</Text>
                        <View style={styles.planInfo}>
                            <Text style={styles.planName}>{currentPlan.plan_name}</Text>
                            <Text style={styles.planPrice}>₺{currentPlan.monthly_price}/ay</Text>
                            <Text style={styles.planDetails}>
                                {currentPlan.quota_gb}GB, {currentPlan.quota_min}dk, {currentPlan.quota_sms} SMS
                            </Text>
                        </View>
                    </View>
                )}

                {/* Loading State */}
                {catalogLoading && (
                    <View style={styles.card}>
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#7c3aed" />
                            <Text style={styles.loadingText}>Katalog yükleniyor...</Text>
                        </View>
                    </View>
                )}

                {/* Plan Selection */}
                {!catalogLoading && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Plan Değişikliği</Text>
                        <Text style={styles.cardSubtitle}>Alternatif plan seçin</Text>

                        {plans && plans.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
                                {plans.map((plan) => (
                                    <TouchableOpacity
                                        key={plan.plan_id}
                                        style={[
                                            styles.planCard,
                                            scenario.plan_change?.to === plan.plan_id && styles.selectedPlanCard
                                        ]}
                                        onPress={() => handlePlanChange(plan.plan_id)}
                                    >
                                        <Text style={[
                                            styles.planCardName,
                                            scenario.plan_change?.to === plan.plan_id && styles.selectedPlanCardText
                                        ]}>
                                            {plan.plan_name}
                                        </Text>
                                        <Text style={[
                                            styles.planCardPrice,
                                            scenario.plan_change?.to === plan.plan_id && styles.selectedPlanCardText
                                        ]}>
                                            ₺{plan.monthly_price}
                                        </Text>
                                        <Text style={[
                                            styles.planCardDetails,
                                            scenario.plan_change?.to === plan.plan_id && styles.selectedPlanCardText
                                        ]}>
                                            {plan.quota_gb}GB
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Plan bulunamadı</Text>
                                <Text style={styles.emptyStateSubtext}>Şu anda aktif plan yok</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Addons Selection */}
                {!catalogLoading && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Ek Paketler</Text>
                        <Text style={styles.cardSubtitle}>İhtiyacınız olan ek paketleri seçin</Text>

                        {addons && addons.length > 0 ? (
                            <View style={styles.addonsGrid}>
                                {addons.map((addon) => (
                                    <TouchableOpacity
                                        key={addon.addon_id}
                                        style={[
                                            styles.addonCard,
                                            scenario.addons?.includes(addon.addon_id) && styles.selectedAddonCard
                                        ]}
                                        onPress={() => handleAddonToggle(addon.addon_id)}
                                    >
                                        <Text style={[
                                            styles.addonName,
                                            scenario.addons?.includes(addon.addon_id) && styles.selectedAddonText
                                        ]}>
                                            {addon.name}
                                        </Text>
                                        <Text style={[
                                            styles.addonPrice,
                                            scenario.addons?.includes(addon.addon_id) && styles.selectedAddonText
                                        ]}>
                                            ₺{addon.price}
                                        </Text>
                                        <Text style={[
                                            styles.addonDetails,
                                            scenario.addons?.includes(addon.addon_id) && styles.selectedAddonText
                                        ]}>
                                            +{addon.extra_gb}GB
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Ek paket bulunamadı</Text>
                                <Text style={styles.emptyStateSubtext}>Şu anda aktif ek paket yok</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* VAS Services */}
                {!catalogLoading && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>VAS Servisleri</Text>
                        <Text style={styles.cardSubtitle}>Değer artışlı servisleri seçin</Text>

                        {(() => {
                            console.log('🔍 Render - vasServices state:', vasServices);
                            console.log('🔍 Render - vasServices type:', typeof vasServices);
                            console.log('🔍 Render - vasServices is array:', Array.isArray(vasServices));
                            console.log('🔍 Render - vasServices length:', vasServices?.length);
                            return null;
                        })()}

                        {vasServices && vasServices.length > 0 ? (
                            <View style={styles.vasGrid}>
                                {vasServices.map((vas) => (
                                    <TouchableOpacity
                                        key={vas.vas_id}
                                        style={[
                                            styles.vasCard,
                                            scenario.vas_services?.includes(vas.vas_id) && styles.selectedVasCard
                                        ]}
                                        onPress={() => handleVasToggle(vas.vas_id)}
                                    >
                                        <Text style={[
                                            styles.vasName,
                                            scenario.vas_services?.includes(vas.vas_id) && styles.selectedVasText
                                        ]}>
                                            {vas.name}
                                        </Text>
                                        <Text style={[
                                            styles.vasPrice,
                                            scenario.vas_services?.includes(vas.vas_id) && styles.selectedVasText
                                        ]}>
                                            ₺{vas.monthly_fee}/ay
                                        </Text>
                                        <Text style={[
                                            styles.vasCategory,
                                            scenario.vas_services?.includes(vas.vas_id) && styles.selectedVasText
                                        ]}>
                                            {vas.category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>VAS servisi bulunamadı</Text>
                                <Text style={styles.emptyStateSubtext}>Şu anda aktif VAS servisi yok</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Additional Options */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ek Seçenekler</Text>

                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => handleToggleOption('disable_vas')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>VAS Servislerini Devre Dışı Bırak</Text>
                            <Text style={styles.optionDescription}>Tüm ek servisleri kapatarak tasarruf edin</Text>
                        </View>
                        <View style={[
                            styles.checkbox,
                            scenario.disable_vas && styles.checkboxChecked
                        ]}>
                            {scenario.disable_vas && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => handleToggleOption('block_premium_sms')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Premium SMS'i Engelle</Text>
                            <Text style={styles.optionDescription}>Ücretli SMS'leri engelleyerek tasarruf edin</Text>
                        </View>
                        <View style={[
                            styles.checkbox,
                            scenario.block_premium_sms && styles.checkboxChecked
                        ]}>
                            {scenario.block_premium_sms && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => handleToggleOption('enable_roaming_block')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Yurt Dışı Kullanımı Engelle</Text>
                            <Text style={styles.optionDescription}>Yurt dışı ücretlerini engelleyin</Text>
                        </View>
                        <View style={[
                            styles.checkbox,
                            scenario.enable_roaming_block && styles.checkboxChecked
                        ]}>
                            {scenario.enable_roaming_block && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.card}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={runSimulation}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Simülasyonu Çalıştır</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={resetScenario}
                        >
                            <Text style={styles.secondaryButtonText}>Sıfırla</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Simulation Results */}
                {simulationResult && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Simülasyon Sonuçları</Text>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Mevcut Tutar:</Text>
                            <Text style={styles.resultValue}>₺{simulationResult.current_total.toFixed(2)}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Yeni Tutar:</Text>
                            <Text style={styles.resultValue}>₺{simulationResult.new_total.toFixed(2)}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Tasarruf:</Text>
                            <Text style={styles.savingValue}>₺{simulationResult.saving.toFixed(2)}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Tasarruf Oranı:</Text>
                            <Text style={styles.savingValue}>%{simulationResult.saving_percent.toFixed(1)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>Bu Planı Seç</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Selected Options Summary */}
                {(scenario.plan_change || scenario.addons?.length || scenario.vas_services?.length) && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Seçilen Seçenekler</Text>

                        {scenario.plan_change && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Plan:</Text>
                                <Text style={styles.summaryValue}>{getSelectedPlanName()}</Text>
                            </View>
                        )}

                        {scenario.addons && scenario.addons.length > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Ek Paketler:</Text>
                                <Text style={styles.summaryValue}>
                                    {getSelectedAddons().map(addon => addon.name).join(', ')}
                                </Text>
                            </View>
                        )}

                        {scenario.vas_services && scenario.vas_services.length > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>VAS Servisleri:</Text>
                                <Text style={styles.summaryValue}>
                                    {getSelectedVas().map(vas => vas.name).join(', ')}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
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
        backgroundColor: '#7c3aed',
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
        color: '#ddd6fe',
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
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    planInfo: {
        alignItems: 'center',
    },
    planName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7c3aed',
        marginBottom: 4,
    },
    planDetails: {
        fontSize: 14,
        color: '#6b7280',
    },
    plansScroll: {
        marginHorizontal: -8,
    },
    planCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    selectedPlanCard: {
        backgroundColor: '#7c3aed',
    },
    planCardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    planCardPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    planCardDetails: {
        fontSize: 12,
        color: '#6b7280',
    },
    selectedPlanCardText: {
        color: 'white',
    },
    addonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    addonCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
    },
    selectedAddonCard: {
        backgroundColor: '#7c3aed',
    },
    addonName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    addonPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    addonDetails: {
        fontSize: 12,
        color: '#6b7280',
    },
    selectedAddonText: {
        color: 'white',
    },
    vasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    vasCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
    },
    selectedVasCard: {
        backgroundColor: '#7c3aed',
    },
    vasName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    vasPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    vasCategory: {
        fontSize: 12,
        color: '#6b7280',
    },
    selectedVasText: {
        color: 'white',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#7c3aed',
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
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    resultLabel: {
        fontSize: 16,
        color: '#374151',
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    savingValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    checkoutButton: {
        backgroundColor: '#059669',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
        fontSize: 14,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#6b7280',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
    },
});

export default WhatIfScreen;
