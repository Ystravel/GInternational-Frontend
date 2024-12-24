<template>
  <v-container max-width="2160">
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
                    <v-autocomplete
                      v-model="searchCriteria.theme"
                      :items="themeOptions"
                      label="行銷主題"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.channel"
                      :items="channelOptions"
                      label="廣告渠道"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.platform"
                      :items="platformOptions"
                      label="平台"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.detail"
                      :items="detailOptions"
                      label="線別"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-date-input
                      v-model="searchCriteria.createdDateRange"
                      label="建立日期"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      class="mb-6"
                    />
                    <v-date-input
                      v-model="searchCriteria.invoiceDateRange"
                      label="發票日期"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      class="mb-6"
                    />
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
                          :loading="isLoading"
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
      <v-col>
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-1 mx-0 mx-sm-4 ms-md-0 me-md-4 mb-4 bg-white">
          <!-- 標題區塊 -->
          <v-col
            cols="12"
            class="ps-3 pb-6 d-flex align-center"
          >
            <h3 class="d-inline">
              實際花費管理
            </h3>
          </v-col>

          <!-- 表格區塊 -->
          <v-col cols="12">
            <div class="d-flex align-center mb-4">
              <v-btn
                color="purple-darken-4"
                variant="outlined"
                prepend-icon="mdi-plus"
                @click="openDialog()"
              >
                新增實際花費
              </v-btn>
              <div
                style="width: 260px;"
                class="ms-auto d-flex align-center"
              >
                <v-icon
                  v-tooltip:start="'可搜尋備註、建立者'"
                  icon="mdi-information"
                  size="small"
                  color="deep-purple-darken-4"
                  class="me-2"
                />
                <v-text-field
                  v-model="searchText"
                  label="快速搜尋"
                  append-inner-icon="mdi-magnify"
                  :loading="isSearching"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleSearch"
                />
              </div>
            </div>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              density="compact"
              :headers="headers"
              :items="items"
              :items-length="totalItems"
              :loading="isLoading"
              class="elevation-0 rounded-lg"
            >
              <template #[`item.invoiceDate`]="{ item }">
                {{ formatDate(item.invoiceDate) }}
              </template>
              <template #[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <template #[`item.details`]="{ item }">
                <template v-if="Array.isArray(item.details) && item.details.length > 0">
                  {{ item.details.map(d => d.detail?.name || '').filter(Boolean).join('、') }}
                </template>
                <template v-else>
                  -
                </template>
              </template>

              <template #[`item.totalExpense`]="{ item }">
                {{ formatNumber(item.totalExpense || 0) }}
              </template>

              <template #[`item.actions`]="{ item }">
                <v-btn
                  icon
                  color="light-blue-darken-4"
                  variant="plain"
                  :size="buttonSize"
                  @click="editItem(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
    >
      <v-card class="rounded-lg px-4 py-6">
        <div
          v-if="isLoadingEdit"
          class="d-flex justify-center align-center"
          style="min-height: 300px;"
        >
          <v-progress-circular
            indeterminate
            color="purple-darken-4"
            size="64"
          />
        </div>
        <template v-else>
          <v-form
            ref="form"
            :disabled="isSubmitting"
            @submit.prevent="submit"
          >
            <div class="card-title px-8 py-3">
              {{ dialog.id ? '編輯實際花費' : '新增實際花費' }}
            </div>

            <v-card-text class="mt-2 mb-4 pa-3">
              <v-row>
                <v-col
                  cols="4"
                  class="px-8"
                >
                  <v-row class="border rounded-lg px-4 pt-2">
                    <v-col cols="12">
                      <v-date-input
                        v-model="invoiceDate.value.value"
                        :error-messages="invoiceDate.errorMessage.value"
                        label="*發票日期"
                        prepend-icon
                        variant="outlined"
                        density="compact"
                        ok-text="確認"
                        cancel-text="取消"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-autocomplete
                        v-model="theme.value.value"
                        :error-messages="theme.errorMessage.value"
                        :items="themeOptions"
                        item-title="name"
                        item-value="_id"
                        label="*行銷主題"
                        variant="outlined"
                        density="compact"
                        clearable
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-autocomplete
                        v-model="channel.value.value"
                        :error-messages="channel.errorMessage.value"
                        :items="channelOptions"
                        item-title="name"
                        item-value="_id"
                        label="*廣告渠道"
                        variant="outlined"
                        density="compact"
                        clearable
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-autocomplete
                        v-model="platform.value.value"
                        :error-messages="platform.errorMessage.value"
                        :items="platformOptions"
                        item-title="name"
                        item-value="_id"
                        label="*平台"
                        variant="outlined"
                        density="compact"
                        clearable
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="note.value.value"
                        :error-messages="note.errorMessage.value"
                        label="備註"
                        variant="outlined"
                        density="compact"
                        clearable
                        auto-grow
                        rows="3"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col
                  cols="8"
                  class="px-8"
                >
                  <v-row class="border rounded-lg px-4 pt-2">
                    <v-col cols="12">
                      <div class="d-flex align-center justify-space-between mb-4">
                        <div class="sub-title">
                          線別費用明細
                        </div>
                        <div class="d-flex gap-2 align-center">
                          <v-btn 
                            size="small"
                            prepend-icon="mdi-delete-sweep"
                            variant="outlined"
                            color="red-lighten-1"
                            :disabled="!hasAnyAmount"
                            @click="clearAllAmounts"
                          >
                            清除所有金額
                          </v-btn>
                          <v-btn 
                            size="small"
                            prepend-icon="mdi-delete-alert"
                            variant="outlined"
                            color="red-darken-2"
                            class="ms-2"
                            :disabled="detailsList.length <= 1"
                            @click="clearAllDetails"
                          >
                            刪除所有線別
                          </v-btn>
                          <v-btn 
                            size="small"
                            prepend-icon="mdi-calculator"
                            variant="outlined"
                            color="teal-darken-2"
                            class="ms-2"
                            :disabled="detailsList.length === 0"
                            @click="openAmountDialog"
                          >
                            平均帶入各線別
                          </v-btn>
                          
                          <v-btn 
                            size="small"
                            prepend-icon="mdi-plus"
                            variant="outlined"
                            class="ms-2"
                            @click="openAddDetailsDialog"
                          >
                            批量新增線別
                          </v-btn>
                          <v-btn
                            v-tooltip="'新增線別'"
                            icon
                            size="20"
                            color="grey-darken-2"
                            elevation="1"
                            class="ms-2"
                            @click="addDetail"
                          >
                            <v-icon size="14">
                              mdi-plus
                            </v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="details-grid">
                        <div
                          v-for="(detail, index) in detailsList"
                          :key="index"
                          class="detail-item"
                        >
                          <div class="d-flex align-center">
                            <div class="detail-number">
                              {{ index + 1 }}
                            </div>
                            <div class="detail-fields">
                              <div class="detail-field">
                                <v-autocomplete
                                  v-model="detail.detail"
                                  :error-messages="details.errorMessage?.value?.[index]?.detail"
                                  :items="detailOptions"
                                  item-title="name"
                                  item-value="_id"
                                  label="*線別"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  clearable
                                />
                              </div>
                              <div class="detail-field">
                                <v-text-field
                                  v-model="detail.amount"
                                  :error-messages="details.errorMessage?.value?.[index]?.amount"
                                  label="*費用"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  clearable
                                />
                              </div>
                              <div class="detail-action">
                                <v-btn
                                  v-if="detailsList.length > 1"
                                  icon
                                  color="error"
                                  variant="plain"
                                  :ripple="false"
                                  size="small"
                                  @click="removeDetail(index)"
                                >
                                  <v-icon>mdi-delete</v-icon>
                                </v-btn>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="d-flex justify-space-between align-center py-2 px-1">
                        <span class="text-subtitle-1">總金額：</span>
                        <span class="text-h6">{{ formatNumber(totalExpense) }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="px-8">
              <v-hover>
                <template #default="{ isHovering, props }">
                  <v-btn
                    v-if="dialog.id"
                    v-bind="props"
                    :color="isHovering ? 'red-lighten-1' : 'grey'"
                    variant="outlined"
                    :size="buttonSize"
                    prepend-icon="mdi-delete"
                    @click="confirmDeleteDialog = true"
                  >
                    刪除
                  </v-btn>
                </template>
              </v-hover>
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                :size="buttonSize"
                :loading="isSubmitting"
                @click="closeDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-1"
                :size="buttonSize"
                :loading="isSubmitting"
                :disabled="(dialog.id && !hasChanges) || isSubmitting"
              >
                送出
              </v-btn>
            </v-card-actions>
          </v-form>
        </template>
      </v-card>
    </v-dialog>

    <!-- 輸入總金額對話框 -->
    <v-dialog
      v-model="amountDialog.open"
      max-width="360"
      persistent
    >
      <v-card>
        <div class="card-title px-6 pt-6 pb-4">
          輸入總金額
        </div>
        <v-card-text class="px-6 pb-0">
          <v-text-field
            v-model="amountDialog.amount"
            label="總金額"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
            autofocus
            @keyup.enter="confirmAmount"
          />
        </v-card-text>
        <v-card-actions class="px-6 pt-2 pb-6 pt-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            @click="amountDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-2"
            variant="outlined"
            size="small"
            class="ms-2"
            :disabled="!amountDialog.amount || amountDialog.amount <= 0"
            @click="confirmAmount"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除實際花費"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${formatDate(originalData?.invoiceDate)}${originalData?.theme?.name}</span>」的實際花費嗎？ 此操作無法復原。`"
      :expected-name="`${formatDate(originalData?.invoiceDate)}${originalData?.theme?.name}`"
      input-label="發票日期及行銷主題"
      @confirm="deleteExpense"
    />

    <!-- 新增多個線別對話框 -->
    <v-dialog
      v-model="addDetailsDialog.open"
      max-width="360"
      persistent
    >
      <v-card>
        <div class="card-title px-6 pt-6 pb-4">
          批量新增線別
        </div>
        <v-card-text class="px-6 pb-0">
          <v-text-field
            v-model="addDetailsDialog.count"
            label="要新增的線別數量"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
            min="1"
            :rules="[value => !value || value < 1 ? '數量必須大於0' : true]"
            autofocus
            @keyup.enter="confirmAddDetails"
          />
        </v-card-text>
        <v-card-actions class="px-6 pt-4 pb-6">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            @click="addDetailsDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-2"
            variant="outlined"
            size="small"
            class="ms-2"
            :disabled="!addDetailsDialog.count || addDetailsDialog.count < 1"
            @click="confirmAddDetails"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認清除所有金額對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmClearAmountsDialog"
      title="確認清除所有金額"
      message="確定要清除所有線別的金額嗎？此操作無法復原。"
      confirm-button-text="清除"
      @confirm="confirmClearAllAmounts"
    />

    <!-- 確認刪除所有線別對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmClearDetailsDialog"
      title="確認刪除所有線別"
      message="確定要刪除所有線別嗎？此操作無法復原。"
      confirm-button-text="刪除"
      @confirm="confirmClearAllDetails"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { debounce } from 'lodash'
import { formatNumber } from '@/utils/format'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// 自定義日期格式化函數
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  // 創建一個 UTC 日期對象
  const utcDate = new Date(dateString)
  
  // 轉換為台灣時間（UTC+8）
  const taiwanDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  
  const year = taiwanDate.getUTCFullYear()
  const month = String(taiwanDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taiwanDate.getUTCDate()).padStart(2, '0')
  
  return `${year}/${month}/${day}`
}

