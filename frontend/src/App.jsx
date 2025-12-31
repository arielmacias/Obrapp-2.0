import { useAuth } from './context/AuthContext';
import { useObra } from './context/ObraContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';

const App = () => {
  const { isAuthenticated } = useAuth();
  const { obraSeleccionada } = useObra();

  if (!isAuthenticated) {
    return (
      <div className="centered">
        <LoginForm />
      </div>
    );
  }

  return (
    <Layout>
      <section className="card">
        <h2>Resumen de obra</h2>
        <p>
          Obra seleccionada: <strong>{obraSeleccionada?.nombre}</strong>
        </p>
        <p>Base lista para módulos de gastos, pagos y estimaciones.</p>
      </section>
    </Layout>
  );
};

export default App;
