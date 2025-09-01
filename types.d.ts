declare module 'next-pwa' {
  import { NextConfig } from 'next'
  
  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    runtimeCaching?: any[]
  }
  
  function withPWA(config: NextConfig): NextConfig
  function withPWA(pwaConfig: PWAConfig): (config: NextConfig) => NextConfig
  
  export = withPWA
}

declare module '@next/bundle-analyzer' {
  import { NextConfig } from 'next'
  
  function withBundleAnalyzer(config: {
    enabled?: boolean
  }): (config: NextConfig) => NextConfig
  
  export = withBundleAnalyzer
}
