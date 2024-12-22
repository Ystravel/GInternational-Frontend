<template>
  <v-container max-width="2000">
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
                    <v-select
                      v-model="searchCriteria.year"
                      :items="yearOptions"
                      label="年度"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
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
              行銷預算管理
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
                新增預算表
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :headers="headers"
              :items="items"
              :items-length="totalItems"
              :loading="isLoading"
              class="elevation-0 rounded-lg"
            >
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
      <v-form
        ref="form"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg pb-4">
          <div class="card-title px-6 py-6">
            {{ dialog.id ? '編輯預算表' : '新增預算表' }}
          </div>

          <v-card-text>
            <div
              v-if="isLoadingBudget"
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
              <!-- 年度和主題選擇 -->
              <v-row class="mb-6">
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-select
                    v-model="year.value.value"
                    :error-messages="year.errorMessage.value"
                    :items="yearOptions"
                    label="*年度"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
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
                <v-col 
                  cols="12"
                  sm="4"
                >
                  <v-textarea
                    v-model="note.value.value"
                    :error-messages="note.errorMessage.value"
                    label="備註"
                    variant="outlined"
                    density="compact"
                    clearable
                    auto-grow
                    rows="1"
                  />
                </v-col>
              </v-row>

              <!-- 預算表格 -->
              <div class="budget-table">
                <div class="budget-table-title text-center mb-4">
                  <span class="text-orange-darken-2">{{ year.value.value ? `${year.value.value}` : '( 請先選擇年度 )' }}</span> 年度 <span class="text-pink-darken-1">{{ theme.value.value ? getThemeName(theme.value.value) : '( 請先選擇行銷主題 )' }}</span> 行銷廣告預算表
                </div>

                <v-table class="budget-grid">
                  <!-- 表頭 -->
                  <thead class="budget-header">
                    <tr>
                      <th class="delete-button-col" />
                      <th class="channel-col">
                        廣告渠道
                        <!-- 渠道新增按鈕 -->
                        <v-btn
                          v-tooltip="'新增廣告渠道'"
                          icon
                          size="24"
                          class="add-button ms-4"
                          @click="addChannel"
                        >
                          <v-icon
                            size="18"
                            color="teal-darken-2"
                            style="font-weight: 900;"
                          >
                            mdi-plus
                          </v-icon>
                        </v-btn>
                      </th>
                      <th class="delete-button-col" />
                      <th class="platform-col">
                        平台
                      </th>
                      <th
                        v-for="(month, key) in monthList"
                        :key="key"
                        class="month-col text-center"
                      >
                        {{ month }}
                      </th>
                    </tr>
                  </thead>

                  <!-- 表格內容 -->
                  <tbody>
                    <template
                      v-for="(channel, channelIndex) in budgetData"
                      :key="channelIndex"
                    >
                      <template
                        v-for="(platform, platformIndex) in channel.platforms"
                        :key="`${channelIndex}-${platformIndex}`"
                      >
                        <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                          <!-- 渠道名稱和刪除按鈕 -->
                          <template v-if="platformIndex === 0">
                            <td
                              v-if="platformIndex === 0"
                              class="delete-button-col"
                              :rowspan="channel.platforms.length"
                            >
                              <v-btn
                                v-if="budgetData.length > 1"
                                v-tooltip="'刪除廣告渠道'"
                                icon
                                size="24"
                                color="red-lighten-1"
                                class="delete-button"
                                @click="removeChannel(channelIndex)"
                              >
                                <v-icon size="14">
                                  mdi-minus
                                </v-icon>
                              </v-btn>
                            </td>
                            <td
                              class="channel-col"
                              :rowspan="channel.platforms.length"
                            >
                              <div class="d-flex align-center">
                                <v-autocomplete
                                  v-model="channel.channelId"
                                  :items="channelOptions"
                                  item-title="name"
                                  item-value="_id"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  class="channel-select"
                                />
                                <!-- 新增平台按鈕 -->
                                <v-btn
                                  v-tooltip="'新增平台'"
                                  icon
                                  size="24"
                                  color="purple-darken-4"
                                  class="ms-4"
                                  @click="addPlatform(channelIndex)"
                                >
                                  <v-icon size="14">
                                    mdi-plus
                                  </v-icon>
                                </v-btn>
                              </div>
                            </td>
                          </template>

                          <!-- 平台選擇和刪除按鈕 -->
                          <td class="delete-button-col">
                            <v-btn
                              v-if="channel.platforms.length > 1"
                              v-tooltip="'刪除平台'"
                              icon
                              size="24"
                              color="amber-darken-4"
                              class="delete-button"
                              @click="removePlatform(channelIndex, platformIndex)"
                            >
                              <v-icon size="14">
                                mdi-minus
                              </v-icon>
                            </v-btn>
                          </td>
                          <td class="platform-col">
                            <v-autocomplete
                              v-model="platform.platformId"
                              :items="platformOptions"
                              item-title="name"
                              item-value="_id"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="platform-select"
                            />
                          </td>

                          <!-- 月份金額輸入 -->
                          <td
                            v-for="monthKey in Object.keys(monthList)"
                            :key="monthKey"
                            class="month-col"
                          >
                            <v-text-field
                              v-model="platform.budget[monthKey]"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="month-input"
                            />
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </v-table>
              </div>
            </template>
          </v-card-text>

          <v-card-actions class="px-6 py-4">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="dialog.id"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  :size="buttonSize"
                  @click="confirmDeleteDialog = true"
                >
                  永久刪除
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
              class="ms-2"
              :size="buttonSize"
              :loading="isSubmitting"
              :disabled="(dialog.id && !hasChanges) || isSubmitting"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除預算表"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.year}年度${originalData?.theme?.name}</span>」的預算表嗎？此操作無法復原。`"
      :expected-name="`${originalData?.year}年${originalData?.theme?.name}`"
      input-label="預算表名稱"
      @confirm="deleteBudget"
    />

    <!-- 確認刪除渠道對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteChannelDialog.show"
      title="確認刪除廣告渠道"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'> ${getChannelName(confirmDeleteChannelDialog.channelId)} </span>」廣告渠道嗎？會連同底下平台及金額一同刪除。`"
      @confirm="confirmDeleteChannel"
    />

    <!-- 確認刪除平台對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeletePlatformDialog.show"
      title="確認刪除平台"
      :message="`確定要刪除「<span class='text-teal-darken-1' style='font-weight: 800;'> ${getPlatformName(confirmDeletePlatformDialog.platformId)} </span>」平台嗎？`"
      @confirm="confirmDeletePlatform"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useForm, useField } from 'vee-validate'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as yup from 'yup'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷預算管理 | GInternational',
    login: true,
    admin: true
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const router = useRouter()
const user = useUserStore()
// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '92%' : '100%')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const isLoadingBudget = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  year: yup.string().required('請選擇年度'),
  theme: yup.string().required('請選擇行銷主題')
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    year: '',
    theme: ''
  }
})

