'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
    const isAuthPage = pathname.toLowerCase() === '/login' || pathname.toLowerCase() === '/forgot' || pathname.toLowerCase() === '/signup';
  
    if (!tokenData?.accessToken && !isAuthPage) {
      router.push('/Login');
      return;
    }
  
    // Set token to axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData?.accessToken}`;
  
    // Axios response interceptor
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response && error.response.status === 401) {
          try {
            const storedToken = JSON.parse(localStorage.getItem('camrilla_token'));
            const refreshToken = storedToken?.refreshToken;
    
            if (!refreshToken) throw new Error("No refresh token");
    
            const axiosInstance = axios.create(); // no headers
            const res = await axiosInstance.post('http://api.camrilla.com/user/update-access-token', {
              refreshToken: refreshToken,
            });
    
            const newAccessToken = res.data?.data?.token?.accessToken;
            const newRefreshToken = res.data?.data?.token?.refreshToken;
    
            if (newAccessToken && newRefreshToken) {
              localStorage.setItem('camrilla_token', JSON.stringify({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
              }));
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
              console.log("🔄 Access token refreshed");
              return axios(error.config);
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (refreshError) {
            console.error("🚫 Token refresh failed", refreshError);
            localStorage.clear();
            router.push('/Login');
          }
        }
        return Promise.reject(error);
      }
    );
    
  
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [pathname, router]);


  const isAuthPage = pathname === '/Login' || pathname === '/Forgot' || pathname === '/Signup'

  return (
    <html lang="en"
    className="light-style layout-wide customizer-hide"
    dir="ltr"
    data-theme="theme-default"
    data-assets-path="/assets/"
    data-template="vertical-menu-template"
    data-style="light">
      <head>

        <link rel="icon" type="image/x-icon" href="/assets/img/favicon/favicon.ico" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&ampdisplay=swap"
          rel="stylesheet" />

        <link rel="stylesheet" href="/assets/vendor/fonts/remixicon/remixicon.css" />
        <link rel="stylesheet" href="/assets/vendor/fonts/flag-icons.css" />

        <link rel="stylesheet" href="/assets/vendor/libs/node-waves/node-waves.css" />

        <link rel="stylesheet" href="/assets/vendor/css/rtl/core.css" className="template-customizer-core-css" />
        <link rel="stylesheet" href="/assets/vendor/css/rtl/theme-default.css" className="template-customizer-theme-css" />
        <link rel="stylesheet" href="/assets/css/demo.css" />

        <link rel="stylesheet" href="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <link rel="stylesheet" href="/assets/vendor/libs/typeahead-js/typeahead.css" />

        <link rel="stylesheet" href="/assets/vendor/libs/@form-validation/form-validation.css" />

        <link rel="stylesheet" href="/assets/vendor/css/pages/page-auth.css" />
        <link rel="stylesheet" href="/assets/vendor/css/pages/app-calendar.css" />

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>

        <link rel="stylesheet" href="/assets/vendor/css/pages/page-profile.css" />

        <link rel="stylesheet" href="/assets/vendor/css/pages/page-auth.css" />

        <link rel="stylesheet" href="/assets/vendor/css/pages/page-faq.css" />

        <link rel="stylesheet" href="/assets/vendor/css/pages/page-pricing.css" />

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>

        <Script src="/assets/vendor/js/helpers.js" strategy="beforeInteractive" />
        <Script src="/assets/vendor/js/template-customizer.js" strategy="beforeInteractive" />
        <Script src="/assets/js/config.js" strategy="beforeInteractive" />

        <Script src="/assets/vendor/libs/jquery/jquery.js" />
        <Script src="/assets/vendor/libs/popper/popper.js" />
        <Script src="/assets/vendor/js/bootstrap.js" />
        <Script src="/assets/vendor/libs/node-waves/node-waves.js" />
        <Script src="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" />
        <Script src="/assets/vendor/libs/hammer/hammer.js" />
        <Script src="/assets/vendor/libs/i18n/i18n.js" />
        <Script src="/assets/vendor/libs/typeahead-js/typeahead.js" />
        <Script src="/assets/vendor/js/menu.js" />

        <Script src="/assets/vendor/libs/@form-validation/popular.js" />
        <Script src="/assets/vendor/libs/@form-validation/bootstrap5.js" />
        <Script src="/assets/vendor/libs/@form-validation/auto-focus.js" />


        <Script src="/assets/js/main.js" />

        <Script src="/assets/js/pages-auth.js" />

        <Script src="/assets/js/pages-profile-user.js"/>

        <Script src="/assets/js/pages-auth.js" />
        <Script src="/assets//js/pages-pricing.js" />

        {isAuthPage ? (
          <>{children}</>
        ) : (
          <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
              <Sidebar />
              <div className="layout-page">
                <Navbar />
                <div className="content-wrapper">
                  {children}
                </div>
              </div>
            </div>
          </div>
        )}

      </body>
    </html>
  );
}
