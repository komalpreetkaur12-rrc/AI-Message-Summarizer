# backend runs with frontend automatically
--I added concurrently in package.json file so that both ends runs in one command 
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",

  "backend": "npm run dev --prefix ../backend",
  "start": "concurrently \"npm run backend\" \"npm run dev\""
},

# use google gemini api key in .env file 
--GEMINI_API_KEY=AIzaSyDay0Mt7DH4d1wtJblYJjbFzNjF8nywyQ8