// ===== 表單欄位 =====
const year = useField('year')
const theme = useField('theme')
const note = useField('note')
const budgetItems = useField('budgetItems')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// ===== 表格設定 =====
const headers = [
  { title: '年度', key: 'year', align: 'start', sortable: false },
  { title: '行銷主題', key: 'theme.name', align: 'start', sortable: false },
  { title: '總預算', key: 'totalBudget', align: 'start', sortable: false },
  { title: '備註', key: 'note', align: 'start', sortable: false },
  { title: '建立者', key: 'creator.name', align: 'start', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const items = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)

// ===== 選項資料 =====
const yearOptions = ref([])
const themeOptions = ref([])
const channelOptions = ref([])
const platformOptions = ref([])

// ===== 搜尋相關設定 =====
const searchCriteria = ref({
  year: null,
  theme: null
})

// ===== 月份列表 =====
const monthList = {
  JAN: '一月',
  FEB: '二月',
  MAR: '三月',
  APR: '四月',
  MAY: '五月',
  JUN: '六月',
  JUL: '七月',
  AUG: '八月',
  SEP: '九月',
  OCT: '十月',
  NOV: '十一月',
  DEC: '十二月'
}

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false
  return JSON.stringify({
    year: year.value.value,
    theme: theme.value.value,
    note: note.value.value,
    budgetItems: budgetItems.value.value
  }) !== JSON.stringify({
    year: originalData.value.year,
    theme: originalData.value.theme._id,
    note: originalData.value.note,
    budgetItems: originalData.value.items.map(item => ({
      channel: item.channel._id,
      platform: item.platform._id,
      monthlyBudget: item.monthlyBudget
    }))
  })
})

