import React from 'react';
import { View, Text, Dimensions, useColorScheme } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const GRID_PADDING = 20;
const TILE_GAP = 6;
const COLS = 6;

type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

interface TileData {
    letter: string;
    state: TileState;
}

interface GameGridProps {
    grid: TileData[][];
    currentRow: number;
    currentCol: number;
}

const getTileStyle = (state: TileState, isCurrentRow: boolean, isDark: boolean) => {
    const baseStyle = 'justify-center items-center rounded-xl';

    switch (state) {
        case 'correct':
            return `${baseStyle} bg-[#14F195]`;
        case 'present':
            return `${baseStyle} bg-[#9945FF]`;
        case 'absent':
            return `${baseStyle} bg-gray-500`;
        case 'filled':
            return `${baseStyle} ${isDark ? 'bg-slate-700 border-2 border-slate-600' : 'bg-white border-2 border-slate-300'}`;
        default:
            if (isCurrentRow) {
                return `${baseStyle} ${isDark ? 'bg-slate-800 border-2 border-slate-500' : 'bg-white border-2 border-slate-300'}`;
            }
            return `${baseStyle} ${isDark ? 'bg-slate-800 border-2 border-slate-700' : 'bg-white border-2 border-slate-200'}`;
    }
};

const getTextStyle = (state: TileState, isDark: boolean) => {
    if (state === 'correct' || state === 'present' || state === 'absent') {
        return 'text-white';
    }
    return isDark ? 'text-slate-100' : 'text-slate-800';
};

function Tile({ letter, state, isCurrentRow, isDark }: TileData & { isCurrentRow: boolean; isDark: boolean }) {
    const tileSize = (screenWidth - GRID_PADDING * 2 - TILE_GAP * (COLS - 1)) / COLS;

    return (
        <View
            className={getTileStyle(state, isCurrentRow, isDark)}
            style={{
                width: tileSize,
                height: tileSize,
                marginRight: TILE_GAP,
                ...(state !== 'empty' && {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                }),
            }}
        >
            <Text
                className={`text-2xl font-black uppercase ${getTextStyle(state, isDark)}`}
                style={{ letterSpacing: 1 }}
            >
                {letter}
            </Text>
        </View>
    );
}

export function GameGrid({ grid, currentRow, currentCol }: GameGridProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="items-center px-5 py-6">
            <View className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-800/50 border border-zinc-800' : 'bg-zinc-100 border border-zinc-200'}`}>
                {grid.map((row, rowIndex) => (
                    <View
                        key={rowIndex}
                        className="flex-row mb-1.5"
                    >
                        {row.map((tile, colIndex) => (
                            <Tile
                                key={`${rowIndex}-${colIndex}`}
                                letter={tile.letter}
                                state={tile.state}
                                isCurrentRow={rowIndex === currentRow}
                                isDark={isDark}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

export default GameGrid;
