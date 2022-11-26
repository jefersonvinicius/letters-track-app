import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Dimensions, StyleSheet, Text, View} from 'react-native';
import Sound from 'react-native-sound';
import Letter from './Letter';

const LETTERS: string[] = Array.from({length: 26}).map((_, index) =>
  String.fromCharCode(65 + index),
);

const COLUMNS = 4;
const COLUMNS_WIDTH = Dimensions.get('window').width / COLUMNS;

enum GameStatus {
  WaitingToStart = 'waiting-to-start',
  GameOver = 'game-over',
  Playing = 'playing',
  Finished = 'finished',
}

const INITIAL_TIME = 15;
const TIME_TO_START = 3;

function formatTime(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

export default function App() {
  const [gameStatus, setGameStatus] = useState(GameStatus.WaitingToStart);
  const [lettersSelected, setLettersSelected] = useState<{
    [key: string]: boolean;
  }>({});
  const [gameTime, setGameTime] = useState(INITIAL_TIME);
  const [timeToStart, setTimeToStart] = useState(TIME_TO_START);
  const gameInterval = useRef<number | null>(0);
  const startGameInterval = useRef<number | null>(0);

  const tickSound = useRef<Sound | null>(null);
  useEffect(() => {
    tickSound.current = new Sound('tick.mp3', Sound.MAIN_BUNDLE);
  }, []);

  const stopInterval = useCallback(() => {
    if (gameInterval.current) clearInterval(gameInterval.current);
  }, []);

  const setupCounter = useCallback(() => {
    if (gameInterval.current) clearInterval(gameInterval.current);
    setGameTime(INITIAL_TIME);
    gameInterval.current = setInterval(() => {
      setGameTime(state => {
        const nextTime = Math.max(state - 1, 0);
        if (nextTime === 0) {
          setGameStatus(GameStatus.GameOver);
          stopInterval();
        } else {
          tickSound.current?.play();
        }
        return nextTime;
      });
    }, 1000);
  }, [stopInterval]);

  useEffect(() => {
    return () => {
      if (gameInterval.current) stopInterval();
    };
  }, [stopInterval]);

  useEffect(() => {
    if (Object.keys(lettersSelected).length === LETTERS.length) {
      stopInterval();
      setGameStatus(GameStatus.Finished);
    }
  }, [lettersSelected, stopInterval]);

  useEffect(() => {
    if (gameStatus !== GameStatus.WaitingToStart) return;
    startGameInterval.current = setInterval(() => {
      setTimeToStart(state => {
        if (state <= 0) {
          setLettersSelected({});
          setTimeToStart(TIME_TO_START);
          setGameStatus(GameStatus.Playing);
          setupCounter();
          return state;
        }
        return state - 1;
      });
    }, 1000);

    return () => {
      if (startGameInterval.current) clearInterval(startGameInterval.current);
    };
  }, [gameStatus, setupCounter]);

  function handleLetterPress(letter: string) {
    setLettersSelected(old => ({...old, [letter]: true}));
    setupCounter();
  }

  function handleRestartClick() {
    setGameStatus(GameStatus.WaitingToStart);
  }

  function renderVisorContent() {
    if (gameStatus === GameStatus.GameOver) return 'Perdeu!';
    if (gameStatus === GameStatus.Finished) return 'Acabou!';
    return formatTime(gameTime);
  }

  const [layout, setLayout] = useState(0);
  const height = useMemo(() => {
    if (!layout) return undefined;
    const rowsAmount = Math.ceil(LETTERS.length / COLUMNS);
    return layout / rowsAmount;
  }, [layout]);

  const visorColor = gameTime < 10 ? 'red' : 'black';

  return (
    <View style={styles.container}>
      {gameStatus === GameStatus.WaitingToStart ? (
        <Text style={styles.visorLabel}>
          Começando em{'\n'}
          {formatTime(timeToStart)}...
        </Text>
      ) : (
        <>
          <View style={styles.visorBox}>
            <Text style={[styles.visorLabel, {color: visorColor}]}>
              {renderVisorContent()}
            </Text>
            {[GameStatus.Finished, GameStatus.GameOver].includes(
              gameStatus,
            ) && <Button title="Recomeçar" onPress={handleRestartClick} />}
          </View>
          <View
            style={styles.lettersContainer}
            onLayout={e => setLayout(e.nativeEvent.layout.height)}>
            {LETTERS.map(letter => (
              <Letter
                key={letter}
                letter={letter}
                disabled={lettersSelected[letter]}
                onPress={handleLetterPress}
                width={COLUMNS_WIDTH}
                height={height}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lettersContainer: {
    flex: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
