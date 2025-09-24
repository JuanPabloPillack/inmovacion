import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // <- permite imágenes de Cloudinary
  },
};

export default nextConfig;
