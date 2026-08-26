import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import { AUTH } from "../config/auth";

/**
 * MVP login gate. Credentials live in src/config/auth.ts (currently
 * abc123 / qwerty12345) and are checked client-side only — fine for a
 * prototype, replace with a real backend before going live.
 */
export function LoginPage() {
  usePageMeta({ title: "Admin Login" });

  const { isAuthed, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Preserve the page the visitor was trying to reach.
  const from =
    (location.state as { from?: string } | null)?.from ?? "/admin/add-project";

  if (isAuthed) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setError("Please enter your user ID and password.");
      return;
    }
    if (!login(userId.trim(), password)) {
      setError("Incorrect user ID or password.");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <Link to="/" className="login-page__brand" aria-label={`Back to ${SITE.name} home`}>
          <span className="login-page__brand-mark" aria-hidden="true">
            <MapPin size={16} strokeWidth={2.2} />
          </span>
          <span className="login-page__brand-name">{SITE.name}</span>
        </Link>

        <p className="login-page__eyebrow u-eyebrow">Admin</p>
        <h1 className="login-page__title">
          Property <em>desk</em>
        </h1>
        <p className="login-page__intro">
          Sign in to add new projects or property listings. This is a prototype gate —
          credentials are stored in the site config.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-form__field">
            <label htmlFor="login-user">User ID</label>
            <input
              id="login-user"
              type="text"
              autoComplete="username"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              placeholder="e.g. abc123"
              aria-invalid={Boolean(error)}
            />
          </div>
          <div className="login-form__field">
            <label htmlFor="login-pass">Password</label>
            <input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••••"
              aria-invalid={Boolean(error)}
            />
          </div>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--lg login-form__submit">
            Sign in
          </button>
        </form>

        <p className="login-page__hint">
          Prototype access — user ID: <code>{AUTH.userId}</code> · password:{" "}
          <code>{AUTH.password}</code>
        </p>

        <Link to="/" className="login-page__back">
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}