const formatToDate = (dateString) => {
  return dateString ? new Date(dateString) : null
}

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '實際花費管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '1320' : '100%')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const isSearching = ref(false)
const isLoadingEdit = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  invoiceDate: yup.date().required('請選擇發票日期'),
  theme: yup.string().required('請選擇行銷主題'),
  channel: yup.string().required('請選擇廣告渠道'),
  platform: yup.string().required('請選擇平台'),
  note: yup.string()
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

// ===== 表單欄位 =====
const invoiceDate = useField('invoiceDate')
const theme = useField('theme')
const channel = useField('channel')
const platform = useField('platform')
const details = useField('details')
const note = useField('note')

// 新增線別明細相關
const detailsList = ref([{ detail: '', amount: '' }])

// 移除線別明細
const removeDetail = (index) => {
  if (detailsList.value.length > 1) {
    detailsList.value.splice(index, 1)
  }
}

// 計算總金額
const totalExpense = computed(() => {
  return detailsList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

// 監聽明細變化，同步到表單
watch(detailsList, (newValue) => {
  details.value.value = newValue
}, { deep: true })

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// ===== 表格設定 =====
const headers = [
  { title: '建立日期', key: 'createdAt', align: 'start', sortable: false },
  { title: '發票日期', key: 'invoiceDate', align: 'start', sortable: false },
  { title: '行銷主題', key: 'theme.name', align: 'start', sortable: false },
  { title: '廣告渠道', key: 'channel.name', align: 'start', sortable: false },
  { title: '平台', key: 'platform.name', align: 'start', sortable: false },
  { title: '線別', key: 'details', align: 'start', maxWidth: '150', sortable: false },
  { title: '總金額', key: 'totalExpense', align: 'start', sortable: false },
  { title: '備註', key: 'note', align: 'start', sortable: false },
  { title: '建立者', key: 'creator.name', align: 'start', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const items = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)

// ===== 選項資料 =====
const themeOptions = ref([])
const channelOptions = ref([])
const platformOptions = ref([])
const detailOptions = ref([])
const budgetOptions = ref([])

// ===== 搜尋相關設定 =====
const searchCriteria = ref({
  theme: null,
  channel: null,
  platform: null,
  detail: null,
  createdDateRange: [], // 建立日期範圍
  invoiceDateRange: []  // 發票日期範圍
})

const searchText = ref('')

const debouncedSearch = debounce(() => {
  page.value = 1
  loadData()
}, 300)

// 重置搜尋
const resetSearch = () => {
  searchCriteria.value = {
    theme: null,
    channel: null,
    platform: null,
    detail: null,
    createdDateRange: [],
    invoiceDateRange: []
  }
  searchText.value = ''
  page.value = 1
  loadData()
}

// 執行搜尋
const performSearch = async () => {
  try {
    page.value = 1
    await loadData()
  } catch (error) {
    console.error('搜尋時發生錯誤:', error)
    handleError(error)
  }
}

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false
  return JSON.stringify({
    invoiceDate: invoiceDate.value.value,
    theme: theme.value.value,
    channel: channel.value.value,
    platform: platform.value.value,
    details: detailsList.value,
    note: note.value.value
  }) !== JSON.stringify({
    invoiceDate: originalData.value.invoiceDate,
    theme: originalData.value.theme._id,
    channel: originalData.value.channel._id,
    platform: originalData.value.platform._id,
    details: originalData.value.details.map(d => ({
      detail: d.detail._id,
      amount: d.amount
    })),
    note: originalData.value.note
  })
})

// ===== 監聽器 =====
watch(searchText, () => {
  isSearching.value = true
  page.value = 1
  debouncedSearch()
})

watch([page, itemsPerPage], () => {
  loadData()
})

// 修改日期驗證監聽
watch(
  [
    () => searchCriteria.value.createdDateRange,
    () => searchCriteria.value.invoiceDateRange
  ],
  ([newCreatedDateRange, newInvoiceDateRange]) => {
    // 驗證建立日期範圍
    if (newCreatedDateRange && newCreatedDateRange.length > 0) {
      const start = new Date(newCreatedDateRange[0])
      const end = new Date(newCreatedDateRange[newCreatedDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '建立日期的結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.createdDateRange = []
      }
    }

    // 驗證發票日期範圍
    if (newInvoiceDateRange && newInvoiceDateRange.length > 0) {
      const start = new Date(newInvoiceDateRange[0])
      const end = new Date(newInvoiceDateRange[newInvoiceDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '發票日期的結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.invoiceDateRange = []
      }
    }
  }
)

// ===== 方法 =====
const loadData = async () => {
  try {
    isLoading.value = true
    const params = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    }

    // 處理快速搜尋
    if (searchText.value?.trim()) {
      params.search = searchText.value.trim()
    }

    // 處理條件搜尋
    if (searchCriteria.value.theme) {
      params.theme = searchCriteria.value.theme
    }
    if (searchCriteria.value.channel) {
      params.channel = searchCriteria.value.channel
    }
    if (searchCriteria.value.platform) {
      params.platform = searchCriteria.value.platform
    }
    if (searchCriteria.value.detail) {
      params.detail = searchCriteria.value.detail
    }

    // 處理建立日期範圍
    if (searchCriteria.value.createdDateRange && searchCriteria.value.createdDateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.createdDateRange[0])
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(searchCriteria.value.createdDateRange[searchCriteria.value.createdDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)
      
      params.createdDateStart = startDate.toISOString()
      params.createdDateEnd = endDate.toISOString()
    }

    // 處理發票日期範圍
    if (searchCriteria.value.invoiceDateRange && searchCriteria.value.invoiceDateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.invoiceDateRange[0])
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(searchCriteria.value.invoiceDateRange[searchCriteria.value.invoiceDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)
      
      params.invoiceDateStart = startDate.toISOString()
      params.invoiceDateEnd = endDate.toISOString()
    }

    console.log('搜尋參數:', params)

    const { data } = await apiAuth.get('/marketing/expenses/all', { params })
    if (data.success) {
      console.log('原始資料:', data.result.data) // 調試用

      items.value = data.result.data.map(item => {
        // 檢查並確保每個關聯欄位都有正確的資料
        const processedItem = {
          ...item,
          theme: item.theme || { name: '' },
          channel: item.channel || { name: '' },
          platform: item.platform || { name: '' },
          creator: item.creator || { name: '' },
          details: Array.isArray(item.details) 
            ? item.details.map((d, index) => ({
                ...d,
                detail: {
                  _id: d.detail?._id || d.detail,
                  // 從 detailsInfo 中獲取對應的名稱
                  name: item.detailsInfo?.[index]?.name || ''
                }
              }))
            : []
        }

        console.log('處理後的項目:', processedItem) // 調試用
        return processedItem
      })

      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
    isSearching.value = false
  }
}

const loadOptions = async () => {
  try {
    const [
      { data: themeData },
      { data: channelData },
      { data: platformData },
      { data: detailData }
    ] = await Promise.all([
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 2 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 3 } })
    ])

    if (themeData.success) {
      themeOptions.value = themeData.result
    }
    if (channelData.success) {
      channelOptions.value = channelData.result
    }
    if (platformData.success) {
      platformOptions.value = platformData.result
    }
    if (detailData.success) {
      detailOptions.value = detailData.result
    }

    // 載入預算表選項
    try {
      const { data: budgetData } = await apiAuth.get('/marketing/budgets/all', {
        params: {
          page: 1,
          itemsPerPage: 9999 // 獲取所有預算表
        }
      })
      if (budgetData.success) {
        budgetOptions.value = budgetData.result.data.map(budget => ({
          _id: budget._id,
          name: `${budget.year}年度 - ${budget.theme.name}`
        }))
      }
    } catch (error) {
      console.error('載入預算表選項失敗:', error)
    }
  } catch (error) {
    handleError(error)
  }
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  resetForm()
}

