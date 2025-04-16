import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  const navigation = useNavigation(); // Получаем навигацию
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Текущее положение “страницы” обновляется по окончании анимации перелистывания
  const [currentIndex, setCurrentIndex] = useState(0);
  // Показ крестика на слайде 4 (индекс 3)
  const [showClose, setShowClose] = useState(false);

  // Функция программного перелистывания
  const scrollToPage = (page) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * page, animated: true });
    }
  };

  // Функция запроса разрешения на использование камеры через expo‑camera  
  // После запроса (независимо от результата) переходим на экран Main
  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission not granted');
        Alert.alert('Доступ к камере отклонён', 'Вы отклонили запрос на доступ к камере.');
      }
    } catch (error) {
      console.error('Ошибка запроса разрешения камеры:', error);
    }
    navigation.replace('Main');
  };

  // Обновляем currentIndex по завершении анимации перелистывания
  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  // Если зашли на слайд 4 (индекс 3) — через 3 секунды показываем крестик
  useEffect(() => {
    if (currentIndex === 3) {
      setShowClose(false);
      const timerId = setTimeout(() => {
        setShowClose(true);
      }, 3000);
      return () => clearTimeout(timerId);
    } else {
      setShowClose(false);
    }
  }, [currentIndex]);

  // Преобразуем scrollX так, чтобы пропустить неотображаемый слайд (индекс 3) в page control.
  // При переходе: слайд 0 -> значение 0, слайд 1 -> 1, слайд 2 и 3 -> 2, слайд 4 -> 3.
  const pageScrollX = scrollX.interpolate({
    inputRange: [0, width, 2 * width, 3 * width, 4 * width],
    outputRange: [0, 1, 2, 2, 3],
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}  // Отключаем перелистывание свайпом
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {/* Слайд 1 (индекс 0) */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              <Image
                source={require('../assets/WelcomeScreen/Vector22.png')}
                style={styles.vectorImage}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Frame.png')}
                style={styles.frameImage}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Heart.png')}
                style={styles.heartImage}
                resizeMode="contain"
              />
              <View style={styles.rectangleContainer}>
                <Image
                  source={require('../assets/WelcomeScreen/Rectangle.png')}
                  style={styles.rectangleImage}
                  resizeMode="stretch"
                />
                <View style={styles.textOnRectangle}>
                  <Text style={styles.bpmTitle}>BPM at your fingertips</Text>
                  <Text style={styles.bpmSubtitle}>
                    One tap to measure, one step to better health
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => scrollToPage(1)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Слайд 2 (индекс 1) */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              <Image
                source={require('../assets/WelcomeScreen/face.png')}
                style={styles.faceImage}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Smile.png')}
                style={styles.smileImage}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Smile2.png')}
                style={styles.smileImage2}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Frame2.png')}
                style={styles.frameImage2}
                resizeMode="contain"
              />
              <View style={styles.rectangleContainer}>
                <Image
                  source={require('../assets/WelcomeScreen/Rectangle.png')}
                  style={styles.rectangleImage}
                  resizeMode="stretch"
                />
                <View style={styles.textOnRectangle}>
                  <Text style={styles.bpmTitle}>
                    Stay in harmony with{'\n'}yourself
                  </Text>
                  <Text style={styles.bpmSubtitle}>
                    Easily track and analyse your daily wellbeing
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton2}
                    onPress={() => scrollToPage(2)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Слайд 3 (индекс 2) */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              <Image
                source={require('../assets/WelcomeScreen/Frame3.png')}
                style={styles.frameImage3}
                resizeMode="contain"
              />
              <Image
                source={require('../assets/WelcomeScreen/Heart.png')}
                style={styles.heartImage}
                resizeMode="contain"
              />
              <View style={styles.rectangleContainer}>
                <Image
                  source={require('../assets/WelcomeScreen/Rectangle.png')}
                  style={styles.rectangleImage}
                  resizeMode="stretch"
                />
                <View style={styles.textOnRectangle}>
                  <Text style={styles.bpmTitle}>See the big picture</Text>
                  <Text style={styles.bpmSubtitle}>
                    Track heart rate and well-being trends with easy-{'\n'}to-understand statistics.
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton3}
                    onPress={() => scrollToPage(3)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Слайд 4 (индекс 3, вне page control) */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              <Image
                source={require('../assets/WelcomeScreen/Frame4.png')}
                style={styles.frameImage4}
                resizeMode="contain"
              />
              <View style={styles.rectangleContainer}>
                <Image
                  source={require('../assets/WelcomeScreen/Rectangle.png')}
                  style={styles.rectangleImage}
                  resizeMode="stretch"
                />
                <View style={styles.textOnRectangle}>
                  <Text style={styles.title4}>Track Heart Rate With No Limits</Text>
                  <Text style={styles.trialTitle}>
                    <Text style={styles.trialRedPart}>3 Days of Trial</Text>, then $6.99/week
                  </Text>
                  <View style={styles.autoRenewContainer}>
                    <Text style={styles.autoRenewText}>
                      Auto renewable. Cancel anytime
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.continueButton4} onPress={() => {}}>
                    <Text style={styles.continueButtonText}>
                      Start your 3 days trial{'\n'}for 6.99$ per week
                    </Text>
                  </TouchableOpacity>
                  {showClose && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => scrollToPage(4)}
                    >
                      <Image
                        source={require('../assets/WelcomeScreen/close.png')}
                        style={styles.closeIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Слайд 5 (индекс 4, снова в page control) */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              <Image
                source={require('../assets/WelcomeScreen/camera.png')}
                style={styles.camera}
                resizeMode="contain"
              />
              <View style={styles.rectangleContainer}>
                <Image
                  source={require('../assets/WelcomeScreen/Rectangle.png')}
                  style={styles.rectangleImage}
                  resizeMode="stretch"
                />
                <View style={styles.textOnRectangle}>
                  <Text style={styles.bpmTitle5}>Camera</Text>
                  <Text style={styles.bpmSubtitle}>
                    For the application to work correctly, we need access to your device's camera.
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton3}
                    onPress={requestCameraPermission}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

       {/* Page Control: отображаем только если currentIndex не равен 3 (слайд 4) */}
       {currentIndex !== 3 && (
        <Animated.View style={styles.pagination}>
          { [0, 1, 2, 3].map(i => {
              const dotWidth = pageScrollX.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [8, 30, 8],
                extrapolate: 'clamp'
              });
              const dotColor = pageScrollX.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: ['#cccccc', '#FF4656', '#cccccc'],
                extrapolate: 'clamp'
              });
              return (
                <Animated.View
                  key={`dot-${i}`}
                  style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
                />
              );
            })
          }
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  redBackground: {
    flex: 1,
    backgroundColor: 'rgb(253, 68, 82)'
  },
  overlayContainer: {
    flex: 1,
    position: 'relative'
  },
  slideTitle: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
    alignSelf: 'center'
  },
  closeButton: {
    position: 'absolute',
    bottom: height * 0.81,
    left: width * 0.05,
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11
  },
  closeIcon: {
    width: '200%',
    height: '200%',
    resizeMode: 'contain'
  },
  vectorImage: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.05,
    width: width * 0.21,
    height: undefined,
    aspectRatio: 80 / 55,
    zIndex: 10
  },
  frameImage: {
    position: 'absolute',
    width: '150%',
    height: undefined,
    aspectRatio: 1,
    top: '18%',
    left: '50%',
    transform: [{ translateX: -0.75 * width }],
    zIndex: 1
  },
  heartImage: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '65%',
    left: '80%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 3
  },
  faceImage: {
    position: 'absolute',
    top: height * 0.06,
    right: width * 0.01,
    width: '25%',
    height: '10%',
    zIndex: 9
  },
  smileImage: {
    position: 'absolute',
    top: '33%',
    right: '80%',
    width: '22%',
    height: undefined,
    aspectRatio: 1,
    zIndex: 10
  },
  smileImage2: {
    position: 'absolute',
    bottom: '30%',
    right: '3%',
    width: '18%',
    height: undefined,
    aspectRatio: 1,
    zIndex: 10,
    transform: [{ rotate: '20deg' }]
  },
  frameImage2: {
    position: 'absolute',
    width: '100%',
    right: '2%',
    height: undefined,
    aspectRatio: 0.46,
    zIndex: 1
  },
  continueButton2: {
    top: '12.5%',
    width: '90%',
    height: '31%',
    backgroundColor: '#FF4656',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  frameImage3: {
    position: 'absolute',
    width: '100%',
    height: undefined,
    aspectRatio: 0.46,
    zIndex: 1
  },
  continueButton3: {
    top: '20%',
    width: '90%',
    height: '33%',
    backgroundColor: '#FF4656',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  frameImage4: {
    position: 'absolute',
    bottom: '12%',
    width: '100%',
    height: undefined,
    aspectRatio: 0.46,
    zIndex: 1
  },
  title4: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12
  },
  trialTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600'
  },
  trialRedPart: {
    color: '#FF4656',
    fontWeight: 'bold'
  },
  autoRenewContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16
  },
  autoRenewText: {
    fontSize: 14,
    color: '#FF4656',
    textAlign: 'center'
  },
  continueButton4: {
    top: '15%',
    height: '35%',
    width: '90%',
    backgroundColor: '#FF4656',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  camera: {
    position: 'absolute',
    width: '100%',
    top: '20%',
    left: '9%',
    transform: [
      { translateX: -(width * 0.2) / 2 },
      { translateY: -(width * 0.2) / 2 },
      { scale: 1.3 }
    ]
  },
  bpmTitle5: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgb(253, 68, 82)',
    marginBottom: 8,
    textAlign: 'center'
  },
  rectangleContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '46%',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  rectangleImage: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  textOnRectangle: {
    marginTop: 160,
    width: '100%',
    alignItems: 'center'
  },
  bpmTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center'
  },
  bpmSubtitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20
  },
  continueButton: {
    top: '35%',
    width: '90%',
    height: '35%',
    backgroundColor: '#FF4656',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  pagination: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  }
});
