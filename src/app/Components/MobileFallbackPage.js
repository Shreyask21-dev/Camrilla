// Components/MobileFallbackPage.js

export default function MobileFallbackPage() {
    return (
        <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center px-6 text-center" style={{marginTop:"25%"}}>
            <img src="/images/logo.png" alt="Camrilla Logo" className="w-24 h-24 mb-6" style={{ width: "40%" }} />
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Please download the Camrilla mobile app</h3>
            <p className="text-gray-600 max-w-md mb-8">
                Our web application is optimized for desktop. For the best experience on mobile, please download our official Camrilla app from the App Store or Google Play Store.
            </p>
            <div className="flex gap-4">
                <a href="https://apps.apple.com/" className="mx-1" target="_blank" rel="noopener noreferrer">
                    <img src="/images/App-Store.png" alt="App Store" className="h-12" style={{ width: "45%" }} />
                </a>
                <a href="https://play.google.com/store" className="mx-1" target="_blank" rel="noopener noreferrer">
                    <img src="/images/Play-Store.png" alt="Play Store" className="h-12" style={{ width: "45%" }} />
                </a>
            </div>
        </div>
    );
}
