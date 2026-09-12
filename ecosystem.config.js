/**
 * ecosystem.config.js
 * PM2 Process Management Configuration for Bumi Warga Enterprise Monolith
 * Target Environment: Hostinger Cloud / Ubuntu VPS (Sukabumi Smart City)
 */

module.exports = {
  apps: [
    {
      name: 'bumi-warga-monolith',
      script: 'server.js',
      instances: process.env.PM2_INSTANCES || 2, // 2 instances / cluster for high availability
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M', // Auto-recycle worker if memory leaks exceed 500MB
      kill_timeout: 5000,         // 5 seconds graceful connection shutdown
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Centralized logs
      output: './logs/pm2-out.log',
      error: './logs/pm2-err.log',
      merge_logs: true,
      time: true
    }
  ]
};