// ===== 預算表資料 =====
const budgetData = ref([{
  channelId: '',
  platforms: [{
    platformId: '',
    budget: {
      JAN: '',
      FEB: '',
      MAR: '',
      APR: '',
      MAY: '',
      JUN: '',
      JUL: '',
      AUG: '',
      SEP: '',
      OCT: '',
      NOV: '',
      DEC: ''
    }
  }]
}])

// 獲取 行銷主題 名稱的方法
const getThemeName = (themeId) => {
  const theme = themeOptions.value.find(t => t._id === themeId)
  return theme ? theme.name : ''
}

// ===== 確認對話框狀態 =====
const confirmDeleteChannelDialog = ref({
  show: false,
  channelId: '',
  channelIndex: -1
})

const confirmDeletePlatformDialog = ref({
  show: false,
  platformId: '',
  channelIndex: -1,
  platformIndex: -1
})

// 獲取渠道名稱的方法
const getChannelName = (channelId) => {
  const channel = channelOptions.value.find(c => c._id === channelId)
  return channel ? channel.name : ''
}

// 獲取平台名稱的方法
const getPlatformName = (platformId) => {
  const platform = platformOptions.value.find(p => p._id === platformId)
  return platform ? platform.name : ''
}

// 刪除渠道
const removeChannel = (channelIndex) => {
  const channel = budgetData.value[channelIndex]
  
  // 檢查渠道是否為空且所有平台和金額都是空的
  const isEmpty = !channel.channelId && channel.platforms.every(platform => {
    return !platform.platformId && Object.values(platform.budget).every(value => !value)
  })

  if (isEmpty && budgetData.value.length > 1) {
    // 如果是空的就直接刪除
    budgetData.value.splice(channelIndex, 1)
  } else {
    // 否則顯示確認對話框
    confirmDeleteChannelDialog.value = {
      show: true,
      channelId: channel.channelId,
      channelIndex
    }
  }
}

// 確認刪除渠道
const confirmDeleteChannel = () => {
  const { channelIndex } = confirmDeleteChannelDialog.value
  if (budgetData.value.length > 1) {
    budgetData.value.splice(channelIndex, 1)
  }
  confirmDeleteChannelDialog.value.show = false
}

// 新增平台
const addPlatform = (channelIndex) => {
  budgetData.value[channelIndex].platforms.push({
    platformId: '',
    budget: {
      JAN: '',
      FEB: '',
      MAR: '',
      APR: '',
      MAY: '',
      JUN: '',
      JUL: '',
      AUG: '',
      SEP: '',
      OCT: '',
      NOV: '',
      DEC: ''
    }
  })
}

// 刪除平台
const removePlatform = (channelIndex, platformIndex) => {
  const platforms = budgetData.value[channelIndex].platforms
  
  // 如果該渠道只有一個平台，則不允許刪除
  if (platforms.length <= 1) {
    createSnackbar({
      text: '若廣告渠道只剩一個平台，請直接刪除廣告渠道',
      snackbarProps: { color: 'orange-darken-1' }
    })
    return
  }

  const platform = platforms[platformIndex]
  
  // 檢查平台是否為空且所有金額都是空的
  const isEmpty = !platform.platformId && Object.values(platform.budget).every(value => !value)

  if (isEmpty) {
    // 如果是空的就直接刪除
    platforms.splice(platformIndex, 1)
  } else {
    // 是否顯示確認對話框
    confirmDeletePlatformDialog.value = {
      show: true,
      platformId: platform.platformId,
      channelIndex,
      platformIndex
    }
  }
}

// 確認刪除平台
const confirmDeletePlatform = () => {
  const { channelIndex, platformIndex } = confirmDeletePlatformDialog.value
  const platforms = budgetData.value[channelIndex].platforms
  
  // 再次確認是否可以刪除
  if (platforms.length > 1) {
    platforms.splice(platformIndex, 1)
  }
  confirmDeletePlatformDialog.value.show = false
}

