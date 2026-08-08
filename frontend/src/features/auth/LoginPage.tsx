import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../api/auth.api';
import { useAuthStore } from './useAuthStore';

const homeByRole: Record<string, string> = {
    GERENTE: '/dashboard',
    RECEPCION: '/citas',
    VETERINARIO: '/citas',
    INVENTARIO: '/inventario',
};

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginRequest({ email, password });
            login(data.accessToken, data.usuario);

            const rutaDestino = homeByRole[data.usuario.rol] || '/';
            navigate(rutaDestino);
        } catch {
            setError('Credenciales inválidas');
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: '80px auto' }}>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}
