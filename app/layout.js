import './globals.css';
import { Providers } from './providers';
import { Anton, Inter } from 'next/font/google';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Kaapi Da · Bean to Heart',
  description: 'A bold cold-filter coffee, reimagined in blueberry-purple. Order on Swiggy, Panjim, Goa.',
  themeColor: '#070708',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-[#070708] text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
