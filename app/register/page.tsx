import TelegramRegistrationForm from '@/components/TelegramRegistrationForm';

export const metadata = {
  title: 'Ro\'yxatdan o\'tish - Muallim Abu Bakr',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <TelegramRegistrationForm />
    </main>
  );
}
