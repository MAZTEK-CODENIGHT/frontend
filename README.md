# Fatura Asistanı - React Native Uygulaması

## Proje Hakkında

Fatura Asistanı, Turkcell müşterilerinin aylık faturalarını analiz eden, anomalileri tespit eden ve alternatif planları simüle eden bir mobil uygulamadır.

## Özellikler

- **Kullanıcı Seçimi**: Farklı kullanıcı profilleri arasında geçiş
- **Dashboard**: Fatura özeti, kategori dağılımı ve hızlı işlemler
- **Fatura Detayları**: Kalem kalem fatura analizi
- **Anomali Tespiti**: Şüpheli ücretlerin tespiti ve risk skorlaması
- **What-If Simülasyonu**: Alternatif plan ve paket senaryoları
- **Checkout**: Simülasyon sonuçlarının uygulanması

## Teknoloji Stack

- **Frontend**: React Native 0.72.6
- **Navigation**: React Navigation v6
- **HTTP Client**: Axios
- **Language**: TypeScript
- **Platform**: iOS + Android

## Kurulum

### Gereksinimler

- Node.js 16+
- React Native CLI
- Android Studio / Xcode

### Adımlar

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. iOS için (macOS gerekli):

```bash
cd ios && pod install && cd ..
```

3. Uygulamayı başlatın:

```bash
# Metro bundler
npx react-native start

# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## Proje Yapısı

```
src/
├── api/
│   └── client.ts          # API client konfigürasyonu
├── screens/
│   ├── UserSelection/     # Kullanıcı seçim ekranı
│   ├── Dashboard/         # Ana dashboard
│   │   └── components/    # Dashboard bileşenleri
│   ├── BillDetail/        # Fatura detay ekranı
│   ├── Anomalies/         # Anomali analiz ekranı
│   │   └── components/    # Anomali bileşenleri
│   ├── WhatIfSimulator/   # What-If simülasyon ekranı
│   │   └── components/    # Simülasyon bileşenleri
│   └── Checkout/          # Checkout ekranı
│       └── components/    # Checkout bileşenleri
└── App.tsx                # Ana uygulama bileşeni
```

## API Endpoints

Uygulama aşağıdaki API endpoint'lerini kullanır:

- `GET /api/users` - Kullanıcı listesi
- `GET /api/bills/{user_id}` - Fatura bilgileri
- `POST /api/anomalies` - Anomali tespiti
- `POST /api/whatif` - What-If simülasyonu
- `POST /api/checkout` - Checkout işlemi

## Geliştirme

### Yeni Ekran Ekleme

1. `src/screens/` altında yeni klasör oluşturun
2. Ekran bileşenini oluşturun
3. `App.tsx`'e navigation stack'e ekleyin
4. Gerekli navigation tiplerini ekleyin

### Stil Sistemi

Uygulama React Native'in built-in style sistemini kullanır. Tailwind CSS benzeri utility class'lar yerine inline style objeleri kullanılmıştır.

## Test

```bash
npm test
```

## Build

### Android APK

```bash
cd android
./gradlew assembleRelease
```

### iOS

Xcode ile build edin.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

MIT License

## İletişim

Proje ekibi - [email@example.com]
