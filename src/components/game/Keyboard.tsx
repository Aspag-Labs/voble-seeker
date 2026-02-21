import React from 'react';
import { View, Text, Pressable, Dimensions, useColorScheme } from 'react-native';
import { Delete } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const KEYBOARD_PADDING = 12;
const KEY_GAP = 5;

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

type KeyState = 'correct' | 'present' | 'absent' | 'unused';

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    keyStates: Record<string, KeyState>;
    disabled?: boolean;
}

const getKeyStyle = (state: KeyState, isDark: boolean) => {
    switch (state) {
        case 'correct':
            return 'bg-[#14F195]';
        case 'present':
            return 'bg-[#9945FF]';
        case 'absent':
            return 'bg-gray-500';
        default:
            return isDark ? 'bg-slate-700 border border-slate-600' : 'bg-slate-200 border border-slate-300';
    }
};

const getTextColor = (state: KeyState, isDark: boolean) => {
    if (state === 'correct' || state === 'present' || state === 'absent') {
        return '#ffffff';
    }
    return isDark ? '#e2e8f0' : '#1e293b';
};

export function Keyboard({ onKeyPress, keyStates, disabled }: KeyboardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getKeyWidth = (key: string, rowLength: number) => {
        const availableWidth = screenWidth - KEYBOARD_PADDING * 2;
        const baseWidth = (availableWidth - KEY_GAP * (rowLength - 1)) / rowLength;

        if (key === 'ENTER' || key === 'BACKSPACE') {
            return baseWidth * 1.5;
        }
        return baseWidth;
    };

    const renderKey = (key: string, rowLength: number) => {
        const state = (keyStates[key] as KeyState) || 'unused';
        const keyWidth = getKeyWidth(key, rowLength);
        const textColor = getTextColor(state, isDark);

        return (
            <Pressable
                key={key}
                onPress={() => !disabled && onKeyPress(key)}
                disabled={disabled}
                className={`
          justify-center items-center rounded-lg
          ${getKeyStyle(state, isDark)}
          ${disabled ? 'opacity-50' : 'active:scale-95'}
        `}
                style={{
                    width: keyWidth,
                    height: 52,
                    marginHorizontal: KEY_GAP / 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                }}
            >
                {key === 'BACKSPACE' ? (
                    <Delete size={22} color={textColor} />
                ) : key === 'ENTER' ? (
                    <Text style={{ color: textColor, fontWeight: '700', fontSize: 11 }}>
                        ENTER
                    </Text>
                ) : (
                    <Text style={{ color: textColor, fontWeight: '700', fontSize: 18 }}>
                        {key}
                    </Text>
                )}
            </Pressable>
        );
    };

    return (
        <View className={`px-3 pb-6 pt-2 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    className="flex-row justify-center mb-1.5"
                >
                    {row.map((key) => renderKey(key, row.length))}
                </View>
            ))}
        </View>
    );
}

export default Keyboard;
