/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "t3.ftcdn.net",
        port: "",
        pathname:
          "/jpg/09/60/61/80/240_F_960618068_W27RcIlTMT6aBSgfiVa8fanBr5GJWHqV.jpg",
      },
    ],
  },
};

export default nextConfig;
