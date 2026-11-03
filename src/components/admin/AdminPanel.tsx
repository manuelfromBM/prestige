"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";
import ScheduleEditor, { draftToSchedule, scheduleToDraft, type DayDraft } from "./ScheduleEditor";
import logo from "@/public/logo-prestige-barber-circle.jpg";
import { ApiError, api } from "@/src/lib/api-client";
import { isUnoptimized } from "@/src/lib/images";
import { CONTENT_KINDS, type AllContent, type ContentItems, type ContentKind } from "@/src/server/domain/content";
import { formatTime } from "@/src/server/domain/format";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const SHORT_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type Item = ContentItems[ContentKind];
type Draft = Record<string, string | boolean | DayDraft[]>;

interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "money" | "number" | "image" | "url" | "toggle";
  hint?: string;
  placeholder?: string;
  optional?: boolean;
}

interface Summary {
  title: string;
  subtitle: string;
  meta: string[];
  image?: string;
}

interface KindConfig<K extends ContentKind> {
  tab: string;
  singular: string;
  feminine?: boolean;
  intro: string;
  fields: Field[];
  schedule?: boolean;
  summary: (item: ContentItems[K]) => Summary;
}

const visibleField = (hint: string): Field => ({ key: "active", label: "Visible", type: "toggle", hint });

const CONFIG: { [K in ContentKind]: KindConfig<K> } = {
  services: {
    tab: "Servicios",
    singular: "servicio",
    intro: "Precios, duración y textos de cada servicio. Se usan en el inicio y en la agenda online.",
    fields: [
      { key: "name", label: "Nombre", type: "text", placeholder: "Degradado" },
      { key: "price", label: "Precio", type: "money", placeholder: "12000" },
      { key: "durationMin", label: "Duración (minutos)", type: "number", placeholder: "45", hint: "Define cuánto tiempo bloquea en la agenda." },
      { key: "tag", label: "Etiqueta", type: "text", optional: true, placeholder: "Más pedido", hint: "Opcional. Aparece sobre la foto en el inicio." },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "imageUrl", label: "Foto", type: "image" },
      visibleField("Si lo ocultas, no aparece en el inicio ni se puede reservar."),
    ],
    summary: (s) => ({
      title: s.name,
      subtitle: s.description,
      meta: [clp.format(s.price), `${s.durationMin} min`, ...(s.tag ? [s.tag] : []), `${s.appointmentCount} citas`],
      image: s.imageUrl,
    }),
  },
  barbers: {
    tab: "Barberos",
    singular: "barbero",
    intro: "Nombre, foto y horario de cada barbero. El horario define las horas disponibles en la agenda.",
    schedule: true,
    fields: [
      { key: "name", label: "Nombre", type: "text", placeholder: "Matías Rojas" },
      { key: "role", label: "Especialidad", type: "text", placeholder: "Barbero master · Fades" },
      { key: "experienceYears", label: "Años de experiencia", type: "number", optional: true, hint: "Opcional. Se muestra sobre la foto." },
      { key: "instagram", label: "Instagram", type: "url", optional: true, placeholder: "https://instagram.com/usuario" },
      { key: "imageUrl", label: "Foto", type: "image" },
      visibleField("Si lo ocultas, no aparece en el inicio ni se le pueden reservar horas."),
    ],
    summary: (b) => ({
      title: b.name,
      subtitle: b.role,
      meta: [
        b.schedule.length
          ? `${b.schedule.map((h) => SHORT_DAYS[h.weekday]).join(" · ")}`
          : "Sin horario",
        ...(b.schedule[0] ? [`${formatTime(b.schedule[0].startMinute)}–${formatTime(b.schedule[0].endMinute)}`] : []),
        `${b.appointmentCount} citas`,
      ],
      image: b.imageUrl,
    }),
  },
  promotions: {
    tab: "Promociones",
    singular: "promoción",
    feminine: true,
    intro: "Ofertas de la sección Promociones. El botón Aprovechar abre WhatsApp con el mensaje que escribas.",
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Corte + Barba" },
      { key: "tag", label: "Etiqueta", type: "text", placeholder: "Combo estrella" },
      { key: "price", label: "Precio", type: "money", optional: true, hint: "Opcional. Déjalo vacío si es un descuento (ej. -20%)." },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "message", label: "Mensaje de WhatsApp", type: "textarea", placeholder: "¡Hola! Quiero el combo Corte + Barba." },
      { key: "featured", label: "Destacada", type: "toggle", hint: "Se marca como “Más popular”." },
      visibleField("Si la ocultas, no aparece en el inicio."),
    ],
    summary: (p) => ({
      title: p.title,
      subtitle: p.description,
      meta: [p.tag, p.price === null ? "Sin precio fijo" : clp.format(p.price), ...(p.featured ? ["Destacada"] : [])],
    }),
  },
  products: {
    tab: "Productos",
    singular: "producto",
    intro: "Productos de la tienda. El botón Comprar abre WhatsApp con el nombre del producto.",
    fields: [
      { key: "name", label: "Nombre", type: "text", placeholder: "Pomada mate" },
      { key: "category", label: "Categoría", type: "text", placeholder: "Fijación fuerte" },
      { key: "price", label: "Precio", type: "money", placeholder: "9900" },
      { key: "imageUrl", label: "Foto", type: "image" },
      visibleField("Si lo ocultas, no aparece en el inicio."),
    ],
    summary: (p) => ({ title: p.name, subtitle: p.category, meta: [clp.format(p.price)], image: p.imageUrl }),
  },
};

