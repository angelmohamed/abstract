/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "polymarket-upload.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",  // Add this line
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",  // Add this line
      },
      {
        protocol: "http",
        hostname: "localhost",  // Add this line
        port: "3001",
      },
    ],
  },
};

export default nextConfig;
