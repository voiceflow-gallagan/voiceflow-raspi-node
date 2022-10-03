module.exports = {
  apps: [
    {
      name: 'RasPiAssistant',
      script: 'index.js',
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
    },
  ],
}
