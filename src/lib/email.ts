import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Dapur Ardya <noreply@dapurardya.my.id>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.my.id";

// Retry wrapper untuk Resend — coba 3x dengan exponential backoff
async function sendWithRetry(
  payload: Parameters<typeof resend.emails.send>[0],
  maxRetries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await resend.emails.send(payload);
      if (error) throw new Error(error.message);
      return;
    } catch (err) {
      const isLast = attempt === maxRetries;
      logger.warn(
        `Email send attempt ${attempt}/${maxRetries} failed${isLast ? " — giving up" : ", retrying..."}`,
        "EMAIL",
        { to: payload.to, subject: payload.subject, error: err instanceof Error ? err.message : String(err) }
      );
      if (isLast) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1))); // 500ms, 1s, 2s
    }
  }
}

export interface RequestNotificationData {
  name: string;
  recipeName: string;
  message?: string;
  memberId?: string;
}

export async function sendRequestNotification(data: RequestNotificationData) {
  if (!process.env.RESEND_API_KEY || !ADMIN_EMAIL) {
    logger.warn("RESEND_API_KEY atau ADMIN_EMAIL belum diset, skip kirim email", "EMAIL");
    return;
  }

  const { name, recipeName, message, memberId } = data;

  try {
    await sendWithRetry({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🍳 Request Resep Baru: ${recipeName}`,
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#FFF2F1;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF2F1;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #FFD6D6;">
                
                <!-- Header -->
                <tr>
                  <td style="background:#FF94A8;padding:24px 32px;">
                    <p style="margin:0;color:#fff;font-size:22px;font-weight:700;">🍳 Dapur Ardya</p>
                    <p style="margin:4px 0 0;color:#FFE0DE;font-size:14px;">Ada request resep baru masuk!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#FFE0DE;border-radius:12px;padding:20px;border-left:4px solid #FF94A8;">
                          <p style="margin:0 0 4px;font-size:12px;color:#5a3a3a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Nama Resep yang Diminta</p>
                          <p style="margin:0;font-size:20px;font-weight:700;color:#1f2937;">${recipeName}</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td width="50%" style="padding-right:8px;">
                          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Dari</p>
                          <p style="margin:0;font-size:15px;color:#1f2937;font-weight:500;">${name}</p>
                        </td>
                        <td width="50%" style="padding-left:8px;">
                          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Status Member</p>
                          <p style="margin:0;font-size:15px;color:#1f2937;font-weight:500;">${memberId ? "✅ Member terdaftar" : "👤 Tamu"}</p>
                        </td>
                      </tr>
                    </table>

                    ${message ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td style="background:#f9fafb;border-radius:10px;padding:16px;border:1px solid #e5e7eb;">
                          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Pesan Tambahan</p>
                          <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${message}"</p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                      <tr>
                        <td align="center">
                          <a href="${BASE_URL}/admin/requests" style="display:inline-block;background:#FF94A8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:15px;font-weight:600;">
                            Lihat di Dashboard Admin →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:16px 32px;border-top:1px solid #FFD6D6;background:#FFF2F1;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                      Email ini dikirim otomatis oleh sistem Dapur Ardya · <a href="${BASE_URL}" style="color:#FF94A8;text-decoration:none;">dapurardya.my.id</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });
    logger.info(`Email request notification sent to ${ADMIN_EMAIL}`, "EMAIL");
  } catch (err) {
    logger.error("Gagal kirim email notifikasi request", "EMAIL", err);
    // Non-fatal — request tetap tersimpan meski email gagal
  }
}

export interface RequestDoneNotificationData {
  memberEmail: string;
  memberName: string;
  recipeName: string;
  message?: string;
}

export async function sendRequestDoneNotification(data: RequestDoneNotificationData) {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY belum diset, skip kirim email", "EMAIL");
    return;
  }

  const { memberEmail, memberName, recipeName, message } = data;

  try {
    await sendWithRetry({
      from: FROM_EMAIL,
      to: memberEmail,
      subject: `🎉 Resep "${recipeName}" sudah tersedia di Dapur Ardya!`,
    html: `
      <!DOCTYPE html>
      <html lang="id">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#FFF2F1;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF2F1;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #FFD6D6;">

                <!-- Header -->
                <tr>
                  <td style="background:#FF94A8;padding:24px 32px;">
                    <p style="margin:0;color:#fff;font-size:22px;font-weight:700;">🍳 Dapur Ardya</p>
                    <p style="margin:4px 0 0;color:#FFE0DE;font-size:14px;">Request resepmu sudah selesai!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 20px;font-size:16px;color:#374151;">Halo, <strong>${memberName}</strong> 👋</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#FFE0DE;border-radius:12px;padding:20px;border-left:4px solid #FF94A8;">
                          <p style="margin:0 0 4px;font-size:12px;color:#5a3a3a;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Resep yang kamu minta</p>
                          <p style="margin:0;font-size:20px;font-weight:700;color:#1f2937;">${recipeName}</p>
                        </td>
                      </tr>
                    </table>

                    ${message ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td style="background:#f9fafb;border-radius:10px;padding:14px;border:1px solid #e5e7eb;">
                          <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Pesanmu dulu</p>
                          <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${message}"</p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                    <p style="margin:20px 0;font-size:15px;color:#374151;">
                      Resep sudah dipublikasikan dan siap kamu coba. Yuk langsung cek di website!
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                      <tr>
                        <td align="center">
                          <a href="${BASE_URL}/resep" style="display:inline-block;background:#FF94A8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:15px;font-weight:600;">
                            Lihat Resep Sekarang →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:16px 32px;border-top:1px solid #FFD6D6;background:#FFF2F1;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                      Email ini dikirim otomatis oleh sistem Dapur Ardya · <a href="${BASE_URL}" style="color:#FF94A8;text-decoration:none;">dapurardya.my.id</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
    
          </tr>
        </table>
      </body>
      </html>
    `,
    });
    logger.info(`Email request done sent to ${memberEmail}`, "EMAIL");
  } catch (err) {
    logger.error("Gagal kirim email notifikasi request done", "EMAIL", err);
  }
}

