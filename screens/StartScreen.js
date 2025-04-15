import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  // Ссылка на ScrollView для пролистывания
  const scrollViewRef = useRef(null);

  // Animated.Value для отслеживания горизонтальной прокрутки
  const scrollX = useRef(new Animated.Value(0)).current;

  // Функция для пролистывания к слайду с индексом "page"
  const scrollToPage = (page) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: width * page, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* ================== Слайд 1 ================== */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              {/* Вектор в левом верхнем углу */}
              <Image
                source={require('../assets/WelcomeScreen/Vector22.png')}
                style={styles.vectorImage}
                resizeMode="contain"
              />
              {/* Телефон (Frame) */}
              <Image
                source={require('../assets/WelcomeScreen/Frame.png')}
                style={styles.frameImage}
                resizeMode="contain"
              />
              {/* Сердце (Heart) */}
              <Image
                source={require('../assets/WelcomeScreen/Heart.png')}
                style={styles.heartImage}
                resizeMode="contain"
              />

              {/* Прямоугольник (Rectangle) снизу + текст + кнопка */}
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

        {/* ================== Слайд 2 ================== */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              {/* Face в правом верхнем углу */}
              <Image
                source={require('../assets/WelcomeScreen/face.png')}
                style={styles.faceImage}
                resizeMode="contain"
              />
              {/* Smile (розовый смайлик) - слева над телефоном */}
              <Image
                source={require('../assets/WelcomeScreen/Smile.png')}
                style={styles.smileImage}
                resizeMode="contain"
              />
              {/* Второй смайлик - справа внизу */}
              <Image
                source={require('../assets/WelcomeScreen/Smile2.png')}
                style={styles.smileImage2}
                resizeMode="contain"
              />
              {/* Телефон (Frame2) */}
              <Image
                source={require('../assets/WelcomeScreen/Frame2.png')}
                style={styles.frameImage2}
                resizeMode="contain"
              />
              {/* Прямоугольник (Rectangle) снизу + текст + кнопка */}
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

        {/* ================== Слайд 3 ================== */}
        <View style={{ width }}>
          <View style={styles.redBackground}>
            <View style={styles.overlayContainer}>
              {/* Телефон (Frame3) */}
              <Image
                source={require('../assets/WelcomeScreen/Frame3.png')}
                style={styles.frameImage3}
                resizeMode="contain"
              />
               {/* Сердце (Heart) */}
               <Image
                source={require('../assets/WelcomeScreen/Heart.png')}
                style={styles.heartImage}
                resizeMode="contain"
              />
              {/* Прямоугольник (Rectangle) снизу + текст + кнопка */}
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
                    onPress={() => {}}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ================== Page Control ================== */}
      <View style={styles.pagination}>
        {[0, 1, 2].map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 30, 8],
            extrapolate: 'clamp'
          });

          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#cccccc', '#FF4656', '#cccccc'],
            extrapolate: 'clamp'
          });

          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  backgroundColor: dotColor
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ========== Общие стили ========== */
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  redBackground: {
    flex: 1,
    backgroundColor: 'rgb(253, 68, 82)'
  },
  overlayContainer: {
    flex: 1,
    position: 'relative'
  },

  /* ========== Слайд 1 ========== */
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

  /* ========== Слайд 2 ========== */
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

  /* ========== Слайд 3 ========== */
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

  /* ========== Общие элементы (Rectangle, текст) ========== */
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
    fontWeight: 'bold'
  },

  /* ========== Page Control (3 индикатора) ========== */
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
