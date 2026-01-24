export const sendConfirmationSMS = async (data: any) => {
  console.log('Sending SMS to:', data.cellPhone);
  return new Promise(resolve => setTimeout(resolve, 1500));
};