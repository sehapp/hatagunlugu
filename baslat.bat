@echo off
echo Hata Gunlugu Yerel Sunucu Baslatiliyor...
echo Bu pencereyi uygulama acikken kapatmayin.
start http://localhost:8000
python -m http.server 8000
pause