const summarize = (kind: ContentKind, item: Item) => (CONFIG[kind].summary as (i: Item) => Summary)(item);

// Concordancia de género: "nuevo servicio" / "nueva promoción"
const gender = (kind: ContentKind, masculine: string, feminine: string) =>
  CONFIG[kind].feminine ? feminine : masculine;

function toDraft(kind: ContentKind, item: Item | null): Draft {
  const source = (item ?? {}) as Record<string, unknown>;
  const draft: Draft = {};
  for (const f of CONFIG[kind].fields) {
    const value = source[f.key];
    draft[f.key] = f.type === "toggle" ? (item ? Boolean(value) : f.key === "active") : value == null ? "" : String(value);
  }
  if (CONFIG[kind].schedule) draft.schedule = scheduleToDraft(item ? (item as ContentItems["barbers"]).schedule : []);
  return draft;
}

function toPayload(kind: ContentKind, draft: Draft) {
  const payload: Record<string, unknown> = {};
  for (const f of CONFIG[kind].fields) {
    const value = draft[f.key];
    if (f.type === "toggle") payload[f.key] = value === true;
    else if (f.type === "money" || f.type === "number") payload[f.key] = String(value).trim() === "" ? null : Number(value);
    else payload[f.key] = String(value).trim();
  }
  if (CONFIG[kind].schedule) payload.schedule = draftToSchedule(draft.schedule as DayDraft[]);
  return payload;
}

interface Editing {
  kind: ContentKind;
  item: Item | null;
  draft: Draft;
}

