import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
       <Navbar /> 
      <main className="min-h-screen">{children}</main>
       <Footer />
      <WhatsAppButton />
    </>
  );
}
