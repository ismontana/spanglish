export default {
  "expo": {
    "name": "Spanglish",
    "slug": "Spanglish",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "spanglish",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": false,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ismontana.Spanglish",
      "infoPlist": {
        "NSSpeechRecognitionUsageDescription": "Esta aplicación necesita acceso al reconocimiento de voz para traducir lo que dices a otro idioma.",
        "NSMicrophoneUsageDescription": "Esta aplicación necesita acceso a tu micrófono para el reconocimiento de voz."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.ismontana.Spanglish",
      "permissions": [
                  "android.permission.RECORD_AUDIO"
                  ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "manifest": {
              "xmlns:tools": "http://schemas.android.com/tools"
            },
            application: {
              "tools:replace": "android:appComponentFactory",
            },
            "useAndroidX": true,
            "enableJetifier": true
          },
        },
        ],
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "473783a4-e8b8-4251-8b06-72ae9ad48c73"
      }
    }
  }
}
