import React, { useState } from 'react';

function LoginPage({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const endpoint = isRegistering ? 'http://localhost:3000/api/auth/register' : 'http://localhost:3000/api/auth/login';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: 'citizen' })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Action failed");
            }

            if (isRegistering) {
                alert("Registration successful! Please login.");
                setIsRegistering(false);
            } else {
                onLogin(data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'
        }}>
            <div className="card" style={{ width: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isRegistering ? "Citizen Registration" : "Login"}
                </h2>

                {error && <div style={{ color: '#da3633', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {isRegistering ? "Register" : "Login"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9em' }}>
                    {isRegistering ? "Already have an account?" : "Need an account?"}
                    <span
                        style={{ color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '5px' }}
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "Login" : "Register"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
