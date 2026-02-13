/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Match Voble web colors
                background: 'hsl(0, 0%, 100%)',
                foreground: 'hsl(222.2, 84%, 4.9%)',
                primary: 'hsl(221.2, 83.2%, 53.3%)',
                'primary-foreground': 'hsl(210, 40%, 98%)',
                muted: 'hsl(210, 40%, 96.1%)',
                'muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
                border: 'hsl(214.3, 31.8%, 91.4%)',
                card: 'hsl(0, 0%, 100%)',
                amber: {
                    50: '#fffbeb',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                purple: {
                    500: '#8b5cf6',
                    600: '#7c3aed',
                },
            },
        },
    },
    plugins: [],
}
