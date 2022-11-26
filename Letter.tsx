import {Pressable, StyleSheet, Text} from 'react-native';

type Props = {
  letter: string;
  onPress: (letter: string) => void;
  disabled: boolean;
  width: number;
  height?: number;
};

export default function Letter({
  disabled,
  letter,
  onPress,
  width,
  height,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      style={{
        ...styles.button,
        width: width,
        height: height,
        backgroundColor: disabled ? '#ccc' : '#fff',
      }}
      onPress={() => onPress(letter)}
      android_ripple={{color: '#999'}}>
      <Text style={styles.letter}>{letter}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 24,
  },
});
