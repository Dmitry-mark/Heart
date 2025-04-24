import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  Alert,
  ImageBackground,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.6;
const UP_OFFSET = SCREEN_HEIGHT * 0.05;
const HEART_SIZE = SCREEN_WIDTH * 0.65;
const BOTTOM_OFFSET = SCREEN_HEIGHT * 0.1;

const SAMPLE_INTERVAL = 200;      // мс между кадрами
const BUFFER_LEN      = 30;       // сколько последних точек держим
const MOVEMENT_THRESHOLD = 0.2;   // суммарное |x|+|y|+|z| — когда считать, что телефон встряхнули

export default function App() {
  /* --- state --- */
  const [hasPermission, setHasPermission] = useState(null);
  const [measuring,    setMeasuring]    = useState(false);
  const [torch,        setTorch]        = useState(false);           // управление вспышкой
  const [pulsation,    setPulsation]    = useState(0);
  const [accelData,    setAccelData]    = useState({ x: 0, y: 0, z: 0 });

  /* --- refs & nav --- */
  const cameraRef   = useRef(null);
  const redBuffer   = useRef([]);
  const navigation  = useNavigation();

  /* --- permissions --- */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') Alert.alert('Нет доступа к камере');
    })();
  }, []);

  /* --- accelerometer subscribe --- */
  useEffect(() => {
    Accelerometer.setUpdateInterval(20);
    const sub = Accelerometer.addListener(setAccelData);
    return () => sub.remove();
  }, []);

  /* --- measurement loop --- */
  useEffect(() => {
    let timer;

    if (measuring && hasPermission) {
      timer = setInterval(async () => {
        /* 1. фильтр движения */
        const noise = Math.abs(accelData.x) + Math.abs(accelData.y) + Math.abs(accelData.z);
        if (noise > MOVEMENT_THRESHOLD) {
          redBuffer.current = [];
          setPulsation(0);
          return;
        }

        /* 2. кадр с камеры */
        if (!cameraRef.current) return;
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.1,
            base64: true,
            skipProcessing: true,
          });

          /* 3. среднее красного канала — ЗАМЕНИТЕ «TODO» на нормальную декомпрессию JPEG */
          const redMean = Math.random(); // TODO: вычислить реальное значение

          /* 4. обновляем буфер и визуализацию */
          const buf = redBuffer.current;
          buf.push(redMean);
          if (buf.length > BUFFER_LEN) buf.shift();

          const min = Math.min(...buf);
          const max = Math.max(...buf);
          setPulsation((redMean - min) / (max - min || 1));
        } catch (e) {
          console.error(e);
        }
      }, SAMPLE_INTERVAL);
    }

    return () => clearInterval(timer);
  }, [measuring, accelData, hasPermission]);

  /* --- переключатель измерения/torch --- */
  const toggleMeasure = () => {
    setMeasuring(prev => {
      const next = !prev;
      setTorch(next);                 // включаем/выключаем фонарик
      if (!next) {
        redBuffer.current = [];
        setPulsation(0);
      }
      return next;
    });
  };

  /* --- UI guards --- */
  if (hasPermission === null)
    return <View style={styles.center}><Text>Запрашиваем разрешения…</Text></View>;
  if (!hasPermission)
    return <View style={styles.center}><Text>Доступ к камере отклонён</Text></View>;

  /* --- render --- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.backBtn}>
          <Image source={require('../assets/Pulse/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Measurement</Text>
      </View>

      <ImageBackground
        source={require('../assets/Pulse/grid.png')}
        style={styles.gridBackground}
      >
        <View style={styles.cameraCircle}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            enableTorch={torch}
          />
          <View style={[styles.pulseOverlay, { opacity: pulsation }]} />
        </View>
      </ImageBackground>

      <View style={styles.textContainer}>
        <Text style={styles.mainText}>Прижмите палец к камере</Text>
        <Text style={styles.subText}>{measuring ? 'Измеряем…' : 'Нажмите на сердце'}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={toggleMeasure} activeOpacity={0.7}>
          <Image source={require('../assets/Pulse/heart.png')} style={styles.heart} />
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

/* --- styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, height: 56 },
  backBtn: { padding: 8 },
  backIcon: { width: 35, height: 35, resizeMode: 'contain' },
  title: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '500' },
  gridBackground: {
    width: '100%',
    height: CIRCLE_SIZE + UP_OFFSET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: { width: '100%', height: '100%' },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,0,0,0.4)',
  },
  textContainer: { alignItems: 'center', marginTop: 24 },
  mainText: { fontSize: 18, fontWeight: '600' },
  subText: { fontSize: 14, color: '#888', marginTop: 8 },
  footer: {
    position: 'absolute',
    bottom: BOTTOM_OFFSET,
    width: '100%',
    alignItems: 'center',
  },
  heart: { width: HEART_SIZE, height: HEART_SIZE, resizeMode: 'contain' },
});
