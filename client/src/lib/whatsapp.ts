export const getWhatsAppLink = (phoneNumber: string, message?: string) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  
  // En güvenilir ve tüm cihazlarda (iOS, Android, Masaüstü) çalışan yöntem wa.me kullanmaktır.
  // wa.me, cihazın türüne göre otomatik olarak uygulamayı veya web sürümünü açar.
  // whatsapp:// veya web.whatsapp.com doğrudan kullanıldığında bazı tarayıcılarda veya iOS'ta sorun çıkabiliyor.
  
  return message
    ? `https://wa.me/${cleanPhone}?text=${message}`
    : `https://wa.me/${cleanPhone}`;
};
