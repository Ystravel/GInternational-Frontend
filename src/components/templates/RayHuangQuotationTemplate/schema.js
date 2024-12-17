export const quotationSchema = {
  quotationNumber: '',
  date: new Date(),
  customerName: '',
  customerAddress: '',
  customerTaxId: '',
  customerContact: '',
  department: '',
  customerPhone: '',
  customerEmail: '',
  customerMobile: '',
  projectType: '',
  projectName: '',
  workDays: '',
  specialNote: '',
  validityDays: '',
  delayDays: '',
  items: [
    {
      name: '',
      description: '',
      workDays: '',
      quantity: 1,
      unit: '份',
      price: ''
    }
  ]
} 