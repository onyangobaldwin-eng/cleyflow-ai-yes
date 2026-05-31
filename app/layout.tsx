export const metadata = {
  title: "CleyFlow AI",
  description: "AI-powered omnichannel CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
