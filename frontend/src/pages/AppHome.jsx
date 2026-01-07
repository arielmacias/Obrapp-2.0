import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const AppHome = () => {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <Card className="max-w-xl">
        <h2 className="text-xl font-semibold text-text">Sesión iniciada</h2>
        <p className="mt-2 text-sm text-muted">
          Hola, <span className="font-semibold text-text">{user?.nombre}</span>
        </p>
        <p className="mt-6 text-sm text-muted">
          Siguiente: Obras (próximo sprint)
        </p>
      </Card>
    </main>
  );
};

export default AppHome;