// 新增渠道
const addChannel = () => {
  budgetData.value.push({
    channelId: '',
    platforms: [{
      platformId: '',
      budget: {
        JAN: '',
        FEB: '',
        MAR: '',
        APR: '',
        MAY: '',
        JUN: '',
        JUL: '',
        AUG: '',
        SEP: '',
        OCT: '',
        NOV: '',
        DEC: ''
      }
    }]
  })
}

// ===== 方法 =====
const loadData = async () => {
  try {
    isLoading.value = true
    const params = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    }

    // 處理條件搜尋
    if (searchCriteria.value.year) {
      params.year = Number(searchCriteria.value.year)  // 確保年度是數字
    }
    if (searchCriteria.value.theme) {
      params.theme = searchCriteria.value.theme
    }

    const { data } = await apiAuth.get('/marketing/budgets/all', { params })
    console.log('預算表列表回應:', data) // 用於調試

    if (data.success) {
      // 確保資料格式正確
      items.value = data.result.data.map(item => ({
        ...item,
        totalBudget: item.items.reduce((total, budget) => {
          const monthlyTotal = Object.values(budget.monthlyBudget).reduce((sum, value) => sum + (Number(value) || 0), 0)
          return total + monthlyTotal
        }, 0).toLocaleString()  // 格式化數字
      }))
      totalItems.value = data.result.totalItems
    } else {
      console.error('載入預算表失敗:', data.message)
      createSnackbar({
        text: data.message || '載入預算表失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('載入預算表時發生錯誤:', error.response || error)
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [
      { data: yearData },
      { data: themeData },
      { data: channelData },
      { data: platformData }
    ] = await Promise.all([
      apiAuth.get('/marketing/budgets/years'),
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 2 } })
    ])

    if (yearData.success) {
      yearOptions.value = yearData.result
    }
    if (themeData.success) {
      themeOptions.value = themeData.result
    }
    if (channelData.success) {
      channelOptions.value = channelData.result
    }
    if (platformData.success) {
      platformOptions.value = platformData.result
    }
  } catch (error) {
    handleError(error)
  }
}

const resetSearch = () => {
  searchCriteria.value = {
    year: null,
    theme: null
  }
  performSearch()
}

const performSearch = async () => {
  page.value = 1
  await loadData()
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  resetForm()
  // 重置預算表資料
  budgetData.value = [{
    channelId: '',
    platforms: [{
      platformId: '',
      budget: {
        JAN: '',
        FEB: '',
        MAR: '',
        APR: '',
        MAY: '',
        JUN: '',
        JUL: '',
        AUG: '',
        SEP: '',
        OCT: '',
        NOV: '',
        DEC: ''
      }
    }]
  }]
}

const editItem = async (item) => {
  try {
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }

    // 先打開對話框
    dialog.value = {
      open: true,
      id: item._id
    }
    
    // 設置載入狀態
    isLoadingBudget.value = true

    const { data } = await apiAuth.get(`/marketing/budgets/${item._id}`)
    if (data.success) {
      const budget = data.result
      
      year.value.value = budget.year
      theme.value.value = budget.theme._id
      note.value.value = budget.note
      
      // 重組數據結構
      const channelGroups = {}
      budget.items.forEach(item => {
        if (!channelGroups[item.channel._id]) {
          channelGroups[item.channel._id] = {
            channelId: item.channel._id,
            platforms: []
          }
        }
        channelGroups[item.channel._id].platforms.push({
          platformId: item.platform._id,
          budget: item.monthlyBudget
        })
      })
      
      budgetData.value = Object.values(channelGroups)
      originalData.value = budget
    }
  } catch (error) {
    console.error('編輯項目發生錯誤:', error)
    handleError(error)
    // 如果發生錯誤，關閉對話框
    closeDialog()
  } finally {
    isLoadingBudget.value = false
  }
}

