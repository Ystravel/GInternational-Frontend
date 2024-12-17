<template>
  <div
    ref="previewContent"
    class="preview-content"
  >
    <div class="quotation-template">
      <!-- 頁首 -->
      <div class="header">
        <div class="title">
          <div class="d-flex justify-space-between pe-4 title-content">
            <h2 class="pe-2">
              永信旅遊報價單
            </h2>
            <div>
              <p><span style="font-weight: bold;">報價單號：</span>{{ formData.quotationNumber }}</p>
              <p><span style="font-weight: bold;">報價日期：</span>{{ formatDate(formData.date) }}</p>
            </div>
          </div>
        </div>
        <div class="company-info">
          <img
            src="@/assets/image/YstravelLOGO.png"
            alt="Company Logo"
            class="company-logo"
          >
          <p>台北市中山區南京東路二段137號8樓之1</p>
          <p><span style="font-weight: bold;">統編</span> 54321098</p>
          <p><span style="font-weight: bold;">電話</span> (02)2521-5151</p>
          <p><span style="font-weight: bold;">傳真</span> (02)2521-5757</p>
        </div>
      </div>

      <!-- 客戶資訊 -->
      <div class="section">
        <h3 class="section-title">
          客戶資訊
        </h3>
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">
                公司名稱
              </td>
              <td class="content">
                {{ formData.customerName }}
              </td>
              <td class="label">
                統一編號
              </td>
              <td class="content">
                {{ formData.customerTaxId }}
              </td>
            </tr>
            <tr>
              <td class="label">
                公司地址
              </td>
              <td
                class="content"
                colspan="3"
              >
                {{ formData.customerAddress }}
              </td>
            </tr>
            <tr>
              <td class="label">
                聯絡人
              </td>
              <td class="content">
                {{ formData.contactPerson }}
              </td>
              <td class="label">
                職稱
              </td>
              <td class="content">
                {{ formData.position }}
              </td>
            </tr>
            <tr>
              <td class="label">
                公司電話
              </td>
              <td class="content">
                {{ formData.officePhone }}
              </td>
              <td class="label">
                傳真
              </td>
              <td class="content">
                {{ formData.fax }}
              </td>
            </tr>
            <tr>
              <td class="label">
                手機
              </td>
              <td
                class="content"
                colspan="3"
              >
                {{ formData.mobile }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 旅遊資訊 -->
      <div class="section">
        <h3 class="section-title">
          旅遊資訊
        </h3>
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">
                行程名稱
              </td>
              <td class="content">
                {{ formData.projectName }}
              </td>
              <td class="label">
                目的地
              </td>
              <td class="content">
                {{ formData.destination }}
              </td>
            </tr>
            <tr>
              <td class="label">
                出發日期
              </td>
              <td class="content">
                {{ formatDate(formData.departureDate) }}
              </td>
              <td class="label">
                回程日期
              </td>
              <td class="content">
                {{ formatDate(formData.returnDate) }}
              </td>
            </tr>
            <tr>
              <td class="label">
                人數
              </td>
              <td
                class="content"
                colspan="3"
              >
                {{ formData.numberOfPeople }} 人
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 報價明細 -->
      <div class="section">
        <h3 class="section-title">
          報價明細
        </h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>項次</th>
              <th>費用類別</th>
              <th>說明</th>
              <th>單價</th>
              <th>數量</th>
              <th>單位</th>
              <th>小計</th>
              <th>備註</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in formData.items"
              :key="index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.description }}</td>
              <td>$ {{ formatAmount(item.unitPrice) }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td>$ {{ formatAmount(item.unitPrice * item.quantity) }}</td>
              <td>{{ item.remark }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td
                colspan="6"
                class="text-right"
              >
                小計
              </td>
              <td colspan="2">
                $ {{ formatAmount(subtotal) }}
              </td>
            </tr>
            <tr>
              <td
                colspan="6"
                class="text-right"
              >
                營業稅 (5%)
              </td>
              <td colspan="2">
                $ {{ formatAmount(tax) }}
              </td>
            </tr>
            <tr>
              <td
                colspan="6"
                class="text-right"
              >
                總計
              </td>
              <td colspan="2">
                $ {{ formatAmount(total) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 備註資訊 -->
      <div class="section">
        <h3 class="section-title">
          備註資訊
        </h3>
        <div class="notes">
          <div class="note-item">
            <h4>取消政策</h4>
            <p>{{ formData.cancellationPolicy || '無' }}</p>
          </div>
          <div class="note-item">
            <p class="validity">
              本報價單有效期限為 {{ formData.validityPeriod }} 天
            </p>
          </div>
        </div>
      </div>

      <!-- 簽名欄 -->
      <div class="signature">
        <div class="company-stamp">
          <p>公司用印</p>
          <div class="stamp-box" />
        </div>
        <div class="contact-signature">
          <p>客戶簽名</p>
          <div class="signature-box" />
          <p class="mt-2">
            日期：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/
          </p>
        </div>
      </div>

      <div class="footer">
        <p>感謝您的支持，如有任何問題請隨時與我們聯繫！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `${year}/${month}/${day}`
}

// 格式化金額
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0'
  return amount.toLocaleString('zh-TW')
}

// 計算小計
const subtotal = computed(() => {
  if (!props.formData?.items) return 0
  return props.formData.items.reduce((total, item) => {
    const quantity = Number(item?.quantity) || 0
    const unitPrice = Number(item?.unitPrice) || 0
    return total + (quantity * unitPrice)
  }, 0)
})

// 計算營業稅
const tax = computed(() => {
  if (!subtotal.value) return 0
  return Math.round(subtotal.value * 0.05)
})

// 計算總計
const total = computed(() => {
  if (!subtotal.value) return 0
  return subtotal.value + tax.value
})
</script>

<style lang="scss" scoped>
.preview-content {
  background: rgb(255, 255, 255);
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 12mm 20mm;
  box-sizing: border-box;
  font-size: 14px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #1a237e;
  }
}

.company-info {
  text-align: right;
  img {
    height: 60px;
  }
  p {
    line-height: 1.5;
  }
}

.section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  color: #1a237e;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #1a237e;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;

  td {
    padding: 8px;
    border: 1px solid #ddd;
  }

  .label {
    width: 100px;
    background-color: #f5f5f5;
    font-weight: bold;
  }
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;

  th, td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: center;
  }

  th {
    background-color: #1a237e;
    color: white;
  }

  tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  tfoot {
    font-weight: bold;
    
    td {
      border-top: 2px solid #1a237e;
    }
  }
}

.notes {
  .note-item {
    margin-bottom: 15px;

    h4 {
      color: #1a237e;
      margin-bottom: 5px;
    }

    p {
      margin: 0;
      white-space: pre-line;
    }
  }

  .validity {
    font-weight: bold;
    color: #d32f2f;
  }
}

.signature {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  
  .stamp-box,
  .signature-box {
    width: 150px;
    height: 80px;
    border: 1px solid #ddd;
    margin: 10px 0;
  }
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
}

.text-right {
  text-align: right;
}
</style> 