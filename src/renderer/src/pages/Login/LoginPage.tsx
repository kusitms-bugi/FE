import HeroSection from './components/HeroSection';
import LoginForm from './components/Loginforrm';

const LoginPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="hbp:mx-auto hbp:max-w-screen-lg hbp:px-10 relative w-full overflow-visible">
        <section className="hbp:gap-15 hbp:px-20 flex h-screen w-full flex-col items-center justify-center gap-12 px-7">
          <HeroSection />
          <LoginForm />
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
