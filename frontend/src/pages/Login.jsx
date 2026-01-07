import { useState } from "react";

import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Brand from "../components/Brand.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, authError, setAuthError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      await login(form);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <Card className="max-w-md">
        <div className="mb-6 flex flex-col gap-2">
          <Brand />
          <h1 className="text-2xl font-semibold text-text">Inicia sesión</h1>
          <p className="text-sm text-muted">Control y claridad en obra.</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@obrapp.local"
            autoComplete="email"
            autoFocus
            required
          />
          <Input
            id="password"
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-semibold text-accent"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            }
          />

          {authError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {authError}
            </div>
          ) : null}

          <Button type="submit" isLoading={loading}>
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default Login;