const editItem = async (item) => {
  try {
    console.log('編輯項目:', item)
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }

    // 先打開對話框並顯示載入中
    dialog.value = {
      open: true,
      id: item._id
    }
    isLoadingEdit.value = true

    // 獲取完整的資料
    const { data } = await apiAuth.get(`/marketing/expenses/${item._id}`)
    if (!data.success) {
      throw new Error('獲取資料失敗')
    }

    const fullItem = data.result
    
    invoiceDate.value.value = formatToDate(fullItem.invoiceDate)
    theme.value.value = fullItem.theme._id
    channel.value.value = fullItem.channel._id
    platform.value.value = fullItem.platform._id
    detailsList.value = fullItem.details.map(d => ({
      detail: d.detail._id,
      amount: d.amount
    }))
    note.value.value = fullItem.note
    originalData.value = fullItem
  } catch (error) {
    console.error('編輯項目發生錯誤:', error)
    handleError(error)
    dialog.value.open = false
  } finally {
    isLoadingEdit.value = false
  }
}

const closeDialog = () => {
  try {
    dialog.value = {
      open: false,
      id: ''
    }
    originalData.value = null
    detailsList.value = [{ detail: '', amount: '' }]
    resetForm()
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = handleSubmit(async (values) => {
  try {
    // 檢查是否有未填寫的線別或金額
    const hasEmptyDetails = detailsList.value.some(detail => !detail.detail || !detail.amount)

    if (hasEmptyDetails) {
      createSnackbar({
        text: '請確認選擇所有線別及費用皆已輸入',
        snackbarProps: { 
          color: 'red-lighten-1',
        }
      })
      return
    }

    isSubmitting.value = true
    
    const submitData = {
      ...values,
      invoiceDate: values.invoiceDate instanceof Date ? values.invoiceDate.toISOString() : values.invoiceDate,
      year: values.invoiceDate instanceof Date ? values.invoiceDate.getFullYear() : new Date(values.invoiceDate).getFullYear(),
      details: detailsList.value,
      totalExpense: totalExpense.value
    }

    if (dialog.value.id) {
      await apiAuth.patch(`/marketing/expenses/${dialog.value.id}`, submitData)
      createSnackbar({
        text: '實際花費更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      await apiAuth.post('/marketing/expenses', submitData)
      createSnackbar({
        text: '實際花費新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteExpense = async () => {
  if (!dialog.value.id) return
  
  try {
    await apiAuth.delete(`/marketing/expenses/${dialog.value.id}`)
    createSnackbar({
      text: '實際花費刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
}

const handleSearch = () => {
  isSearching.value = true
  page.value = 1
  debouncedSearch()
}

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

// 新增總金額對話框相關
const amountDialog = ref({
  open: false,
  amount: ''
})

// 開啟總金額對話框
const openAmountDialog = () => {
  amountDialog.value = {
    open: true,
    amount: ''
  }
}

// 確認總金額並分配
const confirmAmount = () => {
  const total = Number(amountDialog.value.amount)
  if (!total || total <= 0) return

  // 計算已填寫金額的線別總和
  const filledDetails = detailsList.value.filter(d => d.amount > 0)
  const filledTotal = filledDetails.reduce((sum, d) => sum + Number(d.amount), 0)

  // 計算剩餘可分配金額
  const remainingAmount = total - filledTotal

  // 找出未填寫金額的線別
  const unfilledDetails = detailsList.value.filter(d => !d.amount || d.amount <= 0)
  
  if (unfilledDetails.length === 0) {
    createSnackbar({
      text: '所有線別已填寫金額',
      snackbarProps: { color: 'warning' }
    })
    amountDialog.value.open = false
    return
  }

  // 計算每個未填寫線別應得的基本金額（取整數）
  const baseAmount = Math.floor(remainingAmount / unfilledDetails.length)
  
  // 計算餘數
  const remainder = remainingAmount - (baseAmount * unfilledDetails.length)
  
  // 計算需要分配餘數的項目數（餘數有多少就分給多少個項目）
  const itemsToDistribute = Math.min(remainder, unfilledDetails.length)

  // 分配金額給未填寫的線別
  unfilledDetails.forEach((detail, index) => {
    const detailIndex = detailsList.value.findIndex(d => d === detail)
    if (detailIndex !== -1) {
      // 前面的項目每個多分配1元，直到餘數用完
      detailsList.value[detailIndex].amount = index < itemsToDistribute
        ? baseAmount + 1
        : baseAmount
    }
  })

  amountDialog.value.open = false
}

// 檢查是否有任何金額被填寫
const hasAnyAmount = computed(() => {
  return detailsList.value.some(detail => Number(detail.amount) > 0)
})

// 確認對話框狀態
const confirmClearAmountsDialog = ref(false)
const confirmClearDetailsDialog = ref(false)

// 修改清除所有金額的方法
const clearAllAmounts = () => {
  confirmClearAmountsDialog.value = true
}

// 確認清除所有金額
const confirmClearAllAmounts = () => {
  detailsList.value = detailsList.value.map(detail => ({
    ...detail,
    amount: ''
  }))
  createSnackbar({
    text: '已清除所有線別金額',
    snackbarProps: { color: 'teal-lighten-1' }
  })
  confirmClearAmountsDialog.value = false
}

// 修改清除所有線別的方法
const clearAllDetails = () => {
  confirmClearDetailsDialog.value = true
}

// 確認清除所有線別
const confirmClearAllDetails = () => {
  detailsList.value = [{ detail: '', amount: '' }]
  createSnackbar({
    text: '已刪除所有線別',
    snackbarProps: { color: 'teal-lighten-1' }
  })
  confirmClearDetailsDialog.value = false
}

// 新增多個線別對話框相關
const addDetailsDialog = ref({
  open: false,
  count: ''
})

// 開啟新增多個線別對話框
const openAddDetailsDialog = () => {
  addDetailsDialog.value = {
    open: true,
    count: ''
  }
}

// 確認新增多個線別
const confirmAddDetails = () => {
  const count = Number(addDetailsDialog.value.count)
  if (!count || count < 1) return

  // 新增指定數量的線別，金額預設為空值
  for (let i = 0; i < count; i++) {
    detailsList.value.push({ detail: '', amount: '' })
  }

  createSnackbar({
    text: `已新增 ${count} 個線別`,
    snackbarProps: { color: 'teal-lighten-1' }
  })

  addDetailsDialog.value.open = false
}

// 新增線別明細
const addDetail = () => {
  detailsList.value.push({ detail: '', amount: '' })
}

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadOptions()
  ])
})
</script>

<style lang="scss" scoped>
:deep(.v-data-table) {
  thead {
    background: #5c0199;
    color: #fff;
    
  }
  .v-data-table__tr {
    &:nth-child(odd) {
      background: #f8fcff;
    }
    &:nth-child(even) {
      background: #fffef2;
    }
    &:hover {
      background: #e0e0e0 !important;
    }
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 8px;
}

.detail-item {
  background-color: #f6f6f6;
  border-radius: 8px;
  padding: 8px;
  
  &:hover {
    background-color: #eeeeee;
  }

  .detail-fields {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;

    .detail-field {
      width: calc(50% - 20px); // 減去間距和按鈕的空間
      min-width: 0; // 防止內容溢出
    }

    .detail-action {
      width: 32px;
      display: flex;
      justify-content: center;
    }
  }

  .detail-number {
    min-width: 18px;
    height: 18px;
    background-color: #5c0199;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
}

/* 自定義滾動條樣式 */
.details-grid::-webkit-scrollbar {
  width: 8px;
}

.details-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.details-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.details-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
