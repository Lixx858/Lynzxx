import "./globals.css";

export const metadata = {
  title: "IX B Bersinar | SMP Negeri 1 Puri",
  description: "Website resmi kelas IX B SMP Negeri 1 Puri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