const closeDialog = () => {
  try {
    dialog.value = {
      open: false,
      id: ''
    }
    originalData.value = null
    resetForm()
    // 重置預算表資料
    budgetData.value = [{
      channelId: '',
      platforms: [{
        platformId: '',
        budget: {
          JAN: '',
          FEB: '',
          MAR: '',
          APR: '',
          MAY: '',
          JUN: '',
          JUL: '',
          AUG: '',
          SEP: '',
          OCT: '',
          NOV: '',
          DEC: ''
        }
      }]
    }]
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = handleSubmit(async (values) => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // 驗證必填欄位
    if (!values.year) {
      createSnackbar({
        text: '請選擇年度',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    if (!values.theme) {
      createSnackbar({
        text: '請選擇行銷主題',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 驗證預算資料
    const hasEmptyChannel = budgetData.value.some(channel => !channel.channelId)
    const hasEmptyPlatform = budgetData.value.some(channel => 
      channel.platforms.some(platform => !platform.platformId)
    )

    if (hasEmptyChannel || hasEmptyPlatform) {
      createSnackbar({
        text: '請選擇所有廣告渠道和平台',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 處理預算資料
    const items = budgetData.value.flatMap(channel => 
      channel.platforms.map(platform => ({
        channel: channel.channelId,
        platform: platform.platformId,
        monthlyBudget: {
          JAN: Number(platform.budget.JAN) || 0,
          FEB: Number(platform.budget.FEB) || 0,
          MAR: Number(platform.budget.MAR) || 0,
          APR: Number(platform.budget.APR) || 0,
          MAY: Number(platform.budget.MAY) || 0,
          JUN: Number(platform.budget.JUN) || 0,
          JUL: Number(platform.budget.JUL) || 0,
          AUG: Number(platform.budget.AUG) || 0,
          SEP: Number(platform.budget.SEP) || 0,
          OCT: Number(platform.budget.OCT) || 0,
          NOV: Number(platform.budget.NOV) || 0,
          DEC: Number(platform.budget.DEC) || 0
        }
      }))
    )

    // 確保年度是有效的數字
    const year = parseInt(values.year)
    if (isNaN(year)) {
      createSnackbar({
        text: '請選擇年度',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    const submitData = {
      year,
      theme: values.theme,
      note: values.note || '',
      items
    }

    console.log('提交的資料:', submitData) // 用於調試

    try {
      if (dialog.value.id) {
        const { data } = await apiAuth.patch(`/marketing/budgets/${dialog.value.id}`, submitData)
        console.log('更新回應:', data) // 用於調試
        if (data.success) {
          createSnackbar({
            text: '預算表更新成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          closeDialog()
          loadData()
        }
      } else {
        const { data } = await apiAuth.post('/marketing/budgets', submitData)
        console.log('新增回應:', data) // 用於調試
        if (data.success) {
          createSnackbar({
            text: '預算表新增成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          closeDialog()
          loadData()
        }
      }
    } catch (error) {
      console.error('API 錯誤:', error.response || error) // 用於調試
      throw error
    }
  } catch (error) {
    console.error('提交表單時發生錯誤:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteBudget = async () => {
  if (!dialog.value.id) return
  
  try {
    await apiAuth.delete(`/marketing/budgets/${dialog.value.id}`)
    createSnackbar({
      text: '預算表刪除成功',
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

// ===== 監聽器 =====
watch([page, itemsPerPage], () => {
  loadData()
})

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadOptions()
  ])
})
</script>

<style lang="scss" scoped>
.budget-table {
  overflow-x: auto;
  margin: 0 -16px;
  padding: 0 16px;
}

.budget-table-title {
  font-size: 20px;
  font-weight: 600;
}

.budget-grid {
  width: 100%;
  min-width: 1720px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  border-spacing: 0;
}

.budget-header {
  background: #455A64;
  color: white;
  
  th {
    text-align: center !important;
    font-weight: 600 !important;
    white-space: nowrap;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

tbody {
  tr {
    height:64px;
    &.row-odd {
      background: #ebf3f3;
    }
    
    &:hover {
      td {
        background: inherit;
      }
    }
  }

  td {
    padding: 8px;
    vertical-align: middle;
  }
}

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

.delete-button-col {
  width: 30px;
  padding: 0 !important;
  text-align: center;
}

.channel-col {
  width: 220px;
  .channel-select {
    width: 180px;
  }
}

.platform-col {
  width: 200px;
}

.month-col {
  min-width: 100px;
}

.delete-button {
  margin-left: 12px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 1;
  }
}
</style>
