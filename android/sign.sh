
# Gen key
# keytool -genkey -v -keystore android.keystore -alias android-app-key -keyalg RSA -keysize 2048 -validity 10000

# Sign:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android.keystore app-release-unsigned.apk android-app-key

# Align:
zipalign -v 4 app-release-signed.apk app-release.apk