export default function AdminPanel({ initialContent, requiresLogin }: { initialContent: AllContent; requiresLogin: boolean }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<ContentKind>("services");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [confirming, setConfirming] = useState<{ kind: ContentKind; item: Item } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const editorRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (editing) editorRef.current?.showModal();
    else editorRef.current?.close();
  }, [editing]);

  useEffect(() => {
    if (confirming) confirmRef.current?.showModal();
    else confirmRef.current?.close();
  }, [confirming]);

  const replaceList = (kind: ContentKind, fn: (list: Item[]) => Item[]) =>
    setContent((c) => ({ ...c, [kind]: fn(c[kind] as Item[]) }));

  // Ejecuta una acción contra la API; devuelve el mensaje de error si falló
  async function run(action: () => Promise<void>): Promise<string | null> {
    setBusy(true);
    try {
      await action();
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.refresh(); // sesión vencida → vuelve al login
      }
      return err instanceof ApiError ? err.message : "No pudimos conectar con el servidor.";
    } finally {
      setBusy(false);
    }
  }

  const openEditor = (kind: ContentKind, item: Item | null) => {
    setFormError(null);
    setEditing({ kind, item, draft: toDraft(kind, item) });
  };

  const setDraft = (key: string, value: Draft[string]) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const { kind, item, draft } = editing;
    const error = await run(async () => {
      const { item: saved } = await api.saveContent(kind, item?.id ?? null, toPayload(kind, draft) as never);
      replaceList(kind, (list) => (item ? list.map((i) => (i.id === saved.id ? saved : i)) : [...list, saved]));
      setEditing(null);
      setToast({ ok: true, text: item ? "Cambios guardados." : `${capitalize(CONFIG[kind].singular)} ${gender(kind, "agregado", "agregada")}.` });
    });
    setFormError(error);
  }

  async function toggleActive(kind: ContentKind, item: Item) {
    const error = await run(async () => {
      const { item: saved } = await api.saveContent(kind, item.id, { ...item, active: !item.active } as never);
      replaceList(kind, (list) => list.map((i) => (i.id === saved.id ? saved : i)));
      setToast({
        ok: true,
        text: saved.active
          ? `“${summarize(kind, saved).title}” ahora es visible.`
          : `“${summarize(kind, saved).title}” quedó ${gender(kind, "oculto", "oculta")}.`,
      });
    });
    if (error) setToast({ ok: false, text: error });
  }

  async function move(kind: ContentKind, index: number, delta: -1 | 1) {
    const list = content[kind] as Item[];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    replaceList(kind, () => next);
    const error = await run(() => api.reorderContent(kind, next.map((i) => i.id)).then(() => undefined));
    if (error) {
      replaceList(kind, () => list);
      setToast({ ok: false, text: error });
    }
  }

  async function remove() {
    if (!confirming) return;
    const { kind, item } = confirming;
    const error = await run(async () => {
      await api.deleteContent(kind, item.id);
      replaceList(kind, (list) => list.filter((i) => i.id !== item.id));
      setToast({ ok: true, text: `“${summarize(kind, item).title}” ${gender(kind, "eliminado", "eliminada")}.` });
    });
    setConfirming(null);
    if (error) setToast({ ok: false, text: error });
  }

  async function logout() {
    await api.adminLogout().catch(() => undefined);
    router.refresh();
  }

  const config = CONFIG[tab];
  const items = content[tab] as Item[];
  const confirmHasHistory =
    confirming !== null && "appointmentCount" in confirming.item && confirming.item.appointmentCount > 0;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Image src={logo} alt="Prestige Barber" className={styles.logo} priority />
          <div>
            <span className={styles.eyebrow}>Prestige Barber</span>
            <h1 className={styles.title}>Administración</h1>
          </div>
        </div>
        <nav className={styles.topLinks}>
          <Link href="/" target="_blank" className={styles.topLink}>Ver sitio ↗</Link>
          <Link href="/dashboard" className={styles.topLink}>Métricas</Link>
          {requiresLogin && (
            <button type="button" className={styles.topLink} onClick={logout}>Cerrar sesión</button>
          )}
        </nav>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Secciones">
        {CONTENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === tab}
            className={k === tab ? styles.tabActive : styles.tab}
            onClick={() => setTab(k)}
          >
            {CONFIG[k].tab}
            <span className={styles.tabCount}>{content[k].length}</span>
          </button>
        ))}
      </div>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <p className={styles.intro}>{config.intro}</p>
          <button type="button" className={styles.btnPrimary} onClick={() => openEditor(tab, null)}>
            + Agregar {config.singular}
          </button>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Todavía no hay {config.tab.toLowerCase()}. Agrega {gender(tab, "el primero", "la primera")}.
          </p>
        ) : (
          <ul className={styles.list}>
            {items.map((item, i) => {
              const s = summarize(tab, item);
              return (
                <li key={item.id} className={`${styles.row} ${item.active ? "" : styles.rowHidden}`}>
                  <div className={styles.order}>
                    <button type="button" className={styles.orderBtn} onClick={() => move(tab, i, -1)}
                      disabled={busy || i === 0} aria-label={`Subir ${s.title}`}>↑</button>
                    <button type="button" className={styles.orderBtn} onClick={() => move(tab, i, 1)}
                      disabled={busy || i === items.length - 1} aria-label={`Bajar ${s.title}`}>↓</button>
                  </div>

                  {s.image !== undefined && (
                    <span className={styles.thumb}>
                      <Image src={s.image} alt="" fill sizes="64px" className={styles.thumbImg} unoptimized={isUnoptimized(s.image)} />
                    </span>
                  )}

                  <div className={styles.rowMain}>
                    <strong className={styles.rowTitle}>
                      {s.title}
                      {!item.active && <span className={styles.hiddenBadge}>{gender(tab, "Oculto", "Oculta")}</span>}
                    </strong>
                    <span className={styles.rowSubtitle}>{s.subtitle}</span>
                    <span className={styles.metaList}>
                      {s.meta.map((m) => (
                        <span key={m} className={styles.meta}>{m}</span>
                      ))}
                    </span>
                  </div>

                  <div className={styles.rowActions}>
                    <label className={styles.switch} title={item.active ? "Visible en el sitio" : "Oculto"}>
                      <input type="checkbox" role="switch" checked={item.active} disabled={busy}
                        onChange={() => toggleActive(tab, item)} aria-label={`Visible: ${s.title}`} />
                      <span className={styles.switchTrack} aria-hidden="true" />
                    </label>
                    <button type="button" className={styles.btnGhost} onClick={() => openEditor(tab, item)}>Editar</button>
                    <button type="button" className={styles.btnDangerGhost} onClick={() => setConfirming({ kind: tab, item })}>
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Editor */}
      <dialog ref={editorRef} className={styles.dialog} onClose={() => setEditing(null)}>
        {editing && (
          <form className={styles.form} onSubmit={save} noValidate>
            <header className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>
                {editing.item
                  ? `Editar ${CONFIG[editing.kind].singular}`
                  : `${gender(editing.kind, "Nuevo", "Nueva")} ${CONFIG[editing.kind].singular}`}
              </h2>
              <button type="button" className={styles.close} onClick={() => setEditing(null)} aria-label="Cerrar">×</button>
            </header>

            <div className={styles.formBody}>
              {CONFIG[editing.kind].fields.map((f) => (
                <FieldInput key={f.key} field={f} value={editing.draft[f.key] as string | boolean} onChange={(v) => setDraft(f.key, v)} />
              ))}
              {CONFIG[editing.kind].schedule && (
                <ScheduleEditor value={editing.draft.schedule as DayDraft[]} onChange={(v) => setDraft("schedule", v)} />
              )}
            </div>

            <footer className={styles.dialogFooter}>
              {formError && <p className={styles.formError} role="alert">{formError}</p>}
              <div className={styles.dialogButtons}>
                <button type="button" className={styles.btnGhost} onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={busy}>
                  {busy ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </footer>
          </form>
        )}
      </dialog>

      {/* Confirmación de borrado */}
      <dialog ref={confirmRef} className={`${styles.dialog} ${styles.dialogSmall}`} onClose={() => setConfirming(null)}>
        {confirming && (
          <div className={styles.confirm}>
            <h2 className={styles.dialogTitle}>Eliminar “{summarize(confirming.kind, confirming.item).title}”</h2>
            {confirmHasHistory ? (
              <>
                <p className={styles.confirmText}>
                  Tiene citas en el historial, así que no se puede eliminar sin perder ese registro. Puedes
                  ocultarlo: deja de aparecer en el sitio y en la agenda, pero sigue contando en las métricas.
                </p>
                <div className={styles.dialogButtons}>
                  <button type="button" className={styles.btnGhost} onClick={() => setConfirming(null)}>Cerrar</button>
                  {confirming.item.active && (
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={busy}
                      onClick={() => {
                        const { kind, item } = confirming;
                        setConfirming(null);
                        toggleActive(kind, item);
                      }}
                    >
                      Ocultar
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className={styles.confirmText}>Esta acción no se puede deshacer.</p>
                <div className={styles.dialogButtons}>
                  <button type="button" className={styles.btnGhost} onClick={() => setConfirming(null)}>Cancelar</button>
                  <button type="button" className={styles.btnDanger} onClick={remove} disabled={busy}>Eliminar</button>
                </div>
              </>
            )}
          </div>
        )}
      </dialog>

      {toast && (
        <div className={toast.ok ? styles.toast : styles.toastError} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const id = `field-${field.key}`;
  const label = (
    <span className={styles.label}>
      {field.label}
      {field.optional && <span className={styles.optional}> · opcional</span>}
    </span>
  );

  if (field.type === "toggle") {
    return (
      <label className={styles.toggleField}>
        <span className={styles.switch}>
          <input type="checkbox" role="switch" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          <span className={styles.switchTrack} aria-hidden="true" />
        </span>
        <span>
          <span className={styles.label}>{field.label}</span>
          {field.hint && <span className={styles.hint}>{field.hint}</span>}
        </span>
      </label>
    );
  }

  const text = String(value);
  const common = {
    id,
    className: styles.input,
    value: text,
    placeholder: field.placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <div className={`${styles.field} ${field.type === "textarea" || field.type === "image" ? styles.fieldWide : ""}`}>
      <label htmlFor={id}>{label}</label>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} />
      ) : field.type === "money" ? (
        <div className={styles.moneyInput}>
          <span aria-hidden="true">$</span>
          <input {...common} type="number" inputMode="numeric" min={0} step={100} />
        </div>
      ) : field.type === "number" ? (
        <input {...common} type="number" inputMode="numeric" min={0} />
      ) : (
        <input {...common} type={field.type === "text" ? "text" : "url"} autoComplete="off" />
      )}
      {field.type === "money" && text !== "" && Number.isFinite(Number(text)) && (
        <span className={styles.hint}>Se muestra como {clp.format(Number(text))}</span>
      )}
      {field.type === "image" && <ImagePreview src={text} />}
      {field.hint && <span className={styles.hint}>{field.hint}</span>}
      {field.type === "image" && (
        <span className={styles.hint}>Pega el enlace de una imagen (https://…) o una ruta de la carpeta public (/foto.jpg).</span>
      )}
    </div>
  );
}

function ImagePreview({ src }: { src: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src) return null;
  return (
    <span className={styles.preview}>
      {failed === src ? (
        <span className={styles.previewError}>No se pudo cargar la imagen. Revisa el enlace.</span>
      ) : (
        // Vista previa de un enlace cualquiera mientras se escribe: next/image fallaría con URLs a medio escribir
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Vista previa" onError={() => setFailed(src)} />
      )}
    </span>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
