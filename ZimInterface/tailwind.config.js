/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{js,jsx,ts,tsx}',
],
theme: {
extend: {
colors: {
brand: {
50: '#eef9f7',
100: '#d6f1ec',
200: '#b1e4da',
300: '#85d4c5',
400: '#51bfa9',
500: '#2aa891',
600: '#1c8b78',
700: '#176f61',
800: '#145a4f',
900: '#124b42',
}
},
boxShadow: {
soft: '0 10px 30px rgba(0,0,0,0.08)'
},
borderRadius: {
'2xl': '1rem'
}
},
},
plugins: [],
}

