import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-primary-500 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Access your admin dashboard and start managing your door lock system today.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary-500 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}



