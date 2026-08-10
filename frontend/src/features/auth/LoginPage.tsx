import { useLogin } from './hooks/useLogin';
import styles from './styles/login.module.css';

export function LoginPage() {
    const { email, setEmail, password, setPassword, error, handleSubmit } =
        useLogin();

    return (
        <div className={styles.pageContainer}>
            <main className={styles.formSection}>
                <div className={styles.formContentWrapper}>
                    <div className={styles.brand}>
                        <span className={styles.subBrand}>VETERINARIA</span>
                        <h1 className={styles.mainBrand}>Whistledown</h1>
                    </div>

                    <div className={styles.intro}>
                        <h2>Bienvenido, amante de los animales</h2>
                        <p>
                            Inicia sesión para cuidar a tus pacientes o agendar
                            citas.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Tu correo</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="doctor@vetcare.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className={styles.errorBanner}>{error}</div>
                        )}

                        <button type="submit" className={styles.submitBtn}>
                            Ingresar
                        </button>
                    </form>

                    <footer className={styles.formFooter}>
                        <a href="#reset">¿Olvidaste tu contraseña de acceso?</a>
                    </footer>
                </div>
            </main>

            <aside className={styles.visualSection}>
                <div className={styles.creativeCard}>
                    <div className={styles.cardImagePlace} />
                    <div className={styles.cardContent}>
                        <h3>Cada colita feliz cuenta.</h3>
                        <span className={styles.signature}>
                            - Team Whistledown
                        </span>
                    </div>
                </div>
            </aside>
        </div>
    );
}
