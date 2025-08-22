
# CodingNightProject

Bu proje, React Native kullanılarak geliştirilmiş bir mobil uygulamadır. Android ve iOS platformlarında çalışacak şekilde tasarlanmıştır.

## Proje Amacı

Kullanıcıların fatura ve plan detaylarını görüntüleyebileceği, modern ve kullanıcı dostu bir arayüz sunan bir uygulama geliştirmek.


## Ana Özellikler

- Fatura detaylarını ve geçmişini görüntüleme
- Faturayla ilgili detaylı görünüm
- AI destekli fatura yorumu ve analiz önerileri
- Plan kartları ile kullanıcıya özel bilgiler
- Hızlı ve akıcı kullanıcı deneyimi

## Klasör Yapısı

```
src/
	App.tsx              # Ana uygulama dosyası
	api/                 # API istemcisi
	assets/              # Görseller
	components/          # Yeniden kullanılabilir bileşenler
	screens/             # Ekranlar (BillDetail, Home vb.)
android/               # Android proje dosyaları
ios/                   # iOS proje dosyaları
```

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js
- npm veya yarn
- Android Studio (Android için)
- Xcode ve CocoaPods (iOS için)

### Ortamı Hazırlama
React Native ortamınızı [buradaki rehber](https://reactnative.dev/docs/environment-setup) ile kurun.

### Bağımlılıkları Yükleme
```sh
npm install
# veya
yarn install
```

### Metro Sunucusunu Başlatma
```sh
npm start
# veya
yarn start
```

### Android'de Çalıştırma
```sh
npm run android
# veya
yarn android
```

### iOS'ta Çalıştırma
Öncelikle CocoaPods bağımlılıklarını yükleyin:
```sh
cd ios
bundle install
bundle exec pod install
cd ..
```
Sonra uygulamayı başlatın:
```sh
npm run ios
# veya
yarn ios
```

## Katkı Sağlama

Katkıda bulunmak için lütfen bir fork oluşturun ve pull request gönderin.

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## Kaynaklar

- [React Native Belgeleri](https://reactnative.dev/docs/getting-started)
- [CocoaPods](https://guides.cocoapods.org/using/getting-started.html)
