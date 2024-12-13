<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">行銷預算管理</span>
      </v-card-title>

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th
                class="text-left"
                width="200"
              >
                廣告渠道
              </th>
              <th
                class="text-left"
                width="200"
              >
                平台
              </th>
              <template
                v-for="month in months"
                :key="month"
              >
                <th
                  class="text-right"
                  width="100"
                >
                  {{ month }}
                </th>
              </template>
              <template
                v-for="quarter in quarters"
                :key="quarter"
              >
                <th
                  class="text-right"
                  width="100"
                >
                  {{ quarter }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(channel, channelIndex) in budgetData"
              :key="channelIndex"
            >
              <!-- 廣告渠道行 -->
              <tr>
                <td class="d-flex align-center">
                  <v-btn
                    icon="mdi-minus"
                    color="pink"
                    size="small"
                    class="mr-2"
                    @click="confirmDeleteChannel(channel)"
                  />
                  <span
                    class="channel-name"
                    @click="editChannelName(channel)"
                  >{{ channel.name }}</span>
                </td>
                <td colspan="14" />
              </tr>
              <!-- 平台行 -->
              <tr
                v-for="(platform, platformIndex) in channel.platforms"
                :key="platformIndex"
              >
                <td />
                <td class="d-flex align-center">
                  <v-btn
                    icon="mdi-minus"
                    color="error"
                    size="small"
                    class="mr-2"
                    @click="confirmDeletePlatform(channel, platform)"
                  />
                  <span
                    class="platform-name"
                    @click="editPlatformName(channel, platform)"
                  >{{ platform.name }}</span>
                </td>
                <!-- 月度預算 -->
                <template
                  v-for="month in months"
                  :key="month"
                >
                  <td>
                    <v-text-field
                      v-model="platform.budgets[month]"
                      type="number"
                      variant="plain"
                      density="compact"
                      hide-details
                      class="budget-input"
                      @input="calculateTotals"
                    />
                  </td>
                </template>
                <!-- 季度總額 -->
                <template
                  v-for="quarter in quarters"
                  :key="quarter"
                >
                  <td class="text-right">
                    {{ calculateQuarterTotal(platform, quarter) }}
                  </td>
                </template>
              </tr>
              <!-- 新增平台按鈕 -->
              <tr>
                <td />
                <td>
                  <v-btn
                    icon="mdi-plus"
                    color="primary"
                    size="small"
                    @click="showAddPlatformDialog(channel)"
                  />
                </td>
                <td colspan="13" />
              </tr>
            </template>
            <!-- 新增廣告渠道按鈕 -->
            <tr>
              <td>
                <v-btn
                  icon="mdi-plus"
                  color="primary"
                  size="small"
                  @click="showAddChannelDialog"
                />
              </td>
              <td colspan="14" />
            </tr>
            <!-- 總行 -->
            <tr class="total-row">
              <td
                colspan="2"
                class="text-right font-weight-bold"
              >
                總計
              </td>
              <template
                v-for="month in months"
                :key="month"
              >
                <td class="text-right font-weight-bold">
                  {{ calculateMonthTotal(month) }}
                </td>
              </template>
              <template
                v-for="quarter in quarters"
                :key="quarter"
              >
                <td class="text-right font-weight-bold">
                  {{ calculateQuarterTotalAll(quarter) }}
                </td>
              </template>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- 對話框部分 -->
    <v-dialog
      v-model="showChannelDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>新增廣告渠道</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newChannelName"
            label="廣告渠道名稱"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showChannelDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="addChannel"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showPlatformDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>新增平台</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPlatformName"
            label="平台名稱"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showPlatformDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="addPlatform"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showEditDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>{{ editDialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editName"
            :label="editDialogLabel"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showEditDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="saveName"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showDeleteDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>確認刪除</v-card-title>
        <v-card-text>{{ deleteConfirmMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="showDeleteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

// 基礎數據
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

// 預算數據
const budgetData = ref([])

// 對話框控制
const showChannelDialog = ref(false)
const showPlatformDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

// 表單數據
const newChannelName = ref('')
const newPlatformName = ref('')
const editName = ref('')
const editDialogTitle = ref('')
const editDialogLabel = ref('')
const deleteConfirmMessage = ref('')

// 臨時存儲
const currentChannel = ref(null)
const currentPlatform = ref(null)
const deleteType = ref('')
const deleteTarget = ref(null)

// 新增廣告渠道
const showAddChannelDialog = () => {
  newChannelName.value = ''
  showChannelDialog.value = true
}

const addChannel = () => {
  if (!newChannelName.value) return
  
  budgetData.value.push({
    name: newChannelName.value,
    platforms: []
  })
  
  showChannelDialog.value = false
  newChannelName.value = ''
}

// 新增平台
const showAddPlatformDialog = (channel) => {
  currentChannel.value = channel
  newPlatformName.value = ''
  showPlatformDialog.value = true
}

const addPlatform = () => {
  if (!newPlatformName.value || !currentChannel.value) return
  
  const budgets = {}
  months.forEach(month => {
    budgets[month] = 0
  })
  
  currentChannel.value.platforms.push({
    name: newPlatformName.value,
    budgets
  })
  
  showPlatformDialog.value = false
  newPlatformName.value = ''
  currentChannel.value = null
}

// 編輯名稱
const editChannelName = (channel) => {
  editName.value = channel.name
  editDialogTitle.value = '編輯廣告渠道名稱'
  editDialogLabel.value = '廣告渠道名稱'
  currentChannel.value = channel
  currentPlatform.value = null
  showEditDialog.value = true
}

const editPlatformName = (channel, platform) => {
  editName.value = platform.name
  editDialogTitle.value = '編輯平台名稱'
  editDialogLabel.value = '平台名稱'
  currentChannel.value = channel
  currentPlatform.value = platform
  showEditDialog.value = true
}

const saveName = () => {
  if (!editName.value) return
  
  if (currentPlatform.value) {
    currentPlatform.value.name = editName.value
  } else if (currentChannel.value) {
    currentChannel.value.name = editName.value
  }
  
  showEditDialog.value = false
  editName.value = ''
  currentChannel.value = null
  currentPlatform.value = null
}

// 刪除功能
const confirmDeleteChannel = (channel) => {
  deleteType.value = 'channel'
  deleteTarget.value = channel
  deleteConfirmMessage.value = `確定要刪除廣告渠道"${channel.name}"嗎？將會連同底下平台全部一起刪除。`
  showDeleteDialog.value = true
}

const confirmDeletePlatform = (channel, platform) => {
  deleteType.value = 'platform'
  deleteTarget.value = { channel, platform }
  deleteConfirmMessage.value = `確定要刪除平台"${platform.name}"嗎？`
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteType.value === 'channel') {
    const index = budgetData.value.indexOf(deleteTarget.value)
    if (index > -1) {
      budgetData.value.splice(index, 1)
    }
  } else if (deleteType.value === 'platform') {
    const { channel, platform } = deleteTarget.value
    const platformIndex = channel.platforms.indexOf(platform)
    if (platformIndex > -1) {
      channel.platforms.splice(platformIndex, 1)
    }
  }
  
  showDeleteDialog.value = false
  deleteType.value = ''
  deleteTarget.value = null
}

// 計算功能
const calculateQuarterTotal = (platform, quarter) => {
  const quarterMonths = {
    Q1: ['JAN', 'FEB', 'MAR'],
    Q2: ['APR', 'MAY', 'JUN'],
    Q3: ['JUL', 'AUG', 'SEP'],
    Q4: ['OCT', 'NOV', 'DEC']
  }
  
  return quarterMonths[quarter].reduce((sum, month) => {
    return sum + (Number(platform.budgets[month]) || 0)
  }, 0)
}

const calculateMonthTotal = (month) => {
  return budgetData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (Number(platform.budgets[month]) || 0)
    }, 0)
  }, 0)
}

const calculateQuarterTotalAll = (quarter) => {
  return budgetData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + calculateQuarterTotal(platform, quarter)
    }, 0)
  }, 0)
}

// 初始化示例數據
budgetData.value = [
  {
    name: '社群',
    platforms: [
      {
        name: 'Facebook',
        budgets: {
          JAN: 33500,
          FEB: 22600,
          MAR: 19000,
          APR: 22580,
          MAY: 0,
          JUN: 0,
          JUL: 0,
          AUG: 0,
          SEP: 0,
          OCT: 0,
          NOV: 0,
          DEC: 0
        }
      },
      {
        name: 'Instagram',
        budgets: {
          JAN: 250000,
          FEB: 270000,
          MAR: 241000,
          APR: 199000,
          MAY: 0,
          JUN: 0,
          JUL: 0,
          AUG: 0,
          SEP: 0,
          OCT: 0,
          NOV: 0,
          DEC: 0
        }
      }
    ]
  }
]
</script>

<style scoped>
.budget-input {
  width: 100px;
}

.channel-name,
.platform-name {
  cursor: pointer;
}

.channel-name:hover,
.platform-name:hover {
  text-decoration: underline;
}

.total-row {
  background-color: #f5f5f5;
}
</style>
// ... existing code ... 