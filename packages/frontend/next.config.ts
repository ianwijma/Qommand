import type {NextConfig} from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    // TODO: We probably need to update the production URL
    basePath: isProd ? '/usr/lib/qommand/resources/app.asar/.vite/renderer/the_window' : '',
};

export default nextConfig;
