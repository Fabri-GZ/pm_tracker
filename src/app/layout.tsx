import type { Metadata } from 'next'
import { Unbounded, Poppins } from 'next/font/google'
import { ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Avalon World Agency',
  description: 'Digital Marketing Agency',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${unbounded.variable} ${poppins.variable}`}>
      <body className="antialiased">
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme="colored"
          transition={Slide}
        />
      </body>
    </html>
  )
}
