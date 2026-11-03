import { formatLongDate, formatTime } from "../domain/format";
import type { Appointment, Barber, EmailStatus, Service } from "../domain/types";

export interface Mailer {
  sendBookingConfirmation(appointment: Appointment, barber: Barber, service: Service): Promise<EmailStatus>;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function bookingEmail(appointment: Appointment, barber: Barber, service: Service) {
  const date = formatLongDate(appointment.date);
  const time = formatTime(appointment.startMinute);
  const row = (label: string, value: string) =>
    `<tr><td style="color:#9a9a9a;padding:8px 0">${label}</td><td style="text-align:right">${value}</td></tr>`;

  return {
    subject: `Reserva confirmada · ${service.name} el ${date} a las ${time}`,
    html: `
    <div style="background:#0a0a0a;color:#f5f5f5;font-family:Arial,sans-serif;padding:32px">
      <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #222;border-radius:16px;padding:32px">
        <p style="color:#cc1616;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px">Prestige Barber</p>
        <h1 style="font-size:26px;text-transform:uppercase;margin:0 0 16px">¡Reserva confirmada!</h1>
        <p style="color:#9a9a9a;line-height:1.6;margin:0 0 24px">Hola ${escapeHtml(appointment.clientName)}, te esperamos. Estos son los detalles de tu hora:</p>
        <table style="width:100%;border-collapse:collapse;font-size:15px">
          ${row("Servicio", service.name)}
          ${row("Barbero", barber.name)}
          ${row("Fecha", date)}
          ${row("Hora", time)}
          ${row("Duración", `${appointment.durationMin} min`)}
        </table>
        <p style="color:#5a5a5a;font-size:12px;margin:24px 0 0">Si no puedes asistir, avísanos por WhatsApp al +56 9 9487 2535.</p>
      </div>
    </div>`,
  };
}

// Envío real con la API de Resend
export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendBookingConfirmation(appointment: Appointment, barber: Barber, service: Service) {
    const { subject, html } = bookingEmail(appointment, barber, service);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: this.from, to: [appointment.clientEmail], subject, html }),
      });
      if (!res.ok) {
        console.error("[correo] Resend respondió", res.status, await res.text());
        return "failed";
      }
      return "sent";
    } catch (err) {
      console.error("[correo] Error al enviar", err);
      return "failed";
    }
  }
}

// Sin credenciales: solo registra el correo en la consola del servidor
export class ConsoleMailer implements Mailer {
  async sendBookingConfirmation(appointment: Appointment, barber: Barber, service: Service) {
    const { subject } = bookingEmail(appointment, barber, service);
    console.log(`[correo simulado] Para: ${appointment.clientEmail} · ${subject}`);
    return "simulated" as const;
  }
}
