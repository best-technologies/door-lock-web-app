import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Secure Access
            <span className="block text-primary-500">Management System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
            Take full control of your smart door lock system. Manage access with fingerprint,
            RFID cards, and passcodes—all from one powerful admin dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-600 hover:shadow-xl"
            >
              Access Dashboard
            </Link>
            <Link
              href="#features"
              className="rounded-lg border-2 border-primary-500 bg-transparent px-8 py-3 text-base font-semibold text-primary-500 transition-all hover:bg-primary-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary-200 opacity-20 blur-3xl"></div>
    </section>
  );
}



