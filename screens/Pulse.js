import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

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
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        flash={flashMode}
        mode={cameraMode}
        zoom={zoom}
      >
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={zoom}
          onValueChange={setZoom}
        />
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setCameraMode('picture')}>
            <Ionicons name="camera-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setCameraMode('video')}>
            <Ionicons name="videocam-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
            <Ionicons name={flashMode === 'on' ? 'flash-outline' : 'flash-off-outline'} size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.shutterContainer}>
          {cameraMode === 'picture' ? (
            <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
              <Ionicons name="aperture-outline" size={48} color="white" />
            </TouchableOpacity>
          ) : recording ? (
            <TouchableOpacity onPress={stopRecording} style={styles.shutterBtn}>
              <Ionicons name="stop-circle-outline" size={48} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={styles.shutterBtn}>
              <Ionicons name="play-circle-outline" size={48} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  slider: { width: '100%', height: 40, position: 'absolute', top: '75%' },
  topControls: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'transparent', margin: 20 },
  controlBtn: { alignSelf: 'flex-end', padding: 10 },
  shutterContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 20 },
  shutterBtn: { alignItems: 'center' },
  imageContainer: { flex: 1 },
  preview: { flex: 1, width: '100%' },
  btnContainer: { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#fff' },
  btn: { padding: 10 },
});
