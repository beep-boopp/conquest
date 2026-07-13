/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // @privy-io/react-auth statically references these optional integrations
    // (Stripe fiat onramp, Farcaster mini-app support, Solana memo program)
    // that we don't use and haven't installed. Tell webpack to no-op them
    // instead of failing to resolve.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stripe/crypto": false,
      "@farcaster/mini-app-solana": false,
      "@solana-program/memo": false,
    };
    return config;
  },
};

export default nextConfig;
