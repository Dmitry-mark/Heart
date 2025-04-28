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
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';

global.Buffer = Buffer;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAMERA_SIZE = SCREEN_WIDTH * 0.6;
const BOTTOM_OFFSET = SCREEN_HEIGHT * 0.1;

const SAMPLE_INTERVAL = 200;
const BUFFER_LEN = 30;
const MEASURE_WINDOW = 10000;
const MIN_PEAK_INTERVAL = 300;

export default function PulseScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef(null);

  // Permission and camera state
  const [permission, setPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState(null);

  // Torch workaround state
  const [torchEnabled, setTorchEnabled] = useState(false);

  // Measurement state
  const [measuring, setMeasuring] = useState(false);
  const [pulsation, setPulsation] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [debugHistory, setDebugHistory] = useState([]);

  const redBuffer = useRef([]);
  const beats = useRef([]);
  const lastMeans = useRef([]);
  const startTimeRef = useRef(0);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      console.log('Requesting camera permissions');
      try {
        const perm = await require('expo-camera').Camera.requestCameraPermissionsAsync();
        console.log('Permission status:', perm.status);
        setPermission(perm);
      } catch (e) {
        console.error('Permission error:', e);
      }
    })();
  }, []);

  // Fetch available picture sizes once camera ready
  useEffect(() => {
    if (cameraReady && cameraRef.current && !pictureSize) {
      (async () => {
        console.log('CameraView ready, fetching picture sizes');
        try {
          const sizes = await cameraRef.current.getAvailablePictureSizesAsync('4:3');
          console.log('Available picture sizes:', sizes);
          setPictureSize(sizes[0]);
        } catch (e) {
          console.error('Error getting picture sizes:', e);
        }
      })();
    }
  }, [cameraReady]);

  // Torch workaround: toggle off then on to engage
  useEffect(() => {
    if (measuring) {
      console.log('Enabling torch workaround');
      setTorchEnabled(false);
      setTimeout(() => {
        setTorchEnabled(true);
        console.log('Torch enabled');
      }, 100);
    } else {
      setTorchEnabled(false);
      console.log('Torch disabled');
    }
  }, [measuring]);

  // Measurement loop
  useEffect(() => {
    let active = true;

    const measureOnce = async () => {
      if (!cameraReady) return;
      const now = Date.now();
      const diff = now - startTimeRef.current;
      console.log('Elapsed ms:', diff);
      setElapsed(diff);
      try {
        console.log('Taking picture');
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.1, skipProcessing: true });
        console.log('Picture taken, size:', photo.base64.length);
        const raw = jpeg.decode(Buffer.from(photo.base64, 'base64'));
        let redSum = 0;
        const data = raw.data;
        for (let i = 0; i < data.length; i += 4) redSum += data[i];
        const redMean = redSum / ((data.length / 4) * 255);
        console.log('Red mean:', redMean);

        setDebugHistory(h => (arr => (arr.length > BUFFER_LEN ? arr.slice(-BUFFER_LEN) : arr))([...h, Number(redMean.toFixed(2))]));

        redBuffer.current.push(redMean);
        if (redBuffer.current.length > BUFFER_LEN) redBuffer.current.shift();
        const min = Math.min(...redBuffer.current);
        const max = Math.max(...redBuffer.current);
        const pulse = (redMean - min) / (max - min || 1);
        console.log('Pulsation ratio:', pulse);
        setPulsation(pulse);

        lastMeans.current.push({ value: redMean, time: now });
        if (lastMeans.current.length > 3) lastMeans.current.shift();
        if (lastMeans.current.length === 3) {
          const [p0, p1, p2] = lastMeans.current;
          const lastBeat = beats.current.slice(-1)[0] || 0;
          if (p1.value > p0.value && p1.value > p2.value && now - lastBeat > MIN_PEAK_INTERVAL) {
            beats.current.push(now);
            console.log('Beat detected at', now);
          }
        }

        if (diff >= MEASURE_WINDOW) {
          const bpm = Math.round(beats.current.length * (60 / (diff / 1000)));
          console.log('Measurement complete, BPM:', bpm);
          setResult(bpm);
          setMeasuring(false);
          setPulsation(0);
          Alert.alert('Результат', `Пульс: ${bpm} BPM`);
        }
      } catch (e) {
        console.error('Measure error:', e);
      }
    };

    const loop = async () => {
      if (!active || !measuring) return;
      await measureOnce();
      if (active && measuring) setTimeout(loop, SAMPLE_INTERVAL);
    };

    if (measuring && permission?.status === 'granted' && cameraReady) {
      console.log('Starting measurement');
      startTimeRef.current = Date.now();
      beats.current = [];
      redBuffer.current = [];
      lastMeans.current = [];
      setElapsed(0);
      setPulsation(0);
      setResult(null);
      setDebugHistory([]);
      loop();
    }

    return () => { active = false; };
  }, [measuring, permission, cameraReady]);

  const toggleMeasure = () => {
    console.log('Toggling measure. Now measuring:', !measuring);
    setMeasuring(m => !m);
  };

  if (!permission || permission.status !== 'granted') {
    return (
      <View style={styles.center}>
        <Text>Запрашиваем разрешения…</Text>
      </View>
    );
  }

  const progressWidth = Math.min(elapsed / MEASURE_WINDOW, 1) * CAMERA_SIZE;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../assets/Pulse/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Measurement</Text>
      </View>

      <ImageBackground source={require('../assets/Pulse/grid.png')} style={styles.gridBackground}>
        <View style={styles.cameraCircle}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            enableTorch={torchEnabled}
            pictureSize={pictureSize}
            contentFit="cover"
            onCameraReady={() => {
              console.log('CameraView ready');
              setCameraReady(true);
            }}
            onMountError={e => console.error('CameraView mount error:', e)}
          />
          {measuring && <View style={[styles.pulseOverlay, { opacity: pulsation }]} />}
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </ImageBackground>

      <View style={styles.textContainer}>
        {!result ? (
          <>
            <Text style={styles.mainText}>Прижмите палец к камере</Text>
            <Text style={styles.subText}>{measuring ? 'Измеряем…' : 'Нажмите на сердце'}</Text>
            {measuring && <Text style={styles.debugText}>История R: {debugHistory.join(', ')}</Text>}
          </>
        ) : (
          <Text style={styles.resultText}>Пульс: {result} BPM</Text>
        )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', padding: 16, height: 56 },
  backBtn: { padding: 8 },
  backIcon: { width: 35, height: 35, resizeMode: 'contain' },
  title: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '500' },

  gridBackground: { width: '100%', height: CAMERA_SIZE + 50, alignItems: 'center', justifyContent: 'center' },
  cameraCircle: { width: CAMERA_SIZE, height: CAMERA_SIZE, borderRadius: CAMERA_SIZE / 2, overflow: 'hidden', backgroundColor: '#000' },
  camera: { width: '100%', height: '100%' },
  pulseOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,0,0,0.4)' },

  progressContainer: { width: CAMERA_SIZE, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', backgroundColor: '#ff4444' },

  textContainer: { alignItems: 'center', marginTop: 24 },
  mainText: { fontSize: 18, fontWeight: '600' },
  subText: { fontSize: 14, color: '#888', marginTop: 8 },
  debugText: { fontSize: 12, color: '#666', marginTop: 8 },
  resultText: { fontSize: 24, fontWeight: '700', color: '#333' },

  footer: { position: 'absolute', bottom: BOTTOM_OFFSET, width: '100%', alignItems: 'center' },
  heart: { width: SCREEN_WIDTH * 0.65, height: SCREEN_WIDTH * 0.65, resizeMode: 'contain' },
});
