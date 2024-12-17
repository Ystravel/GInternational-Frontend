export const quotationSchema = {
  quotationNumber: '',
  date: new Date(),
  
  // 客戶資訊
  customerName: '',
  customerAddress: '',
  customerTaxId: '',
  contactPerson: '',
  position: '',
  officePhone: '',
  fax: '',
  mobile: '',
  
  // 旅遊資訊
  projectName: '',
  destination: '',
  departureDate: new Date(),
  returnDate: new Date(),
  
  // 報價明細
  items: [
    {
      category: '', // 費用類別（機票、住宿、餐飲等）
      description: '',
      unitPrice: 0,
      quantity: 1,
      unit: '人',
      remark: ''
    }
  ],
  
  // 備註
  cancellationPolicy: '', // 取消政策
  validityPeriod: 7 // 報價有效期（天）
} 