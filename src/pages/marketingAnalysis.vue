<template>
  <v-container
    min-width="2160"
  >
    <!-- 搜尋條件區塊 -->
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <v-col cols="12">
        <h3>行銷費用分析</h3>
      </v-col>
      <v-col cols="12">
        <v-row>
          <!-- 搜尋條件 -->
          <v-col cols="3">
            <v-select
              v-model="searchForm.year"
              :items="yearOptions"
              label="年度"
              variant="outlined"
              density="compact"
              :error-messages="yearError"
              clearable
              @update:model-value="handleYearChange"
            />
          </v-col>
          <v-col cols="3">
            <v-autocomplete
              v-model="searchForm.theme"
              :items="themeOptions"
              label="行銷主題"
              item-title="name"
              item-value="_id"
              variant="outlined"
              density="compact"
              :error-messages="themeError"
              clearable
              @update:model-value="handleThemeChange"
            />
          </v-col>
          <v-col cols="3">
            <v-select
              v-model="searchForm.reportType"
              :items="reportTypeOptions"
              label="報表類型"
              variant="outlined"
              density="compact"
              :error-messages="reportTypeError"
              clearable
              @update:model-value="handleReportTypeChange"
            />
          </v-col>
          <v-col cols="3">
            <v-btn
              color="purple-darken-2"
              :loading="isLoading"
              @click="generateReport"
            >
              查看報表
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 報表呈現區塊 -->
    <v-row 
      v-if="showReport"
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
      style="min-width: 1970px;"
    >
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <v-spacer />
          <div>
            <v-btn
              color="success"
              class="me-2"
              prepend-icon="mdi-microsoft-excel"
              :loading="isExporting"
              @click="exportToExcel"
            >
              匯出 EXCEL
            </v-btn>
            <v-btn
              color="error"
              prepend-icon="mdi-file-pdf-box"
              :loading="isExporting"
              @click="exportToPDF"
            >
              匯出 PDF
            </v-btn>
          </div>
        </div>

        <!-- 年度行銷預算表 -->
        <div class="budget-table-title ">
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          {{ reportTypeOptions.find(option => option.value === searchForm.reportType)?.title || '' }}
        </div>

        <table
          v-if="searchForm.reportType === 'budget'"
          class="budget-table"
        >
          <thead>
            <tr class="header-row">
              <th
                rowspan="1"
                class="header-cell"
              >
                廣告渠道
              </th>
              <th
                rowspan="1"
                class="header-cell"
              >
                平台
              </th>
              <th class="header-cell">
                JAN
              </th>
              <th class="header-cell">
                FEB
              </th>
              <th class="header-cell">
                MAR
              </th>
              <th class="header-cell-quarter">
                Q1
              </th>
              <th class="header-cell">
                APR
              </th>
              <th class="header-cell">
                MAY
              </th>
              <th class="header-cell">
                JUN
              </th>
              <th class="header-cell-quarter">
                Q2
              </th>
              <th class="header-cell">
                JUL
              </th>
              <th class="header-cell">
                AUG
              </th>
              <th class="header-cell">
                SEP
              </th>
              <th class="header-cell-quarter">
                Q3
              </th>
              <th class="header-cell">
                OCT
              </th>
              <th class="header-cell">
                NOV
              </th>
              <th class="header-cell">
                DEC
              </th>
              <th class="header-cell-quarter">
                Q4
              </th>
              <th class="header-cell">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(channel, channelIndex) in reportData"
              :key="channelIndex"
            >
              <template
                v-for="(platform, platformIndex) in channel.platforms"
                :key="`${channelIndex}-${platformIndex}`"
              >
                <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                  <td
                    v-if="platformIndex === 0"
                    :rowspan="channel.platforms.length"
                    class="channel-col"
                  >
                    {{ channel.channelName }}
                  </td>
                  <td class="platform-col">
                    {{ platform.platformName }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.JAN) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.FEB) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.MAR) }}
                  </td>
                  <td class="quarter-col">
                    {{ formatNumber(getQuarterTotal(platform.budget, 1)) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.APR) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.MAY) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.JUN) }}
                  </td>
                  <td class="quarter-col">
                    {{ formatNumber(getQuarterTotal(platform.budget, 2)) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.JUL) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.AUG) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.SEP) }}
                  </td>
                  <td class="quarter-col">
                    {{ formatNumber(getQuarterTotal(platform.budget, 3)) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.OCT) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.NOV) }}
                  </td>
                  <td class="month-col">
                    {{ formatNumber(platform.budget.DEC) }}
                  </td>
                  <td class="quarter-col">
                    {{ formatNumber(getQuarterTotal(platform.budget, 4)) }}
                  </td>
                  <td class="total-col">
                    {{ formatNumber(getPlatformTotal(platform.budget)) }}
                  </td>
                </tr>
              </template>
            </template>
            <!-- 月度總計列 -->
            <tr class="monthly-total-row">
              <td colspan="2">
                月度總計
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('JAN')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('FEB')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('MAR')) }}
              </td>
              <td class="quarter-col">
                {{ formatNumber(getQuarterlyTotal(1)) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('APR')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('MAY')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('JUN')) }}
              </td>
              <td class="quarter-col">
                {{ formatNumber(getQuarterlyTotal(2)) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('JUL')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('AUG')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('SEP')) }}
              </td>
              <td class="quarter-col">
                {{ formatNumber(getQuarterlyTotal(3)) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('OCT')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('NOV')) }}
              </td>
              <td class="month-col">
                {{ formatNumber(getMonthlyTotal('DEC')) }}
              </td>
              <td class="quarter-col">
                {{ formatNumber(getQuarterlyTotal(4)) }}
              </td>
              <td class="total-col highlight-total">
                {{ formatNumber(getGrandTotal()) }}
              </td>
            </tr>
          </tbody>
        </table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils/format'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import html2pdf from 'html2pdf.js'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷費用分析 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const router = useRouter()

