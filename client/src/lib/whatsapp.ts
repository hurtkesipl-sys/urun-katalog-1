export const getWhatsAppLink = (phoneNumber: string, message?: string) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return message 
      ? `whatsapp://send?phone=${cleanPhone}&text=${message}`
      : `whatsapp://send?phone=${cleanPhone}`;
  }
  
  return message
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${message}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}`;
};
