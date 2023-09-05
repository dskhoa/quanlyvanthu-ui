/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: 'jit',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            boxShadow: {
                right: '2px 0 2px 0 rgba(0,0,0,0.3)',
                '4Way': '0 3px 10px rgba(0, 0, 0, 0.2)',
            },
            transitionProperty: {
                height: 'max-height',
                width: 'width',
            },
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(-140px)',
                    },

                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease',
            },
        },
    },
    plugins: [],
};
