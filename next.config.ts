// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/devtools-ignore.json', // optional dummy static file
      },
      
    ]
  },
  // images: {
  //   domains: ['www.uber-assets.com'], // ✅ Add allowed image domains here
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.uber-assets.com',
      },
    ],
  },
}
