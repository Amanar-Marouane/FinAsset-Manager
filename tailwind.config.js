// export default {
//     content: [
//         './pages/**/*.{js,ts,jsx,tsx}',
//         './components/**/*.{js,ts,jsx,tsx}',
//         './app/**/*.{js,ts,jsx,tsx}',
//     ],
//     theme: {
//         extend: {
//             colors: {
//                 background: 'rgb(var(--background) / <alpha-value>)',
//                 foreground: 'rgb(var(--foreground) / <alpha-value>)',
//                 primary: 'rgb(var(--primary) / <alpha-value>)',
//                 'primary-bold': 'rgb(var(--primary-bold) / <alpha-value>)',
//                 'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
//                 muted: 'rgb(var(--muted) / <alpha-value>)',
//                 border: 'rgb(var(--border) / <alpha-value>)',
//                 'card-bg': 'rgb(var(--card-bg) / <alpha-value>)',
//                 accent: 'rgb(var(--accent) / <alpha-value>)',
//                 success: 'rgb(var(--success) / <alpha-value>)',
//                 warning: 'rgb(var(--warning) / <alpha-value>)',
//                 danger: 'rgb(var(--danger) / <alpha-value>)',
//                 'text-muted-foreground': 'rgb(var(--text-muted-foreground) / <alpha-value>)',
//                 sidebar: 'rgb(var(--sidebar) / <alpha-value>)',
//                 'sidebar-accent': 'rgb(var(--sidebar-accent) / <alpha-value>)',
//                 'sidebar-foreground': 'rgb(var(--sidebar-foreground) / <alpha-value>)',
//                 'sidebar-border': 'rgb(var(--sidebar-border) / <alpha-value>)',
//             },
//         }
//     },
//     darkMode: 'media', // or 'class'
//     plugins: [],
// };
export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}