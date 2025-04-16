/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        ENV: process.env.ENV,
        NEXT_PUBLIC_DEV_API_URL: process.env.NEXT_PUBLIC_DEV_API_URL,
        NEXT_PUBLIC_DEV_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_DEV_RAZORPAY_KEY_ID,
        NEXT_PUBLIC_DEV_EXTENSION_ID: process.env.NEXT_PUBLIC_DEV_EXTENSION_ID,
        NEXT_PUBLIC_PROD_API_URL: process.env.NEXT_PUBLIC_PROD_API_URL,
        NEXT_PUBLIC_PROD_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_PROD_RAZORPAY_KEY_ID,
        NEXT_PUBLIC_PROD_EXTENSION_ID: process.env.NEXT_PUBLIC_PROD_EXTENSION_ID,
    }
};

export default nextConfig;