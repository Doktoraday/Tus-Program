# TUS Günlüğü

Kişisel TUS çalışma programı, kronometre ve ilerleme takibi — kurulabilir bir web app (PWA).

Kod `app/` klasöründe; build adımı yok, düz HTML/CSS/JS. Tüm veriler (çalışma süresi, deneme netleri, yanlış defteri, ayarlar) sadece kullanan kişinin cihazındaki `localStorage`'da tutulur, hiçbir yere gönderilmez.

## Yayında

`main` dalına her push, GitHub Actions ile `app/` klasörünü otomatik olarak GitHub Pages'e yayınlar (bkz. `.github/workflows/deploy-pages.yml`). İlk deploy'dan sonra adres repo **Settings → Pages** sayfasında görünür; genelde şu formatta olur:

```
https://doktoraday.github.io/Tus-al-ma-/
```

Telefonda açıp tarayıcı menüsünden **"Ana ekrana ekle"** ile gerçek bir uygulama gibi kurulabilir.

## Yerelde çalıştırma

```
cd app
python3 -m http.server 8080
```

sonra `http://localhost:8080` adresini aç.
