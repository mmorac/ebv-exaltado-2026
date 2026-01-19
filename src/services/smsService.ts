import { RegistrationData } from '../types';

/**
 * Simula el envío de un SMS de confirmación.
 * 
 * NOTA TÉCNICA:
 * Los navegadores web no pueden enviar SMS directamente por razones de seguridad y costes.
 * En un entorno de producción real, esta función debería hacer una petición (fetch) 
 * a tu propio servidor (Node.js, PHP, Python) o a una Cloud Function (Firebase/AWS).
 * Ese servidor sería el encargado de conectar con proveedores como Twilio, Vonage o AWS SNS.
 */
export const sendConfirmationSMS = async (data: RegistrationData): Promise<boolean> => {
  // Simular retardo de red para dar feedback visual al usuario
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulación del mensaje
  const message = `Hola ${data.guardianName}! La inscripción de ${data.childName} en la EBV Exaltado 2026 ha sido confirmada correctamente. ¡Os esperamos el 13 de Julio!`;

  console.group('%c 📱 SIMULACIÓN DE ENVÍO SMS ', 'background: #22c55e; color: #fff; padding: 4px; border-radius: 4px;');
  console.log(`%cDestinatario:`, 'font-weight:bold', data.cellPhone);
  console.log(`%cMensaje:`, 'font-weight:bold', message);
  console.groupEnd();

  // Aquí iría la llamada real al backend:
  // try {
  //   await fetch('https://tu-api.com/send-sms', {
  //     method: 'POST',
  //     body: JSON.stringify({ phone: data.cellPhone, message: message })
  //   });
  //   return true;
  // } catch (e) { return false; }

  return true;
};