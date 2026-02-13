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
            return `${baseStyle} bg-emerald-500`;
        case 'present':
            return `${baseStyle} bg-amber-500`;
        case 'absent':
            return `${baseStyle} ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`;
        case 'filled':
            return `${baseStyle} ${isDark ? 'bg-slate-700 border-2 border-indigo-400' : 'bg-white border-2 border-indigo-400'}`;
        default:
            if (isCurrentRow) {
                return `${baseStyle} ${isDark ? 'bg-slate-800 border-2 border-slate-500' : 'bg-slate-100 border-2 border-slate-300'}`;
            }
            return `${baseStyle} ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-100 border border-slate-200'}`;
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
    );
}

export default GameGrid;
