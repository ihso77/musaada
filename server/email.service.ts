import nodemailer from "nodemailer";

/**
 * إعدادات البريد الإلكتروني
 * يمكن تغييرها من متغيرات البيئة
 */
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "your-email@gmail.com";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "your-app-password";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@musaada.com";

/**
 * إنشاء transporter للبريد الإلكتروني
 */
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * التحقق من اتصال البريد الإلكتروني
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[Email] Connection verified successfully");
    return true;
  } catch (error) {
    console.error("[Email] Connection verification failed:", error);
    return false;
  }
}

/**
 * إرسال بريد إلكتروني
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log(`[Email] Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * إرسال رمز التحقق من البريد الإلكتروني
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string,
  verificationUrl: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .content p {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          margin: 15px 0;
        }
        .verification-code {
          background-color: #f0fdf4;
          border: 2px solid #16a34a;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .verification-code .code {
          font-size: 32px;
          font-weight: bold;
          color: #16a34a;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .button {
          display: inline-block;
          background-color: #16a34a;
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .warning {
          background-color: #fef3c7;
          border-right: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #92400e;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 مرحباً بك في Musaada</h1>
        </div>
        
        <div class="content">
          <p>السلام عليكم ورحمة الله وبركاته ${name},</p>
          
          <p>شكراً لتسجيلك في منصة Musaada! نحن سعداء بانضمامك إلينا.</p>
          
          <p>لإكمال عملية التسجيل والتحقق من بريدك الإلكتروني، يرجى استخدام الرمز التالي:</p>
          
          <div class="verification-code">
            <p style="margin: 0; color: #666; font-size: 14px;">رمز التحقق</p>
            <div class="code">${verificationToken}</div>
          </div>
          
          <p>أو انقر على الزر أدناه:</p>
          <center>
            <a href="${verificationUrl}" class="button">التحقق من البريد الإلكتروني</a>
          </center>
          
          <div class="warning">
            ⚠️ لا تشارك هذا الرمز مع أي شخص. فريق Musaada لن يطلب منك هذا الرمز أبداً.
          </div>
          
          <p>هذا الرمز صالح لمدة 24 ساعة فقط.</p>
          
          <p>إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 Musaada. جميع الحقوق محفوظة.</p>
          <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    "تحقق من بريدك الإلكتروني - Musaada",
    html,
    `رمز التحقق الخاص بك: ${verificationToken}`
  );
}

/**
 * إرسال إشعار تأكيد الحجز
 */
export async function sendBookingConfirmationEmail(
  email: string,
  customerName: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string,
  totalPrice: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .booking-details {
          background-color: #f0fdf4;
          border: 1px solid #dcfce7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #dcfce7;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: bold;
          color: #16a34a;
        }
        .detail-value {
          color: #333;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ تم تأكيد حجزك</h1>
        </div>
        
        <div class="content">
          <p>السلام عليكم ورحمة الله وبركاته ${customerName},</p>
          
          <p>شكراً لك على اختيارك خدماتنا! تم تأكيد حجزك بنجاح.</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">الخدمة:</span>
              <span class="detail-value">${serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">التاريخ:</span>
              <span class="detail-value">${bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">الوقت:</span>
              <span class="detail-value">${bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">السعر الإجمالي:</span>
              <span class="detail-value" style="color: #16a34a; font-weight: bold;">${totalPrice} ريال</span>
            </div>
          </div>
          
          <p>سيتم التواصل معك قريباً من قبل مقدم الخدمة لتأكيد التفاصيل.</p>
          
          <p>إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 Musaada. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    "تأكيد الحجز - Musaada",
    html,
    `تم تأكيد حجزك للخدمة: ${serviceName} في ${bookingDate} الساعة ${bookingTime}`
  );
}

/**
 * إرسال إشعار تغيير حالة الحجز
 */
export async function sendBookingStatusChangeEmail(
  email: string,
  customerName: string,
  serviceName: string,
  status: string,
  statusMessage: string
): Promise<boolean> {
  const statusEmoji = {
    confirmed: "✅",
    in_progress: "🔄",
    completed: "🎉",
    cancelled: "❌",
  }[status] || "📋";

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .status-box {
          background-color: #f0fdf4;
          border-right: 4px solid #16a34a;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} تحديث حالة الحجز</h1>
        </div>
        
        <div class="content">
          <p>السلام عليكم ورحمة الله وبركاته ${customerName},</p>
          
          <p>تم تحديث حالة حجزك للخدمة <strong>${serviceName}</strong></p>
          
          <div class="status-box">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #16a34a;">
              ${statusMessage}
            </p>
          </div>
          
          <p>يمكنك متابعة حجزك من خلال لوحة التحكم الخاصة بك.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 Musaada. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    `تحديث حالة الحجز: ${statusMessage} - Musaada`,
    html,
    `تم تحديث حالة حجزك: ${statusMessage}`
  );
}

/**
 * إرسال إشعار تقييم جديد
 */
export async function sendNewReviewNotificationEmail(
  email: string,
  providerName: string,
  customerName: string,
  rating: number,
  comment: string
): Promise<boolean> {
  const stars = "⭐".repeat(rating);

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
          text-align: right;
        }
        .review-box {
          background-color: #fffbeb;
          border-right: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .review-box .stars {
          font-size: 24px;
          margin: 10px 0;
        }
        .review-box .comment {
          color: #333;
          font-style: italic;
          margin: 10px 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ تقييم جديد من عميل</h1>
        </div>
        
        <div class="content">
          <p>السلام عليكم ورحمة الله وبركاته ${providerName},</p>
          
          <p>تلقيت تقييماً جديداً من ${customerName}</p>
          
          <div class="review-box">
            <div class="stars">${stars}</div>
            <p style="margin: 5px 0; color: #666;">التقييم: ${rating} من 5 نجوم</p>
            ${comment ? `<div class="comment">"${comment}"</div>` : ""}
          </div>
          
          <p>شكراً لك على تقديمك خدمات ممتازة!</p>
        </div>
        
        <div class="footer">
          <p>© 2026 Musaada. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    `تقييم جديد من ${customerName} - Musaada`,
    html,
    `تلقيت تقييماً جديداً: ${rating} نجوم`
  );
}
