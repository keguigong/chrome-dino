const basePath = process.env.NODE_ENV === "production" ? "/chrome-dino" : ""
const assetPrefix = process.env.NODE_ENV === "production" ? "/chrome-dino" : "/"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath,
  assetPrefix
}

module.exports = nextConfig
