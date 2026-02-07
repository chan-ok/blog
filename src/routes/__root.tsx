import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chanho's dev blog</title>

        {/* Google Fonts (영어, 한국어, 일본어) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* Cloudflare Turnstile */}
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          defer
        />
      </head>
      <body className="relative isolate antialiased font-noto-sans">
        <Outlet />
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-right" />
        )}
      </body>
    </html>
  );
}
