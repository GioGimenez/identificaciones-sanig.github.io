import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Panel administrativo</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresá con tu usuario administrador para gestionar el blog.</p>

        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}

        <form action={login} className="auth-form">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <button type="submit" className="button">
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
