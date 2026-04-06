import "./globals.css";
import { AuthProvider } from "./lib/AuthContext";

export const metadata = {
  title: "EstateHub — Buy & Rent Properties",
  description: "Full-stack real estate platform. Browse, buy, and rent properties.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