// ===== 基礎狀態管理 =====
const isLoading = ref(false)
const isExporting = ref(false)
const showReport = ref(false)

// ===== 搜尋表單相關 =====
const searchForm = ref({
  year: null,
  theme: null,
  reportType: null
})

const yearError = ref('')
const themeError = ref('')
const reportTypeError = ref('')

// ===== 選項資料 =====
const yearOptions = ref([])
const themeOptions = ref([])
const reportTypeOptions = ref([
  { title: '行銷預算表', value: 'budget' },
  { title: '行銷實際花費表', value: 'expense' },
  { title: '行銷預算與實際花費比較表', value: 'comparison' },
  { title: '每月線別及平台實際花費表', value: 'detail' }
])

// ===== 報表資料 =====
const reportData = ref([])

// ===== 方法 =====
// 載入選項資料
const loadOptions = async () => {
  try {
    const [yearResponse, themeResponse] = await Promise.all([
      apiAuth.get('/marketing/budgets/years'),
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } })
    ])

    if (yearResponse.data.success) {
      yearOptions.value = yearResponse.data.result
    }
    if (themeResponse.data.success) {
      themeOptions.value = themeResponse.data.result
    }
  } catch (error) {
    handleError(error)
  }
}

// 處理搜尋條件變更
const handleYearChange = () => {
  yearError.value = ''
  showReport.value = false
}

const handleThemeChange = () => {
  themeError.value = ''
  showReport.value = false
}

const handleReportTypeChange = () => {
  reportTypeError.value = ''
  showReport.value = false
}

// 產生報表
const generateReport = async () => {
  // 驗證
  if (!searchForm.value.year) {
    yearError.value = '請選擇年度'
    return
  }
  if (!searchForm.value.theme) {
    themeError.value = '請選擇行銷主題'
    return
  }
  if (!searchForm.value.reportType) {
    reportTypeError.value = '請選擇報表類型'
    return
  }

  try {
    isLoading.value = true
    const { data } = await apiAuth.get(`/marketing/budgets/${searchForm.value.year}/${searchForm.value.theme}`)
    
    if (data.success) {
      // 整理資料格式
      reportData.value = processReportData(data.result)
      showReport.value = true
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

// 處理報表資料格式
const processReportData = (data) => {
  const channelGroups = {}
  
  data.items.forEach(item => {
    if (!channelGroups[item.channel._id]) {
      channelGroups[item.channel._id] = {
        channelName: item.channel.name,
        platforms: []
      }
    }
    
    channelGroups[item.channel._id].platforms.push({
      platformName: item.platform.name,
      budget: item.monthlyBudget
    })
  })
  
  return Object.values(channelGroups)
}

// 計算季度總額
const getQuarterTotal = (budget, quarter) => {
  const quarterMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }
  
  return quarterMap[quarter].reduce((sum, month) => sum + (budget[month] || 0), 0)
}

// 計算平台總額
const getPlatformTotal = (budget) => {
  return Object.values(budget).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算月度總額
const getMonthlyTotal = (month) => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (platform.budget[month] || 0)
    }, 0)
  }, 0)
}

