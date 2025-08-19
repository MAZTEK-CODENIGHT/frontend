import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import BillCardDetailed from '../../components/BillCardDetailed';
import apiClient from '../../api/client';
import PlanCard from '../../components/PlanCard/PlanCard'; // PlanCard bileşenini içe aktarın, yolunuza göre ayarlayın

// React Navigation'dan gelen parametrelerin tip tanımı
type BillDetailRouteParams = {
  billData: any; // Gönderilen verinin yapısına göre daha spesifik bir tip olabilir.
};

// Route prop'unun tipini tanımla
type BillDetailRouteProp = RouteProp<
  { BillDetail: BillDetailRouteParams },
  'BillDetail'
>;

const BillDetail = () => {
  const route = useRoute<BillDetailRouteProp>();
  const { billData } = route.params;
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [isLoadingAiCommentary, setIsLoadingAiCommentary] = useState<boolean>(true);
  const [catalogPlans, setCatalogPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [planError, setPlanError] = useState<string | null>(null);


  useEffect(() => {
    // API çağrısını yapmak için async fonksiyon
    const fetchAICommentary = async () => {
      console.log(billData);

      if (!billData?.bill?.bill_id) {
        setIsLoadingAiCommentary(false);
        setAiCommentary('Yorum için fatura kimliği bulunamadı.');
        return;
      }

      try {
        const response = await apiClient.post('/explain', {
          bill_id: billData.bill.bill_id,
        });
        console.log('RES',response);
        setAiCommentary(response.data.summary.natural_language);
      } catch (error) {
        console.error('API Error (AI Commentary):', error);
        setAiCommentary('Yapay zeka yorumu alınırken bir hata oluştu.');
      } finally {
        setIsLoadingAiCommentary(false); // Yükleme tamamlandı
      }
    };

    const fetchCatalogPlans = async () => {
      try {
        const response = await apiClient.get('/catalog');
        if (response.data && response.data.success && response.data.data && response.data.data.plans) {
          setCatalogPlans(response.data.data.plans);
        } else {
          setPlanError('Katalog verileri beklenenden farklı bir formatta geldi.');
        }
      } catch (error) {
        console.error('API Error (Catalog):', error);
        setPlanError('Paket verileri alınırken bir hata oluştu.');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchAICommentary();
    fetchCatalogPlans(); // Katalog verilerini de çek
  }, [billData]); // billData değiştiğinde tekrar çalıştır

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}> {/* Ana View yerine ScrollView kullanıldı */}
        {/* BillCardDetailed bileşenine veriyi prop olarak aktar */}
        {billData ? (
          <BillCardDetailed data={billData} />
        ) : (
          <Text style={styles.errorText}>Fatura detayı bulunamadı.</Text>
        )}

        <View style={styles.sectionHeaderWithMargin}>
          <Text style={styles.sectionHeaderTitle}>Yapay Zeka Fatura Yorumu</Text>
        </View>
        <View style={styles.aiCommentaryBox}>
          {isLoadingAiCommentary ? (
            <Text style={styles.aiCommentaryText}>Yorum yükleniyor...</Text>
          ) : (
            <Text style={styles.aiCommentaryText}>{aiCommentary}</Text>
          )}
        </View>
          
        <View style={styles.sectionHeaderWithMargin}>
          <Text style={styles.sectionHeaderTitle}>Mobil Paketler</Text>
        </View>

        {isLoadingPlans ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
        ) : planError ? (
          <Text style={styles.errorText}>{planError}</Text>
        ) : (
          <FlatList
            horizontal
            data={catalogPlans}
            keyExtractor={(item) => item.plan_id.toString()}
            renderItem={({ item }) => <PlanCard plan={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.planListContainer}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black', // Safe area arka plan rengi
  },
  container: {
    flex: 1, // ScrollView'nin tüm alanı kaplamasını sağlar
    backgroundColor: 'black', // Sayfanın genel arka plan rengi
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  sectionHeaderWithMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
    marginHorizontal: 12,
  },
  sectionHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  aiCommentaryBox: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  aiCommentaryText: {
    color: '#b0b0b0',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  planListContainer: {
    paddingHorizontal: 8, // FlatList'in genel yatay boşluğu
    paddingBottom: 20, // Alt kısımdan boşluk bırakmak için
  }
});

export default BillDetail;
