// Main.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 20;
const CARD_PADDING = 20;

// Смайлики и подписи
const EMOJI_OPTIONS = [
  { label: 'Terrible', icon: require('../assets/Main/face1.png') },
  { label: 'Bad',      icon: require('../assets/Main/face2.png') },
  { label: 'Okay',     icon: require('../assets/Main/face3.png') },
  { label: 'Good',     icon: require('../assets/Main/face4.png') },
  { label: 'Great',    icon: require('../assets/Main/face5.png') },
];

// Данные для графика (с тремя зонами)
const chartData = {
  labels: ['1 AM','4 AM','7 AM','10 AM','1 PM','4 PM','7 PM'],
  datasets: [{
    data: [50, 68, 85, 95, 73, 110, 55]
  }]
};

// Конфиг для сетки и подписей
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: () => `rgba(0,0,0,0.2)`,
  labelColor: () => '#aaa',
  propsForBackgroundLines: { strokeWidth: 1, stroke: '#eee' },
};
export default function Main() {
  const [selected, setSelected] = useState(2);
  const cardWidth  = width - CARD_MARGIN * 2;
  const innerWidth = cardWidth - CARD_PADDING * 2;

  // Задаём желаемую ширину одного «шага» (отступ + бар)
  const perStep = 60; 
  // Динамически считаем полную ширину графика
  const chartWidth = perStep * chartData.labels.length;

  // Бар будет занимать часть от perStep
  const barPerc       = 0.3;
  const pillBarRadius = (perStep * barPerc) / 2;
  
    // статистика
    const values = chartData.datasets[0].data;
    const avg    = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    const mx     = Math.max(...values);
    const mn     = Math.min(...values);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* TOP HEADER */}
        <View style={styles.topHeader}>
          <Text style={styles.topHeaderTitle}>Favorite Heart Monitor</Text>
        </View>

        {/* MOOD CARD */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrapper}>
                <Image
                  source={EMOJI_OPTIONS[selected].icon}
                  style={styles.headerIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.headerTitle}>Your condition</Text>
            </View>
            <Image
              source={require('../assets/Main/arrow.png')}
              style={styles.headerArrow}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((opt, idx) => {
              const isActive = idx === selected;
              const tint = ['#FF4656','#FFA347','#5A75FF','#2CEAFF','#47E38C'][idx];
              const size = (width - CARD_MARGIN*2 - 16*4) / 5;
              return (
                <TouchableOpacity
                  key={idx}
                  style={{ alignItems: 'center', width: size }}
                  onPress={() => setSelected(idx)}
                >
                  <Image
                    source={opt.icon}
                    style={{
                      width: size,
                      height: size,
                      tintColor: isActive ? tint : '#C7C7CC',
                      marginBottom: 4
                    }}
                  />
                  <Text style={{
                    fontSize: 12,
                    color: isActive ? tint : '#C7C7CC'
                  }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: ['#FF4656','#FFA347','#5A75FF','#2CEAFF','#47E38C'][selected] }]}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Acknowledge</Text>
          </TouchableOpacity>
        </View>

         {/* Chart card */}
         <View style={[styles.card, { marginTop: 24 }]}>
  <Text style={styles.chartDate}>22 August</Text>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    // добавляем padding-слева и справа, чтобы график начинался и заканчивался с отступом внутри карточки
    contentContainerStyle={{
      right: '10%'
    }}
    // сдвигаем начальную позицию прокрутки вправо на pillBarRadius,
    // чтоб сама «полезная зона» графика оказалась левее
    contentOffset={{ x: pillBarRadius, y: 0 }}
  >
    <BarChart
      data={chartData}
      width={perStep * chartData.labels.length}  // динамическая ширина
      height={220}
      fromZero
      showValuesOnTopOfBars
      withCustomBarColorFromData
      flatColor={false}
      barPercentage={barPerc}
      barRadius={pillBarRadius}
      getBarColor={v =>
        v > 90   ? '#FF4656'
      : v >= 60 ? '#47E38C'
                : '#FFE066'
      }
      chartConfig={chartConfig}
      style={{
        marginVertical: 8,
        borderRadius: 12,
      }}
    />
  </ScrollView>
          {/* статистика под графиком */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{avg}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={styles.statValue}>{mx}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={styles.statValue}>{mn}</Text>
            </View>
          </View>

          {/* легенда */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFE066' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#47E38C' }]} />
              <Text style={styles.legendText}>Normal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF4656' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  topHeader: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF4656',
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: CARD_PADDING,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4656',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4656',
  },
  headerArrow: {
    width: 16,
    height: 16,
    tintColor: '#FF4656',
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
});
