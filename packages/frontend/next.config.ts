import type {NextConfig} from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    basePath: isProd ? '/usr/lib/qommand/resources/app.asar/.webpack/renderer' : '',
};

export default nextConfig;
