import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Image, Alert,  ImageBackground } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.6;     
const UP_OFFSET = SCREEN_HEIGHT * 0.05;      
const HEART_SIZE = SCREEN_WIDTH * 0.65;      
const BOTTOM_OFFSET = SCREEN_HEIGHT * 0.1; 

export default function App() {
  const [cameraPermission, setCameraPermission] = useState();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState();
  const [micPermission, setMicPermission] = useState();

  const [cameraMode, setCameraMode] = useState('picture');
  const [facing, setFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('on');
  const [zoom, setZoom] = useState(0);
  const [photo, setPhoto] = useState();
  const [video, setVideo] = useState();
  const [recording, setRecording] = useState(false);

  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const camPerm = await Camera.requestCameraPermissionsAsync();
      const mediaPerm = await MediaLibrary.requestPermissionsAsync();
      const micPerm = await Camera.requestMicrophonePermissionsAsync();
      setCameraPermission(camPerm.status === 'granted');
      setMediaLibraryPermission(mediaPerm.status === 'granted');
      setMicPermission(micPerm.status === 'granted');

      if (camPerm.status !== 'granted') {
        Alert.alert('Нет доступа к камере');
      }
    })();
  }, []);

  if (cameraPermission === undefined || mediaLibraryPermission === undefined || micPermission === undefined) {
    return <View style={styles.center}><Text>Запрашиваем разрешения...</Text></View>;
  }
  if (!cameraPermission) {
    return <View style={styles.center}><Text>Доступ к камере отклонён</Text></View>;
  }

  function toggleCameraFacing() {
    setFacing(curr => (curr === 'back' ? 'front' : 'back'));
  }
  function toggleFlash() {
    setFlashMode(curr => (curr === 'on' ? 'off' : 'on'));
  }

  const takePicture = async () => {
    const options = { quality: 1, base64: true, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  async function startRecording() {
    setRecording(true);
    cameraRef.current.recordAsync({ maxDuration: 30 })
      .then(newVideo => {
        setVideo(newVideo);
        setRecording(false);
      });
  }

  function stopRecording() {
    setRecording(false);
    cameraRef.current.stopRecording();
  }

  if (photo) {
    const savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => setPhoto(undefined));
    };

    return (
      <SafeAreaView style={styles.imageContainer}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <View style={styles.btnContainer}>
          {mediaLibraryPermission && (
            <TouchableOpacity style={styles.btn} onPress={savePhoto}>
              <Ionicons name="save-outline" size={30} color="black" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btn} onPress={() => setPhoto(undefined)}>
            <Ionicons name="trash-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (video) {
    navigation.navigate('Video', { uri: video.uri });
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back arrow and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.backBtn}>
          <Image source={require('../assets/Pulse/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Measurement</Text>
      </View>

      {/* Grid background with camera circle */}
      <ImageBackground source={require('../assets/Pulse/grid.png')} style={styles.gridBackground}>
        <View style={styles.cameraCircle}>
          <CameraView
            style={styles.camera}
          >
          </CameraView>
        </View>
      </ImageBackground>

      {/* Instructional text */}
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>Let's Start to Measure</Text>
        <Text style={styles.subText}>Place your finger on the camera</Text>
      </View>

      {/* Heart button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={takePicture} activeOpacity={0.7}>
          <Image
            source={require('../assets/Pulse/heart.png')}
            style={styles.heart}
          />
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '500',
    right: '8%'
  },
  gridBackground: {
    flex: 0,
    width: '100%',
    height: CIRCLE_SIZE + UP_OFFSET,
    alignItems: 'center',      // по центру по горизонтали
    justifyContent: 'center',  // центруем по вертикали
  },
  cameraCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,            // больше отступ от камеры
    paddingHorizontal: 16,
  },
  mainText: {
    fontSize: 22,
    fontWeight: '600',
  },
  subText: {
    fontSize: 18,
    color: '#888',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: BOTTOM_OFFSET,
    width: '100%',
    alignItems: 'center',
  },
  heart: {
    width: HEART_SIZE,
    height: HEART_SIZE,
    resizeMode: 'contain',
  },
});

