<template>
  <v-container max-width="2500">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5">
      <v-col
        cols="12"
        lg="4"
        xl="3"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 px-lg-10"
          >
            <v-card class="elevation-4 rounded-lg py-4 py-sm-8 px-4 px-sm-4 px-xl-8">
              <v-card-title class="font-weight-bold d-flex align-center">
                搜尋條件
              </v-card-title>
              <v-card-text class="pa-2">
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <!-- 操作人員自動完成 -->
                    <v-autocomplete
                      v-model="searchCriteria.operatorId"
                      v-model:search-input="operatorSearchInput"
                      :items="operatorSuggestions"
                      :loading="operatorLoading"
                      label="操作人員"
                      return-object
                      :item-props="item => ({
                        key: item._id,
                        title: formatUserDisplay(item),
                        value: item
                      })"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:search="handleOperatorSearch"
                      @click:clear="clearOperatorSearch"
                    >
                      <template #selection="{ item }">
                        {{ formatUserDisplay(item.raw) }}
                      </template>
                      <template
                        v-if="smAndUp"
                        #append-inner
                      >
                        <v-tooltip
                          location="top"
                          close-delay="200"
                        >
                          <template #activator="{ props }">
                            <v-icon
                              v-bind="props"
                              icon="mdi-information"
                              size="18"
                            />
                          </template>
                          輸入使用者編號、管理者編號或姓名查詢
                        </v-tooltip>
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.targetModel"
                      :items="modelOptions"
                      label="資料類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-autocomplete
                      v-model="searchCriteria.targetId"
                      v-model:search-input="targetSearchInput"
                      :items="targetSuggestions"
                      :loading="targetLoading"
                      :label="targetType ? '操作對象' : '操作對象(請先選擇資料類型)'"
                      :disabled="!targetType"
                      return-object
                      :item-props="item => ({
                        key: item._id || item.name,
                        title: formatTargetDisplay(item),
                        value: item
                      })"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:search="handleTargetSearch"
                      @click:clear="clearTargetSearch"
                    >
                      <template #selection="{ item }">
                        {{ formatTargetDisplay(item.raw) }}
                      </template>
                      <template
                        v-if="smAndUp"
                        #append-inner
                      >
                        <v-tooltip
                          location="top"
                          close-delay="200"
                        >
                          <template #activator="{ props }">
                            <v-icon
                              v-bind="props"
                              icon="mdi-information"
                              size="18"
                            />
                          </template>
                          輸入使用者編號、表單編號或姓名查詢
                        </v-tooltip>
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.action"
                      :items="actionOptions"
                      label="操作類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                  
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-date-input
                      v-model="searchCriteria.dateRange"
                      label="日期區間"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="12"
                    class="d-flex justify-end gap-2"
                  >
                    <v-row class="d-flex justify-space-between">
                      <v-col cols="3">
                        <v-btn
                          color="grey"
                          width="40"
                          block
                          @click="resetSearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="9"
                        class="ps-0"
                      >
                        <v-btn
                          color="cyan-darken-2"
                          prepend-icon="mdi-magnify"
                          :loading="tableLoading"
                          block
                          @click="performSearch"
                        >
                          搜尋
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- 表格區 -->
      <v-col
        cols="12"
        lg="8"
        xl="9"
        class="px-6 ps-lg-4 pe-lg-12 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-4 px-md-10 mt-1 bg-white">
          <v-col
            cols="12"
            class="ps-4 pb-sm-6"
          >
            <h3>異動紀錄</h3>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :items="tableItems"
              :headers="filteredHeaders"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :items-per-page-options="[10, 20, 50, 100]"
              :page="tablePage"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ formatDateTime(item.createdAt) }}</td>
                  <td v-if="smAndUp">
                    {{ formatOperator(item) }}
                  </td>
                  <td>{{ getModelDisplay(item.targetModel) }}</td>
                  <td v-if="smAndUp">
                    {{ item.action }}
                  </td>
                  <td v-if="mdAndUp">
                    {{ formatTarget(item) }}
                  </td>
                  <td
                    v-if="lgAndUp"
                    class="py-3"
                    style="max-width: 420px; overflow-wrap: break-word;"
                  >
                    <div
                      v-for="(change, idx) in formatChanges(item)"
                      :key="idx"
                    >
                      {{ change }}
                    </div>
                  </td>
                  <td
                    v-if="!lgAndUp"
                    class="text-center"
                  >
                    <v-icon
                      icon="mdi-book-open-variant-outline"
                      color="blue-grey-darken-3"
                      size="small"
                      class="my-4"
                      @click="showDetail(item)"
                    />
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <!-- 詳細資料 Dialog -->
  <v-dialog
    v-model="detailDialog"
    width="600"
  >
    <v-card class="pa-4">
      <div class="ps-6 pt-4 pb-1 pb-sm-3 card-title">
        異動詳細資料
      </div>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作時間
                </div>
                <div class="list-content">
                  {{ formatDateTime(selectedItem?.createdAt) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作人員
                </div>
                <div class="list-content">
                  {{ formatOperator(selectedItem) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  資料類型
                </div>
                <div class="list-content">
                  {{ getModelDisplay(selectedItem?.targetModel) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作類型
                </div>
                <div class="list-content">
                  {{ selectedItem?.action }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作對象
                </div>
                <div class="list-content">
                  {{ formatTarget(selectedItem) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  異動內容
                </div>
                <div
                  v-if="formatChanges(selectedItem).length > 0"
                  class="list-content"
                >
                  <ul class="change-list">
                    <li
                      v-for="(change, index) in formatChanges(selectedItem)"
                      :key="index"
                      class="py-2"
                    >
                      {{ change }}
                    </li>
                  </ul>
                </div>
                <div v-else>
                  無異動內容
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="detailDialog = false"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { debounce } from 'lodash'
import { definePage } from 'vue-router/auto'
import { useSnackbar } from 'vuetify-use-dialog'

definePage({
  meta: {
    title: '異動紀錄 | GInternational',
    login: true,
    admin: true
  }
})

const { smAndUp, mdAndUp, lgAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// 自動完成相關
const operatorSuggestions = ref([])
const operatorLoading = ref(false)
const operatorSearchInput = ref('')

const targetSuggestions = ref([])
const targetLoading = ref(false)
const targetSearchInput = ref('')

// 表格相關
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'createdAt', order: 'desc' }])

// 搜尋條件
const searchCriteria = ref({
  operatorId: null,
  targetId: null,
  action: '',
  targetModel: '',
  dateRange: [],
  quickSearch: ''
})

// Dialog 相關
const detailDialog = ref(false)
const selectedItem = ref(null)

// 選項定義
const actionOptions = [
  { title: '創建', value: '創建' },
  { title: '修改', value: '修改' },
  { title: '刪除', value: '刪除' }
]

const modelOptions = [
  { title: '使用者', value: 'users' },
  { title: '表單', value: 'forms' },
  { title: '表單模板', value: 'formTemplates' }
]

// 表格標頭
const tableHeaders = [
  { title: '操作時間', align: 'start', sortable: true, key: 'createdAt' },
  { title: '操作人員', align: 'start', sortable: true, key: 'operator.name' },
  { title: '資料類型', align: 'start', sortable: true, key: 'targetModel' },
  { title: '操作類型', align: 'start', sortable: true, key: 'action' },
  { title: '操作對象', align: 'start', sortable: true, key: 'targetInfo.name' },
  { title: '異動內容', align: 'start', sortable: false, key: 'changes' },
  { title: '查看', align: 'center', sortable: false, key: 'actions' }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    return tableHeaders.filter(header =>
      ['createdAt', 'targetModel', 'actions'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    return tableHeaders.filter(header =>
      ['createdAt', 'operator.name', 'targetModel', 'action', 'actions'].includes(header.key)
    )
  }
  if (lgAndUp.value) {
    return tableHeaders.filter(header => !['actions'].includes(header.key))
  }
  return tableHeaders.filter(header => header.key !== 'changes')
})

// 欄位名稱翻譯
const fieldTranslations = {
  name: '姓名',
  email: '電子郵件',
  role: '權限',
  userId: '使用者編號',
  adminId: '管理員編號',
  formNumber: '表單編號',
  clientName: '客戶名稱',
  projectName: '專案名稱',
  type: '類型',
  componentName: '組件名稱',
  note: '備註',
  isActive: '啟用狀態',
  employmentStatus: '任職狀態',
}

// 格式化函數
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 角色轉換
const formatRole = (role) => {
  const roleMap = {
    0: '一般用戶',
    1: '經理',
    2: '管理者'
  }
  return roleMap[role] || role
}

const getModelDisplay = (model) => {
  const modelMap = {
    users: '使用者',
    forms: '表單',
    formTemplates: '表單模板'
  }
  return modelMap[model] || model
}

const formatOperator = (item) => {
  if (!item?.operatorInfo) return '-'
  const { name, userId, adminId } = item.operatorInfo
  if (adminId) {
    return `${name} (${adminId})`
  }
  return `${name}${userId ? ` (${userId})` : ''}`
}

const formatTarget = (item) => {
  if (!item?.targetInfo) return '-'
  const { name, userId, formNumber } = item.targetInfo
  if (formNumber) return `${formNumber}`
  return `${name}${userId ? ` (${userId})` : ''}`
}

// 格式化布林值
const formatBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  return value
}

const formatChanges = (item) => {
  if (!item?.changes) return []
  const changes = []

  // 處理創建操作
  if (item.action === '創建') {
    const after = item.changes.after || {}
    Object.entries(after).forEach(([key, value]) => {
      if (fieldTranslations[key]) {
        // 特殊處理 role 欄位
        if (key === 'role') {
          changes.push(`${fieldTranslations[key]}: ${formatRole(value)}`)
        } 
        // 特殊處理布林值
        else if (typeof value === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(value)}`)
        }
        // 處���空值或 undefined
        else {
          changes.push(`${fieldTranslations[key]}: ${value || '(無)'}`)
        }
      }
    })
    if (changes.length === 0) {
      changes.push(`新增${getModelDisplay(item.targetModel)}`)
    }
    return changes
  }

  // 處理修改和刪除操作
  const { before = {}, after = {} } = item.changes
  
  // 只處理 after 中存在的欄位
  Object.keys(after).forEach(key => {
    if (fieldTranslations[key] && before[key] !== after[key]) {
      // 特殊處理 role 欄位
      if (key === 'role') {
        changes.push(`${fieldTranslations[key]}: ${formatRole(before[key])} → ${formatRole(after[key])}`)
      }
      // 特殊處理布林值
      else if (typeof before[key] === 'boolean' || typeof after[key] === 'boolean') {
        changes.push(`${fieldTranslations[key]}: ${formatBoolean(before[key])} → ${formatBoolean(after[key])}`)
      }
      else {
        changes.push(`${fieldTranslations[key]}: ${before[key] || '(無)'} → ${after[key] || '(無)'}`)
      }
    }
  })

  return changes
}

// 尋相關函數
const handleOperatorSearch = debounce(async (text) => {
  if (!text) return
  operatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/user/suggestions', {
      params: { search: text }
    })
    if (data.success) {
      operatorSuggestions.value = data.result
    }
  } catch (error) {
    console.error('搜尋操作人員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋操作人員失敗',
      snackbarProps: { color: 'error' }
    })
    operatorSuggestions.value = []
  } finally {
    operatorLoading.value = false
  }
}, 300)

const clearOperatorSearch = () => {
  operatorSearchInput.value = ''
  operatorSuggestions.value = []
  searchCriteria.value.operatorId = null
}

// 添加 targetType 計算屬性
const targetType = computed(() => searchCriteria.value.targetModel)

// 修改 handleTargetSearch 函數
const handleTargetSearch = debounce(async (text) => {
  console.log('搜尋開始，輸入文字:', text)
  console.log('目前選擇的 targetType:', targetType.value)
  
  if (!text || !targetType.value) return
  targetLoading.value = true
  try {
    let endpoint = ''
    let params = {}

    switch (targetType.value) {
      case 'users':
        endpoint = '/user/suggestions'
        params = { search: text }
        break
      case 'forms':
        endpoint = '/forms/suggestions'
        params = { search: text }
        break
      case 'formTemplates':
        endpoint = '/formTemplates/suggestions'
        params = { search: text }
        break
      default:
        return
    }

    console.log('準備發送請求到:', endpoint, '參數:', params)
    const { data } = await apiAuth.get(endpoint, { params })
    console.log('API 回應:', data)
    
    if (data.success) {
      if (targetType.value === 'formTemplates') {
        // 確保回傳的資料格式正確
        targetSuggestions.value = data.result.map(item => ({
          _id: item._id,
          name: item.name
        }))
      } else {
        targetSuggestions.value = data.result
      }
    }
  } catch (error) {
    console.error('搜尋操作對象失敗:', error)
    console.error('錯誤詳情:', {
      message: error?.message,
      response: error?.response?.data
    })
    createSnackbar({
      text: error?.response?.data?.message || '搜尋操作對象失敗',
      snackbarProps: { color: 'error' }
    })
    targetSuggestions.value = []
  } finally {
    targetLoading.value = false
  }
}, 300)

const clearTargetSearch = () => {
  targetSearchInput.value = ''
  targetSuggestions.value = []
  searchCriteria.value.targetId = null
}

const resetSearch = () => {
  searchCriteria.value = {
    operatorId: null,
    targetId: null,
    action: '',
    targetModel: '',
    dateRange: []
  }
  clearOperatorSearch()
  clearTargetSearch()
  performSearch()
}

const performSearch = async () => {
  console.log('開始執行搜尋，搜尋條件:', searchCriteria.value)
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value
    }

    // 處理排序
    if (tableSortBy.value.length > 0) {
      const sortItem = tableSortBy.value[0]
      params.sortBy = sortItem.key
      params.sortOrder = sortItem.order === 'desc' ? -1 : 1
    }

    // 處理搜尋條件
    if (searchCriteria.value.operatorId?._id) {
      params.operatorId = searchCriteria.value.operatorId._id
    }
    if (searchCriteria.value.action) {
      params.action = searchCriteria.value.action
    }
    if (searchCriteria.value.targetModel) {
      params.targetModel = searchCriteria.value.targetModel
    }
    
    // 處理日期範圍
    if (searchCriteria.value.dateRange && searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      startDate.setHours(0, 0, 0, 0)
      params.startDate = startDate.toISOString()

      const endDate = searchCriteria.value.dateRange.length > 1 
        ? new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])
        : new Date(searchCriteria.value.dateRange[0])
      endDate.setHours(23, 59, 59, 999)
      params.endDate = endDate.toISOString()
    }

    // 處理操作對象
    if (searchCriteria.value.targetId) {
      console.log('處理操作對象:', searchCriteria.value.targetId)
      if (searchCriteria.value.targetModel === 'formTemplates') {
        // 如果是表單模板，使用 _id
        params.targetId = searchCriteria.value.targetId._id
      } else {
        params.targetId = searchCriteria.value.targetId._id
      }
    }

    console.log('發送搜尋請求，參數:', params)
    const { data } = await apiAuth.get('/auditLogs', { params })
    console.log('搜尋回應:', data)
    
    if (data.success) {
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    console.error('錯誤詳情:', {
      message: error?.message,
      response: error?.response?.data
    })
    createSnackbar({
      text: error?.response?.data?.message || '搜尋失敗',
      snackbarProps: { color: 'error' }
    })
    tableItems.value = []
    tableItemsLength.value = 0
  } finally {
    tableLoading.value = false
  }
}

const handleTableOptionsChange = async (options) => {
  tablePage.value = options.page
  tableItemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }
  await performSearch()
}

const showDetail = (item) => {
  selectedItem.value = item
  detailDialog.value = true
}

// 初始載入
onMounted(async () => {
  await performSearch()
})

// 修改 formatUserDisplay 函數
const formatUserDisplay = (user) => {
  if (!user) return ''
  if (user.adminId) {
    return `${user.name} (${user.adminId})`
  }
  return `${user.name} (${user.userId || ''})`
}

// 修改 formatTargetDisplay 函數
const formatTargetDisplay = (item) => {
  if (!item) return ''
  
  switch (targetType.value) {
    case 'users':
      if (item.adminId) {
        return `${item.name} (${item.adminId})`
      }
      return `${item.name}${item.userId ? ` (${item.userId})` : ''}`
    case 'forms':
      return `${item.formNumber}${item.clientName ? ` - ${item.clientName}` : ''}`
    case 'formTemplates':
      return item.name || ''
    default:
      return ''
  }
}

// 監聽資料類型變更
watch(() => searchCriteria.value.targetModel, () => {
  // 當資料類型改變時，清空操作對象
  clearTargetSearch()
})

// 添加日期驗證監聽
watch(
  [
    () => searchCriteria.value.dateRange
  ],
  ([newDateRange]) => {
    if (newDateRange && newDateRange.length > 0) {
      const start = new Date(newDateRange[0])
      const end = new Date(newDateRange[newDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.dateRange = []
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.odd-row {
  background-color: #fcfcfc;
}

.even-row {
  background-color: rgb(245, 255, 251);
}

.v-data-table {
  :deep(.text-wrap) {
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.change-list {
  padding-left: 16px;
  list-style-type: disc;

  li {
    line-height: 1.2;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

:deep(.v-data-table) {
  thead {
    background-color: #455A64;
    color: #fff;
  }
  td {
    white-space: pre-line;
  }
}

.list-title {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.list-content {
  font-size: 14px;
  line-height: 1.4;
}
</style>
