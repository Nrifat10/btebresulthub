import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <div className="text-6xl font-extrabold text-brand-600">404</div>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
