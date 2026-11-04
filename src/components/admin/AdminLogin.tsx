"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";
import logo from "@/public/logo-prestige-barber-emblem.jpg";
import { ApiError, api } from "@/src/lib/api-client";

export default function AdminLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api.adminLogin(key);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos conectar con el servidor.");
      setPending(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginCard} onSubmit={submit}>
        <Image src={logo} alt="Prestige Barber" className={styles.loginLogo} priority />
        <span className={styles.eyebrow}>Prestige Barber</span>
        <h1 className={styles.loginTitle}>Administración</h1>
        <label className={styles.field}>
          <span className={styles.label}>Clave de administrador</span>
          <input
            type="password"
            className={styles.input}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <button type="submit" className={styles.btnPrimary} disabled={pending || !key}>
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
