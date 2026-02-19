import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { t, withLocale } from "@/lib/i18n";

import { Button, Card, CardContent, Input } from "~/components/ui";
import { LOCKER_IMAGE, LOGIN_IMAGE } from "~/constants/login-page.constants";
import Logo from "~/assets/images/logo/Logo.svg";

export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = React.useState<string>("admin@laundry.com");
  const [password, setPassword] = React.useState<string>("admin123");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(withLocale("/admin/dashboard"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-transparent to-orange-200  relative overflow-hidden w-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <g fill="url(#g1)" opacity="0.06">
          <path d="M0 400 C200 300 400 500 600 420 C800 340 1000 480 1200 420 L1200 800 L0 800 Z" />
          <path d="M0 500 C250 420 450 620 700 540 C950 460 1100 640 1200 580 L1200 800 L0 800 Z" />
        </g>
      </svg>

      <div className="relative z-10 w-full max-w-6xl mx-6 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <Card className="bg-white p-8 md:p-12">
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="Logo" className="h-16 w-auto" />
              <div>
                <div className="text-2xl font-bold">{t("brand.title")}</div>
                <div className="text-sm text-muted-foreground">{t("brand.subtitle")}</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold">{t("signin.title")}</h2>

            <form onSubmit={handleSubmit} className="grid gap-4 w-full max-w-md">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{t("label.email")}</span>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("placeholder.email")} className="mt-2" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{t("label.password")}</span>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t("placeholder.password")} className="mt-2" />
              </label>

              <div className="flex items-center justify-between mt-2">
                <Button type="submit" size="lg" disabled={loading} className="rounded-2xl bg-blue-900 hover:bg-blue-400">{loading ? 'Signing in...' : 'Login'}</Button>
                <Link to={withLocale("/auth/forgot")} className="text-sm text-blue-800 hover:underline">{t("link.forgot")}</Link>
              </div>
            </form>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <p className="text-sm text-gray-500">{t("info.devHint")}</p>
          </CardContent>
        </Card>

        <div className="relative flex items-center justify-center p-8 md:p-12 bg-linear-to-br from-primary to-secondary text-white">
          <Card className="bg-transparent shadow-none">
            <CardContent className="max-w-sm text-white text-center">
              <div className="mb-6">
                <img src={Logo} alt="Logo" className="h-32 w-auto mx-auto drop-shadow-lg" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{t("right.title")}</h3>
              <p className="mb-4 text-sm opacity-90">{t("right.subtitle")}</p>

              <div className="w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm relative">
                <img src={LOGIN_IMAGE} alt="Locker illustration" className="w-full h-auto rounded-4xl opacity-80" />
                <img
                  src={LOCKER_IMAGE}
                  alt="locker overlay"
                  className="pointer-events-none absolute -bottom-4 -left-5 w-30 md:w-40 opacity-80 rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