// 計算季度總額
const getQuarterlyTotal = (quarter) => {
  const monthMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }

  return monthMap[quarter].reduce((sum, month) => sum + getMonthlyTotal(month), 0)
}

// 計算總金額
const getGrandTotal = () => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformTotal(platform.budget)
    }, 0)
  }, 0)
}

// 匯出 Excel
const exportToExcel = async () => {
  try {
    isExporting.value = true
    
    // 準備 CSV 內容
    const headers = ['廣告渠道', '平台', 'JAN', 'FEB', 'MAR', 'Q1', 'APR', 'MAY', 'JUN', 'Q2', 'JUL', 'AUG', 'SEP', 'Q3', 'OCT', 'NOV', 'DEC', 'Q4', 'Total']
    let csvContent = `${searchForm.value.year}年度 ${getThemeName(searchForm.value.theme)} ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}\n\n`
    
    // 添加表頭
    csvContent += headers.join(',') + '\n'
    
    // 添加數據行
    reportData.value.forEach(channel => {
      channel.platforms.forEach(platform => {
        const row = [
          channel.channelName,
          platform.platformName,
          platform.budget.JAN || 0,
          platform.budget.FEB || 0,
          platform.budget.MAR || 0,
          getQuarterTotal(platform.budget, 1),
          platform.budget.APR || 0,
          platform.budget.MAY || 0,
          platform.budget.JUN || 0,
          getQuarterTotal(platform.budget, 2),
          platform.budget.JUL || 0,
          platform.budget.AUG || 0,
          platform.budget.SEP || 0,
          getQuarterTotal(platform.budget, 3),
          platform.budget.OCT || 0,
          platform.budget.NOV || 0,
          platform.budget.DEC || 0,
          getQuarterTotal(platform.budget, 4),
          getPlatformTotal(platform.budget)
        ]
        csvContent += row.join(',') + '\n'
      })
    })
    
    // 添加總計行
    const totalRow = [
      '月度總計', '',
      getMonthlyTotal('JAN'),
      getMonthlyTotal('FEB'),
      getMonthlyTotal('MAR'),
      getQuarterlyTotal(1),
      getMonthlyTotal('APR'),
      getMonthlyTotal('MAY'),
      getMonthlyTotal('JUN'),
      getQuarterlyTotal(2),
      getMonthlyTotal('JUL'),
      getMonthlyTotal('AUG'),
      getMonthlyTotal('SEP'),
      getQuarterlyTotal(3),
      getMonthlyTotal('OCT'),
      getMonthlyTotal('NOV'),
      getMonthlyTotal('DEC'),
      getQuarterlyTotal(4),
      getGrandTotal()
    ]
    csvContent += totalRow.join(',')
    
    // 轉換為 Blob 並下載
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    createSnackbar({ text: 'CSV 匯出成功', snackbarProps: { color: 'success' } })
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}

// 匯出 PDF
const exportToPDF = async () => {
  try {
    isExporting.value = true

    // 獲取表格元素和標題
    const element = document.querySelector('.budget-table')
    if (!element) {
      throw new Error('找不到表格元素')
    }

    // 創建一個臨時容器
    const container = document.createElement('div')
    container.style.width = '1920px'
    container.style.backgroundColor = 'white'
    container.style.padding = '20px'
    container.style.boxSizing = 'border-box'
    
    // 添加標題
    const title = document.createElement('div')
    title.style.fontSize = '24px'
    title.style.fontWeight = '900'
    title.style.marginBottom = '24px'
    title.style.textAlign = 'center'
    title.style.color = '#000'
    title.innerHTML = `
      <div style="margin-bottom: 10px;">
        <span style="color: #F57C00;">${searchForm.value.year}</span> 年度 
        <span style="color: #D81B60;">${getThemeName(searchForm.value.theme)}</span> 
        ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}
      </div>
    `
    container.appendChild(title)
    
    // 複製表格並調整樣式
    const tableClone = element.cloneNode(true)
    tableClone.style.width = '100%'
    tableClone.style.fontSize = '14px'
    tableClone.style.borderCollapse = 'collapse'
    tableClone.style.fontFamily = 'Arial, sans-serif'
    tableClone.style.border = '1px solid #666'
    tableClone.style.tableLayout = 'fixed'

    // 調整表格內部樣式
    const headerCells = tableClone.querySelectorAll('thead th')
    headerCells.forEach(cell => {
      cell.style.backgroundColor = '#607D8B'
      cell.style.color = 'white'
      cell.style.padding = '12px 8px'
      cell.style.fontSize = '16px'
      cell.style.fontWeight = 'bold'
      cell.style.borderRight = '1px solid rgba(255, 255, 255, 0.3)'
      cell.style.borderBottom = '1px solid #666'
      cell.style.whiteSpace = 'nowrap'
      cell.style.overflow = 'hidden'
      cell.style.textOverflow = 'ellipsis'
      
      if (cell.classList.contains('header-cell-quarter')) {
        cell.style.backgroundColor = '#00ACC1'
      }
    })

    // 特別處理渠道名稱單元格
    const channelCells = tableClone.querySelectorAll('td[rowspan]')
    channelCells.forEach(cell => {
      cell.style.backgroundColor = '#f8f9fa'
      cell.style.width = '180px'
      cell.style.verticalAlign = 'middle'
      cell.style.fontWeight = 'bold'
      cell.style.borderRight = '1px solid #666'
      cell.style.position = 'relative'
      // 保持 rowspan 屬性
      const rowspan = cell.getAttribute('rowspan')
      if (rowspan) {
        cell.style.height = `${parseInt(rowspan) * 43}px` // 根據實際行高調整
      }
    })

    // 特別處理平台名稱單元格
    const platformCells = tableClone.querySelectorAll('.platform-col')
    platformCells.forEach(cell => {
      cell.style.backgroundColor = '#f8f9fa'
      cell.style.width = '180px'
      cell.style.verticalAlign = 'middle'
      cell.style.borderRight = '1px solid #666'
    })

    const bodyCells = tableClone.querySelectorAll('tbody td:not([rowspan])')
    bodyCells.forEach(cell => {
      cell.style.padding = '10px 8px'
      cell.style.fontSize = '14px'
      cell.style.borderRight = '1px solid #666'
      cell.style.borderBottom = '1px solid #666'
      cell.style.textAlign = 'center'
      cell.style.whiteSpace = 'nowrap'
      cell.style.overflow = 'hidden'
      cell.style.textOverflow = 'ellipsis'
      
      if (cell.classList.contains('quarter-col')) {
        cell.style.backgroundColor = '#FFE0B2'
        cell.style.fontWeight = 'bold'
        cell.style.width = '100px'
      } else if (cell.classList.contains('total-col')) {
        cell.style.backgroundColor = '#e2e2e2'
        cell.style.fontWeight = 'bold'
        cell.style.width = '120px'
      } else if (cell.classList.contains('month-col')) {
        cell.style.width = '100px'
        cell.style.backgroundColor = 'white'
      }
      
      if (cell.parentElement.classList.contains('monthly-total-row')) {
        cell.style.backgroundColor = '#e9ecef'
        cell.style.fontWeight = 'bold'
        
        // 確保月度總計列中的季度欄位保持橘色背景
        if (cell.classList.contains('quarter-col')) {
          cell.style.backgroundColor = '#FFE0B2'
        }
      }

      if (cell.classList.contains('highlight-total')) {
        cell.style.backgroundColor = '#ffd700'
      }
    })

    container.appendChild(tableClone)

    // 將容器添加到文檔中
    document.body.appendChild(container)

    // 計定 PDF 選項
    const opt = {
      margin: 5,
      filename: `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}.pdf`,
      image: { type: 'jpeg', quality: 0.9 },
      html2canvas: {
        scale: 6,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
        onclone: function(clonedDoc) {
          // 在克隆的文檔中重新處理 rowspan
          const clonedTable = clonedDoc.querySelector('.budget-table')
          if (clonedTable) {
            const rowspanCells = clonedTable.querySelectorAll('td[rowspan]')
            rowspanCells.forEach(cell => {
              const rowspan = cell.getAttribute('rowspan')
              if (rowspan) {
                cell.style.height = `${parseInt(rowspan) * 43}px`
              }
            })
          }
        }
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
        compress: true,
        precision: 16,
        putOnlyUsedFonts: true
      }
    }

    try {
      await html2pdf()
        .from(container)
        .set(opt)
        .save()
      createSnackbar({ text: 'PDF 匯出成功', snackbarProps: { color: 'success' } })
    } catch (error) {
      console.error('PDF 生成失敗:', error)
      throw error
    } finally {
      // 移除臨時容器
      document.body.removeChild(container)
    }
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}

// 錯誤處理
const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    user.logout()
    router.push('/login')
    createSnackbar({
      text: '登入已過期，請重新登入',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } else {
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await loadOptions()
})

const getThemeName = (themeId) => {
  const theme = themeOptions.value.find(t => t._id === themeId)
  return theme ? theme.name : ''
}
</script>

<style lang="scss" scoped>
.budget-table-title {
  text-align: center;
  font-size: 24px;
  font-weight: 900 !important;
  margin-bottom: 24px;
}

.budget-table {
  width: 100%;
  min-width: 1720px;
  border: 1px solid #666;
  border-radius: 8px;
  border-spacing: 0;
  border-collapse: separate;
  overflow-x: auto;
  overflow: hidden;

  :deep(thead) {
    .header-row {
      background-color: #607D8B;
      color: white;
      
      .header-cell {
        padding: 12px 8px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        border-right: 1px solid rgba(255, 255, 255, 0.3);
        border-bottom: 1px solid #666;
        min-width: 100px;
        vertical-align: middle;
        background-color: #607D8B;

        &:first-child {
          width: 180px;
          border-left: none;
        }
        &:nth-child(2) {
          width: 180px;
        }
        &:last-child {
          border-right: none;
        }
      }

      .header-cell-quarter {
        padding: 12px 8px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        border-right: 1px solid rgba(255, 255, 255, 0.3);
        border-bottom: 1px solid #666;
        min-width: 100px;
        vertical-align: middle;
        background-color: #00ACC1;
        
        &:last-child {
          border-right: none;
        }
      }
    }
  }

  :deep(tbody) {
    tr {
      background-color: #f8f9fa;

      td {
        padding: 4px;
        text-align: center;
        border-right: 1px solid #666;
        border-bottom: 1px solid #666;
        font-family: Arial, sans-serif;
        font-size: 14px;
        white-space: nowrap;

        &:first-child {
          border-left: none;
        }

        &:last-child {
          border-right: none;
        }

        &.month-col {
          background-color: white !important;
          min-width: 100px;
        }

        &.quarter-col {
          font-weight: 600;
          min-width: 100px;
          background-color: #FFE0B2;
        }

        &.total-col {
          background-color: #e2e2e2 !important;
          font-weight: 600;
          min-width: 120px;

          &.highlight-total {
            background-color: #ffd700 !important;
            font-weight: 700 !important;
          }
        }
      }

      &:last-child {
        td {
          border-bottom: none;


        }
      }
    }

    .monthly-total-row {
      background-color: #e9ecef !important;
      font-weight: 600;
      
      td {
        border-bottom: none;
        
        &.month-col {
          background-color: #e9ecef !important;
        }

        &.quarter-col {
          background-color: #FFE0B2 !important;
        }
      }

      &:hover {
        background-color: #e9ecef !important;
      }
    }
  }
}

.highlight-total {
  background-color: #ffd700;
  font-weight: 700;
}
</style>
