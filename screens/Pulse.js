// screens/Pulse.js

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { RNCamera } from 'react-native-camera';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Pulse() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    async function requestPerm() {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Heart needs access to your camera to measure your pulse',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // на iOS достаточно указать NSCameraUsageDescription в Info.plist
        setHasPermission(true);
      }
    }
    requestPerm();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Запрашиваем доступ к камере…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>Нет доступа к камере</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2 }}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
        onCameraReady={() => setCameraReady(true)}
      />
      {!cameraReady && (
        <View style={styles.center}>
          <Text>Запуск камеры…</Text>
        </View>
      )}
      <View style={styles.heartWrap}>
        <Image
          source={require('../assets/Pulse/heart.png')}
          style={styles.heart}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heartWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    width: 120,
    height: 120,
  },
});
