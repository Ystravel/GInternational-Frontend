<template>
  <v-container max-width="2000">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>廣告預算管理</h3>
      </v-col>

      <!-- 管理按鈕和搜尋區 -->
      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col
                v-for="button in managementButtons"
                :key="button.title"
                cols="auto"
              >
                <v-btn
                  prepend-icon="mdi-cog"
                  variant="outlined"
                  color="deep-purple-darken-4"
                  @click="openDialog(button.type)"
                >
                  {{ button.title }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>

      <!-- 選擇區域 -->
      <v-col
        cols="12"
        class="mt-4"
      >
        <v-row>
          <!-- 年份選擇 -->
          <v-col
            cols="12"
            sm="4"
          >
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="選擇年份"
              variant="outlined"
              density="comfortable"
              hide-details
              class="mb-4"
              :error-messages="yearError"
            />
          </v-col>

          <!-- 標題選擇 -->
          <v-col
            cols="12"
            sm="4"
          >
            <v-select
              v-model="selectedTheme"
              :items="themeOptions"
              label="選擇預算主題"
              variant="outlined"
              density="comfortable"
              hide-details
              class="mb-4"
              :loading="loadingThemes"
              item-title="name"
              item-value="_id"
              :disabled="!selectedYear"
              :error-messages="themeError"
            />
          </v-col>

          <!-- 表格種類選擇 -->
          <v-col
            cols="12"
            sm="4"
          >
            <v-select
              v-model="selectedType"
              :items="typeOptions"
              label="選擇表格種類"
              variant="outlined"
              density="comfortable"
              hide-details
              class="mb-4"
              :disabled="!selectedTheme"
              :error-messages="typeError"
            />
          </v-col>
        </v-row>

        <!-- 操作按鈕 -->
        <v-row class="mt-2">
          <v-col
            cols="12"
            class="d-flex justify-end"
          >
            <v-btn
              color="primary"
              class="mr-2"
              :disabled="!canEdit"
              prepend-icon="mdi-pencil"
              @click="handleEdit"
            >
              編輯{{ selectedType === 'estimate' ? '預估表' : '實際花費表' }}
            </v-btn>
            <v-btn
              color="success"
              :disabled="!canCreate"
              prepend-icon="mdi-plus"
              @click="handleCreate"
            >
              新增{{ selectedType === 'estimate' ? '預估表' : '實際花費表' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-col>

      <!-- 表格顯示區域 -->
      <v-col
        v-if="showTable"
        cols="12"
      >
        <v-card class="mt-4">
          <v-card-title class="text-h6 py-4 px-4 bg-blue-grey-darken-2 text-white d-flex justify-space-between align-center">
            <span>{{ selectedYear }}年度 {{ selectedThemeText }}
              {{ selectedType === 'estimate' ? '預估表' : '實際花費表' }}</span>
            <v-btn
              v-if="selectedType === 'estimate'"
              color="success"
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="addNewRow"
            >
              新增欄位
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table>
              <thead class="bg-blue-grey-lighten-5">
                <tr>
                  <th style="width: 50px">
                    操作
                  </th>
                  <th>廣告渠道</th>
                  <th>平台</th>
                  <th
                    v-for="month in months"
                    :key="month"
                  >
                    {{ month }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="tableData.length">
                  <template
                    v-for="(channel, channelIndex) in tableData"
                    :key="channel._id || channelIndex"
                  >
                    <tr
                      v-for="(platform, platformIndex) in channel.platforms"
                      :key="platform._id || platformIndex"
                    >
                      <td>
                        <v-btn
                          v-if="platformIndex === 0"
                          icon="mdi-minus"
                          variant="text"
                          color="error"
                          density="comfortable"
                          @click="confirmDeleteChannel(channel)"
                        />
                        <v-btn
                          v-else
                          icon="mdi-minus"
                          variant="text"
                          color="error"
                          density="comfortable"
                          @click="confirmDeletePlatform(channel._id, platform)"
                        />
                      </td>
                      <td
                        v-if="platformIndex === 0"
                        :rowspan="channel.platforms.length"
                      >
                        <v-select
                          v-if="!channel._id"
                          v-model="channel.channelId"
                          :items="channelList"
                          item-title="name"
                          item-value="_id"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="my-1"
                          @update:model-value="handleChannelSelect(channelIndex)"
                        />
                        <template v-else>
                          {{ channel.name }}
                        </template>
                      </td>
                      <td>
                        <v-select
                          v-if="!platform._id"
                          v-model="platform.platformId"
                          :items="platformList"
                          item-title="name"
                          item-value="_id"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="my-1"
                        />
                        <template v-else>
                          {{ platform.name }}
                        </template>
                      </td>
                      <td
                        v-for="month in months"
                        :key="month"
                      >
                        <v-text-field
                          v-model="platform.budgets[month]"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="my-1"
                          @update:model-value="updateBudget(channel._id, platform._id, month, $event)"
                        />
                      </td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td
                    :colspan="months.length + 3"
                    class="text-center py-4"
                  >
                    無資料
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 預算主題管理對話框 -->
    <v-dialog
      v-model="dialogs.theme"
      max-width="880"
      persistent
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          預算主題管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeDialog('theme')"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有主題列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有預算主題
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="theme in themeList"
                  :key="theme._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ theme.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditTheme(theme)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="blue-grey-darken-1"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-blue-grey-darken-1">
                          編輯
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="confirmDeleteTheme(theme)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="red-lighten-1"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-red-lighten-1">
                          刪除
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <!-- 右側新增表單 -->
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增預算主題
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitTheme">
                <v-text-field
                  v-model="forms.theme.name"
                  label="主題名稱*"
                  variant="outlined"
                  density="compact"
                  :error-messages="formErrors.theme.name"
                  class="mb-4"
                />
                <v-card-actions class="pa-0 mt-4">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    :loading="submitting"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯預算主題對話框 -->
    <v-dialog
      v-model="editThemeDialog.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯預算主題
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEditTheme">
            <v-text-field
              v-model="editThemeDialog.name"
              label="主題名稱*"
              variant="outlined"
              density="compact"
              :error-messages="editThemeErrors.name"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditThemeDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="submitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 刪除預算主題確認對話框 -->
    <v-dialog
      v-model="deleteThemeDialog.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          確認刪除
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          確定要刪除預算主題「<span class="text-pink-lighten-1 font-weight-bold">{{ deleteThemeDialog.name }}</span>」嗎？此操作無法復原。
        </v-card-text>
        <v-card-actions class="px-5 pt-2 pb-4">
          <v-spacer />
          <v-btn
            color="red-lighten-1"
            variant="outlined"
            @click="closeDeleteThemeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="submitting"
            class="ms-2"
            @click="deleteTheme"
          >
            確認刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 廣告渠道管理對話框 -->
    <v-dialog
      v-model="dialogs.channel"
      max-width="880"
      persistent
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          廣告渠道管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeDialog('channel')"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有渠道列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有廣告渠道
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="channel in channelList"
                  :key="channel._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ channel.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditChannel(channel)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="blue-grey-darken-1"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-blue-grey-darken-1">
                          編輯
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="confirmDeleteChannel(channel)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="red-lighten-1"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-red-lighten-1">
                          刪除
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <!-- 右側新增表單 -->
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增廣告渠道
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitChannel">
                <v-text-field
                  v-model="forms.channel.name"
                  label="渠道名稱*"
                  variant="outlined"
                  density="compact"
                  :error-messages="formErrors.channel.name"
                  class="mb-4"
                />
                <v-card-actions class="pa-0 mt-4">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    :loading="submitting"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯廣告渠道對話框 -->
    <v-dialog
      v-model="editDialogs.channel.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯廣告渠道
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEdit('channel')">
            <v-text-field
              v-model="editDialogs.channel.name"
              label="渠道名稱*"
              variant="outlined"
              density="compact"
              :error-messages="editErrors.channel.name"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditDialog('channel')"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="submitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯平台對話框 -->
    <v-dialog
      v-model="editDialogs.platform.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯平台
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEdit('platform')">
            <v-text-field
              v-model="editDialogs.platform.name"
              label="平台名稱*"
              variant="outlined"
              density="compact"
              :error-messages="editErrors.platform.name"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditDialog('platform')"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="submitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯項目對話框 -->
    <v-dialog
      v-model="editDialogs.project.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯項目
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEdit('project')">
            <v-text-field
              v-model="editDialogs.project.name"
              label="項目名稱*"
              variant="outlined"
              density="compact"
              :error-messages="editErrors.project.name"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditDialog('project')"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="submitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯細項對話框 -->
    <v-dialog
      v-model="editDialogs.detail.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          編輯細項
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEdit('detail')">
            <v-text-field
              v-model="editDialogs.detail.name"
              label="細項名稱*"
              variant="outlined"
              density="compact"
              :error-messages="editErrors.detail.name"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="red-lighten-1"
                variant="outlined"
                @click="closeEditDialog('detail')"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="submitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 廣告平台管理話框 -->
    <v-dialog
      v-model="dialogs.platform"
      max-width="880"
      persistent
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          平台管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeDialog('platform')"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有平台列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有廣告平台
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="platform in platformList"
                  :key="platform._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ platform.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditPlatform(platform)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="blue-grey-darken-1"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-blue-grey-darken-1">
                          編輯
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="confirmDeletePlatform(platform)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="red-lighten-1"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-red-lighten-1">
                          刪除
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <!-- 右側新增平台表單 -->
            <v-col
              cols="5"
              class="ps-8"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  新增廣告平台
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitPlatform">
                <v-text-field
                  v-model="forms.platform.name"
                  label="平台名稱*"
                  variant="outlined"
                  density="compact"
                  :error-messages="formErrors.platform.name"
                  class="mb-4"
                />
                <v-card-actions class="pa-0 mt-4">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    :loading="submitting"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 項目管理對話框 -->
    <v-dialog
      v-model="dialogs.project"
      max-width="880"
      persistent
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          項目管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeDialog('project')"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有項目列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有項目
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="project in projectList"
                  :key="project._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ project.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditProject(project)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="blue-grey-darken-1"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-blue-grey-darken-1">
                          編輯
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="confirmDeleteProject(project)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="red-lighten-1"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-red-lighten-1">
                          刪除
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <!-- 右側新增項目表單 -->
            <v-col
              cols="5"
              class="ps-8"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  新增項目
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitProject">
                <v-text-field
                  v-model="forms.project.name"
                  label="項目名稱*"
                  variant="outlined"
                  density="compact"
                  :error-messages="formErrors.project.name"
                  class="mb-4"
                />
                <v-card-actions class="pa-0 mt-4">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    :loading="submitting"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 細項管理對話框 -->
    <v-dialog
      v-model="dialogs.detail"
      max-width="880"
      persistent
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          細項管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeDialog('detail')"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有細項列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有細項
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="detail in detailList"
                  :key="detail._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ detail.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditDetail(detail)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="blue-grey-darken-1"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-blue-grey-darken-1">
                          編輯
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="confirmDeleteDetail(detail)"
                      >
                        <template #prepend>
                          <v-icon
                            size="small"
                            color="red-lighten-1"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-red-lighten-1">
                          刪除
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <!-- 右側新增細項表單 -->
            <v-col
              cols="5"
              class="ps-8"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  新增細項
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitDetail">
                <v-text-field
                  v-model="forms.detail.name"
                  label="細項名稱*"
                  variant="outlined"
                  density="compact"
                  :error-messages="formErrors.detail.name"
                  class="mb-4"
                />
                <v-card-actions class="pa-0 mt-4">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    :loading="submitting"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 選擇預估表對話框 -->
    <v-dialog
      v-model="dialogs.selectEstimate"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h6 bg-deep-purple-darken-4 text-white px-4 py-3 d-flex justify-space-between align-center">
          選擇預估表
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeDialog('selectEstimate')"
          />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-list>
            <v-list-item
              v-for="estimate in lists.estimates"
              :key="estimate._id"
              :title="estimate.name"
              @click="selectEstimateAndProceed(estimate)"
            >
              <template #subtitle>
                {{ estimate.year }}年度
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <v-dialog
      v-model="confirmDialog.show"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6 bg-error text-white px-4 py-3">
          確認刪除
        </v-card-title>
        <v-card-text class="pa-4">
          {{ confirmDialog.message }}
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="confirmDialog.show = false"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            :loading="submitting"
            @click="confirmDialog.callback"
          >
            確認刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 預估表編輯對話框 -->
    <v-dialog
      v-model="dialogs.editEstimate"
      max-width="800"
    >
      <v-card>
        <v-card-title class="text-h6 bg-deep-purple-darken-4 text-white px-4 py-3 d-flex justify-space-between align-center">
          編輯預估金額
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeDialog('editEstimate')"
          />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="budgetForm.channelId"
                :items="lists.channels"
                label="廣告渠道"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.channelId"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="budgetForm.platformId"
                :items="lists.platforms"
                label="平台"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.platformId"
              />
            </v-col>
            <v-col
              v-for="month in months"
              :key="month"
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="budgetForm.budgets[month]"
                :label="`${month}月預算`"
                type="number"
                variant="outlined"
                density="comfortable"
                prefix="NT$"
                :error-messages="budgetFormErrors.budgets?.[month]"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="error"
            variant="outlined"
            @click="closeDialog('editEstimate')"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="submitBudget('estimate')"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 實際花費表編輯對話框 -->
    <v-dialog
      v-model="dialogs.editActual"
      max-width="1000"
    >
      <v-card>
        <v-card-title class="text-h6 bg-deep-purple-darken-4 text-white px-4 py-3 d-flex justify-space-between align-center">
          編輯實際花費
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeDialog('editActual')"
          />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              cols="12"
              sm="4"
            >
              <v-select
                v-model="budgetForm.channelId"
                :items="lists.channels"
                label="廣告渠道"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.channelId"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-select
                v-model="budgetForm.platformId"
                :items="lists.platforms"
                label="平台"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.platformId"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-select
                v-model="budgetForm.projectId"
                :items="lists.projects"
                label="項目"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.projectId"
              />
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-select
                v-model="budgetForm.detailId"
                :items="lists.details"
                label="細項"
                item-title="name"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :error-messages="budgetFormErrors.detailId"
              />
            </v-col>
            <v-col
              v-for="month in months"
              :key="month"
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="budgetForm.budgets[month]"
                :label="`${month}月實際花費`"
                type="number"
                variant="outlined"
                density="comfortable"
                prefix="NT$"
                :error-messages="budgetFormErrors.budgets?.[month]"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="error"
            variant="outlined"
            @click="closeDialog('editActual')"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="submitBudget('actual')"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <confirm-delete-dialog-with-text-field
      v-model="confirmDelete.show"
      :title="confirmDelete.title"
      :message="confirmDelete.message"
      :expected-name="confirmDelete.expectedName"
      :input-label="confirmDelete.inputLabel"
      @confirm="confirmDelete.callback"
    />

    <!-- 項目管理對話框 -->
    <v-dialog
      v-model="projectDialog.open"
      max-width="500"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          {{ projectDialog.title }}
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="addProject">
            <v-text-field
              v-model="projectDialog.form.name"
              label="項目名稱"
              :error-messages="projectDialog.errors.name"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
            <v-textarea
              v-model="projectDialog.form.description"
              label="項目描述"
              :error-messages="projectDialog.errors.description"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="projectDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="addProject"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 細項管理對話框 -->
    <v-dialog
      v-model="detailDialog.open"
      max-width="500"
    >
      <v-card class="rounded-lg pa-4">
        <v-card-title class="text-h6 ps-5 py-3">
          {{ detailDialog.title }}
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="addDetail">
            <v-select
              v-model="detailDialog.form.projectId"
              :items="projectList"
              item-title="name"
              item-value="_id"
              label="選擇項目"
              :error-messages="detailDialog.errors.projectId"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
            <v-text-field
              v-model="detailDialog.form.name"
              label="細項名稱"
              :error-messages="detailDialog.errors.name"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
            <v-textarea
              v-model="detailDialog.form.description"
              label="細項描述"
              :error-messages="detailDialog.errors.description"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="detailDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="addDetail"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useApi } from '@/composables/axios'
import { useRouter } from 'vue-router'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'

// Store 和工具���數初始化
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const user = useUserStore()
const router = useRouter()

// 基本設定
const months = [ 'JAN' , 'FEB' , 'MAR' , 'APR' , 'MAY' , 'JUN' , 'JUL' , 'AUG' , 'SEP' , 'OCT' , 'NOV' , 'DEC' ]
const managementButtons = [
  { title: '預算主題管理', type: 'theme' },
  { title: '廣告渠道管理', type: 'channel' },
  { title: '平台管理', type: 'platform' },
  { title: '項目管理', type: 'project' },
  { title: '細項管理', type: 'detail' }
]

const buttonSize = 'small'

// 響應式狀態
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  // 從 2020 年開始到當前年份後 5 年
  const startYear = 2020
  const endYear = currentYear + 5
  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years
})

// 設定預設年份為當前年份
const selectedYear = ref(new Date().getFullYear())
const themeOptions = ref([])
const typeOptions = [
  { title: '預估表', value: 'estimate' },
  { title: '實際花費表', value: 'actual' }
]

const selectedTheme = ref(null)
const selectedType = ref('estimate')
const loadingThemes = ref(false)
const showTable = ref(false)
const submitting = ref(false)

// 表格資料
const tableData = ref([])

// 錯誤訊息
const yearError = ref('')
const themeError = ref('')
const typeError = ref('')

// 對話框控件
const dialogs = ref({
  theme: false,
  channel: false,
  platform: false,
  selectEstimate: false,
  editEstimate: false,
  editActual: false,
  project: false,
  detail: false
})

// 確���對話框
const confirmDialog = ref({
  show: false,
  type: '',
  id: null,
  message: '',
  callback: null
})

// 刪除對話框
const deleteThemeDialog = ref({
  open: false,
  name: ''
})

const closeDeleteThemeDialog = () => {
  deleteThemeDialog.value.open = false
  deleteThemeDialog.value.name = ''
}

// 表單資料
const forms = ref({
  theme: {
    name: ''
  },
  channel: {
    name: ''
  },
  platform: {
    name: ''
  },
  project: {
    name: ''
  },
  detail: {
    name: ''
  }
})

const formErrors = ref({
  theme: {
    name: ''
  },
  channel: {
    name: ''
  },
  platform: {
    name: ''
  },
  project: {
    name: ''
  },
  detail: {
    name: ''
  }
})

// 列表資料
const lists = ref({
  themes: [],
  channels: [],
  platforms: [],
  projects: [],
  details: [],
  estimates: [] // 可選擇的預估表列表
})

// 新增主題列表
const themeList = computed(() => lists.value.themes)
// 新增渠道列表
const channelList = computed(() => lists.value.channels)
// 新增平台列表
const platformList = computed(() => lists.value.platforms)

// 編輯模式
const editMode = ref({
  theme: false,
  channel: false,
  platform: false,
  project: false,
  detail: false
})

// 當前編輯項目
const currentItem = ref({
  theme: null,
  channel: null,
  platform: null,
  project: null,
  detail: null
})

// 選擇的預估表
const selectedEstimate = ref(null)

// 計算屬
const selectedThemeText = computed(() => {
  const theme = themeOptions.value.find(t => t._id === selectedTheme.value)
  return theme ? theme.name : ''
})

const canEdit = computed(() => {
  return selectedYear.value && selectedTheme.value && selectedType.value
})

const canCreate = computed(() => {
  return selectedYear.value && selectedTheme.value && selectedType.value
})

// 方法
const openDialog = async (type) => {
  try {
    dialogs.value[type] = true
    // 開啟對話框時，立即載入對應的資料
    if (type === 'project') {
      const { data } = await apiAuth.get('/marketing/categories/all?type=3')
      if (data.success) {
        projectList.value = data.result.data || []
      }
    } else if (type === 'detail') {
      const { data } = await apiAuth.get('/marketing/categories/all?type=4')
      if (data.success) {
        detailList.value = data.result.data || []
      }
    } else {
      await fetchList(type)
    }
  } catch (err) {
    handleError(err)
  }
}

const closeDialog = (type) => {
  dialogs.value[type] = false
  // 重置表單資料
  forms.value[type] = { name: '' }
  formErrors.value[type] = { name: '' }
  // 重置編輯模式
  editMode.value[type] = false
  currentItem.value[type] = null
}



const fetchThemeOptions = async () => {
  try {
    loadingThemes.value = true
    const { data } = await apiAuth.get('/marketing/themes/all')
    if (data.success) {
      themeOptions.value = data.result.data || []
      // 如果目前沒有選擇主題，且有主題選項，則自動選擇第一個
      if (!selectedTheme.value && themeOptions.value.length > 0) {
        selectedTheme.value = themeOptions.value[0]._id
      }
    }
  } catch (err) {
    console.error('無法取得預算主題選項:', err)
    handleError(err)
  } finally {
    loadingThemes.value = false
  }
}



const fetchPlatforms = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/categories/options?type=2')
    if (data.success) {
      lists.value.platforms = data.result
    }
  } catch (err) {
    handleError(err)
  }
}



const fetchList = async (type) => {
  try {
    let endpoint = ''
    switch (type) {
      case 'theme':
        endpoint = '/marketing/themes/all'
        break
      case 'channel':
        endpoint = '/marketing/categories/all?type=1'
        break
      case 'platform':
        endpoint = '/marketing/categories/all?type=2'
        break
      case 'project':
        endpoint = '/marketing/categories/all?type=3'
        break
      case 'detail':
        endpoint = '/marketing/categories/all?type=4'
        break
    }
    const { data } = await apiAuth.get(endpoint)
    if (data.success) {
      lists.value[`${type}s`] = data.result.data
    }
  } catch (err) {
    handleError(err)
  }
}

const fetchEstimateOptions = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/budgets/all', {
      params: {
        year: selectedYear.value,
        theme: selectedTheme.value,
        status: 'published'
      }
    })
    if (data.success) {
      lists.value.estimates = data.result.data
    }
  } catch (err) {
    handleError(err)
  }
}

const handleEdit = () => {
  if (!validateSelection()) return
  
  if (selectedType.value === 'actual') {
    // 如果是編輯實際花費表，先獲取可選擇的預估表
    fetchEstimateOptions()
  } else {
    // 如果是編輯預估表，直接顯示表格
    showTable.value = true
    fetchTableData()
  }
}

const handleCreate = () => {
  if (!validateSelection()) return
  
  if (selectedType.value === 'actual') {
    // 如果是新增實際花費表，先獲取可選擇的預估表
    fetchEstimateOptions()
    dialogs.value.selectEstimate = true
  } else {
    // 如果是新增預估表，直接顯示空表格
    showTable.value = true
    tableData.value = []
  }
}

const validateSelection = () => {
  let isValid = true
  if (!selectedYear.value) {
    yearError.value = '請選擇年份'
    isValid = false
  }
  if (!selectedTheme.value) {
    themeError.value = '請選擇標題'
    isValid = false
  }
  if (!selectedType.value) {
    typeError.value = '請選擇表格種類'
    isValid = false
  }
  return isValid
}

const fetchTableData = async () => {
  try {
    const url = selectedType.value === 'estimate' ? '/marketing/budgets/all' : '/marketing/expenses/all'
    const { data } = await apiAuth.get(url, {
      params: {
        year: selectedYear.value,
        theme: selectedTheme.value
      }
    })
    if (data.success) {
      tableData.value = data.result.data
    }
  } catch (err) {
    handleError(err)
  }
}

const handleError = (err) => {
  console.error('操作失敗:', err)
  if (err?.response?.status === 401) {
    user.logout()
    router.push('/login')
    createSnackbar({
      text: '登入已過期，請重新登入',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } else {
    createSnackbar({
      text: err.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const selectEstimateAndProceed = async (estimate) => {
  selectedEstimate.value = estimate
  dialogs.value.selectEstimate = false
  showTable.value = true
  
  if (estimate) {
    // 果選擇了預估表，則入預估表的資料
    const { data } = await apiAuth.get(`/marketing/budgets/${estimate._id}`)
    if (data.success) {
      tableData.value = data.result.map(item => ({
        ...item,
        platforms: item.platforms.map(platform => ({
          ...platform,
          projects: [], // 新增目陣列
          details: []   // 新增細項陣列
        }))
      }))
    }
  } else {
    // 如果沒有選擇預估表，則顯示空表格
    tableData.value = []
  }
}

// 預算表單
const budgetForm = ref({
  channelId: null,
  platformId: null,
  projectId: null,
  detailId: null,
  budgets: {}
})

const budgetFormErrors = ref({
  channelId: '',
  platformId: '',
  projectId: '',
  detailId: '',
  budgets: {}
})



const submitBudget = async (type) => {
  if (!validateBudgetForm(type)) return

  submitting.value = true
  try {
    const url = type === 'estimate' ? '/marketing/budgets' : '/marketing/expenses'
    const { data } = await apiAuth.post(url, {
      ...budgetForm.value,
      year: selectedYear.value,
      theme: selectedTheme.value
    })
    
    if (data.success) {
      createSnackbar({
        text: '更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeDialog(`edit${type.charAt(0).toUpperCase() + type.slice(1)}`)
      fetchTableData()
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

const validateBudgetForm = (type) => {
  let isValid = true
  budgetFormErrors.value = {}

  if (!budgetForm.value.channelId) {
    budgetFormErrors.value.channelId = '請選擇廣告渠道'
    isValid = false
  }
  if (!budgetForm.value.platformId) {
    budgetFormErrors.value.platformId = '請選擇平台'
    isValid = false
  }

  if (type === 'actual') {
    if (!budgetForm.value.projectId) {
      budgetFormErrors.value.projectId = '請選擇項目'
      isValid = false
    }
    if (!budgetForm.value.detailId) {
      budgetFormErrors.value.detailId = '請選擇細項'
      isValid = false
    }
  }

  return isValid
}

// 當選擇廣告渠道時，更新平台列表
watch(() => budgetForm.value?.channelId, (newVal) => {
  if (newVal) {
    fetchPlatforms(newVal)
  } else {
    lists.value.platforms = []
  }
})

// 新增主題提交函數
const submitTheme = async () => {
  if (!validateForm('theme')) return

  submitting.value = true
  try {
    const url = `/marketing/themes${editMode.value.theme ? `/${currentItem.value.theme._id}` : ''}`
    const method = editMode.value.theme ? 'patch' : 'post'
    const { data } = await apiAuth[method](url, { name: forms.value.theme.name })
    
    if (data.success) {
      createSnackbar({
        text: `${editMode.value.theme ? '編輯' : '新增'}預算主題成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('theme')
      closeDialog('theme')
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 新增渠道提交函數
const submitChannel = async () => {
  if (!validateForm('channel')) return

  submitting.value = true
  try {
    const url = `/marketing/categories${editMode.value.channel ? `/${currentItem.value.channel._id}` : ''}`
    const method = editMode.value.channel ? 'patch' : 'post'
    const { data } = await apiAuth[method](url, {
      name: forms.value.channel.name,
      type: getCategoryType('channel')
    })
    
    if (data.success) {
      createSnackbar({
        text: `${editMode.value.channel ? '編輯' : '新增'}廣告渠道成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('channel')
      forms.value.channel.name = ''
      formErrors.value.channel.name = ''
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 新增平台提交函數
const submitPlatform = async () => {
  if (!validateForm('platform')) return

  submitting.value = true
  try {
    const url = `/marketing/categories${editMode.value.platform ? `/${currentItem.value.platform._id}` : ''}`
    const method = editMode.value.platform ? 'patch' : 'post'
    const { data } = await apiAuth[method](url, {
      name: forms.value.platform.name,
      type: getCategoryType('platform')
    })
    
    if (data.success) {
      createSnackbar({
        text: `${editMode.value.platform ? '編輯' : '新增'}平台成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('platform')
      forms.value.platform.name = ''
      formErrors.value.platform.name = ''
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 編輯對話框
const editThemeDialog = ref({
  open: false,
  name: ''
})



// 編輯錯誤訊息
const editThemeErrors = ref({
  name: ''
})





// 修正 watch
watch(() => budgetForm.value?.channelId, (newVal) => {
  if (newVal) {
    fetchPlatforms(newVal)
  } else {
    lists.value.platforms = []
  }
})

// 新增關閉編輯對話框的方法
const closeEditThemeDialog = () => {
  editThemeDialog.value.open = false
  editThemeDialog.value.name = ''
  editThemeErrors.value.name = ''
}





// 新增開啟編輯對話框的方法
const openEditTheme = (theme) => {
  editThemeDialog.value.open = true
  editThemeDialog.value.name = theme.name
  currentItem.value.theme = theme
  editMode.value.theme = true
}

const openEditChannel = (channel) => {
  openEditDialog('channel', channel)
}

const openEditPlatform = (platform) => {
  openEditDialog('platform', platform)
}

const openEditProject = (project) => {
  openEditDialog('project', project)
}

const openEditDetail = (detail) => {
  openEditDialog('detail', detail)
}

// 新增確認刪除的方法
const confirmDeleteTheme = (theme) => {
  confirmDelete.value = {
    show: true,
    title: '確認刪除預算主題',
    message: `確定要刪除預算主題「<span class="text-red">${theme.name}</span>」嗎？`,
    expectedName: theme.name,
    inputLabel: '預算主題',
    callback: async () => {
      try {
        submitting.value = true
        const { data } = await apiAuth.delete(`/marketing/themes/${theme._id}`)
        if (data.success) {
          createSnackbar({
            text: '刪除預算主題成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          await Promise.all([
            fetchThemeOptions(),
            fetchList('theme')
          ])
        }
      } catch (err) {
        handleError(err)
      } finally {
        submitting.value = false
        confirmDelete.value.show = false
      }
    }
  }
}



// 新刪除方法
const deleteTheme = () => {
  confirmDialog.value.callback()
}






// 新增��交項目和細項的方法
const submitProject = async () => {
  if (!validateForm('project')) return

  submitting.value = true
  try {
    const url = `/marketing/categories${editMode.value.project ? `/${currentItem.value.project._id}` : ''}`
    const method = editMode.value.project ? 'patch' : 'post'
    const { data } = await apiAuth[method](url, {
      name: forms.value.project.name,
      type: getCategoryType('project')
    })
    
    if (data.success) {
      createSnackbar({
        text: `${editMode.value.project ? '編輯' : '新增'}項目成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('project')
      forms.value.project.name = ''
      formErrors.value.project.name = ''
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

const submitDetail = async () => {
  if (!validateForm('detail')) return

  submitting.value = true
  try {
    const url = `/marketing/categories${editMode.value.detail ? `/${currentItem.value.detail._id}` : ''}`
    const method = editMode.value.detail ? 'patch' : 'post'
    const { data } = await apiAuth[method](url, {
      name: forms.value.detail.name,
      type: getCategoryType('detail')
    })
    
    if (data.success) {
      createSnackbar({
        text: `${editMode.value.detail ? '編輯' : '新增'}細項成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('detail')
      forms.value.detail.name = ''
      formErrors.value.detail.name = ''
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 新增確認刪除項目和細項的方法
const confirmDeleteProject = (project) => {
  confirmDelete.value = {
    show: true,
    title: '確認刪除項目',
    message: `確定要刪除項目「<span class="text-red">${project.name}</span>」嗎？`,
    expectedName: project.name,
    inputLabel: '項目',
    callback: async () => {
      try {
        submitting.value = true
        const { data } = await apiAuth.delete(`/marketing/categories/${project._id}`)
        if (data.success) {
          createSnackbar({
            text: '刪除項目成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          await fetchList('project')
        }
      } catch (err) {
        handleError(err)
      } finally {
        submitting.value = false
        confirmDelete.value.show = false
      }
    }
  }
}

const confirmDeleteDetail = (detail) => {
  confirmDelete.value = {
    show: true,
    title: '確認刪除細項',
    message: `確定要刪除細項「<span class="text-red">${detail.name}</span>」嗎？`,
    expectedName: detail.name,
    inputLabel: '細項',
    callback: async () => {
      try {
        submitting.value = true
        const { data } = await apiAuth.delete(`/marketing/categories/${detail._id}`)
        if (data.success) {
          createSnackbar({
            text: '刪除細項成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          await fetchList('detail')
        }
      } catch (err) {
        handleError(err)
      } finally {
        submitting.value = false
        confirmDelete.value.show = false
      }
    }
  }
}

// 新增 getCategoryType 函數
const getCategoryType = (type) => {
  const typeMap = {
    channel: 1,
    platform: 2,
    project: 3,
    detail: 4
  }
  return typeMap[type]
}

// 新增提交編輯主題的方法
const submitEditTheme = async () => {
  if (!editThemeDialog.value.name) {
    editThemeErrors.value.name = '請輸入主題名稱'
    return
  }

  submitting.value = true
  try {
    const { data } = await apiAuth.patch(`/marketing/themes/${currentItem.value.theme._id}`, {
      name: editThemeDialog.value.name
    })
    
    if (data.success) {
      createSnackbar({
        text: '編輯主題成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchList('theme')
      closeEditThemeDialog()
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 新增確認刪除對話框的控制
const confirmDelete = ref({
  show: false,
  title: '',
  message: '',
  expectedName: '',
  inputLabel: '',
  callback: null
})

// 新增一行空白資料
const addNewRow = () => {
  if (!tableData.value.length) {
    tableData.value.push({
      channelId: null,
      name: '',
      platforms: [{
        platformId: null,
        name: '',
        budgets: {}
      }]
    })
  } else {
    const lastChannel = tableData.value[tableData.value.length - 1]
    lastChannel.platforms.push({
      platformId: null,
      name: '',
      budgets: {}
    })
  }
}

// 處理渠道選擇
const handleChannelSelect = async (channelIndex) => {
  const channel = tableData.value[channelIndex]
  const selectedChannel = channelList.value.find(c => c._id === channel.channelId)
  if (selectedChannel) {
    channel.name = selectedChannel.name
    await fetchPlatforms()
  }
}

// 更新預算金額
const updateBudget = (channelId, platformId, month, value) => {
  // 這裡可以加入自動儲存的邏輯
  console.log('更新預算:', { channelId, platformId, month, value })
}

// 確認刪除渠道
const confirmDeleteChannel = (channel) => {
  confirmDelete.value = {
    show: true,
    title: '確認刪除廣告渠道',
    message: `確定要刪除廣告渠道「<span class="text-red">${channel.name}</span>」嗎？<br>此操作將同時刪除該渠道下的所有平台資料。`,
    expectedName: channel.name,
    inputLabel: '廣告渠道',
    callback: async () => {
      try {
        submitting.value = true
        const { data } = await apiAuth.delete(`/marketing/categories/${channel._id}`)
        if (data.success) {
          createSnackbar({
            text: '刪除廣告渠道成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          await fetchList('channel')
        }
      } catch (err) {
        handleError(err)
      } finally {
        submitting.value = false
        confirmDelete.value.show = false
      }
    }
  }
}

// 確認刪除平台
const confirmDeletePlatform = (platform) => {
  confirmDelete.value = {
    show: true,
    title: '確認刪除廣告平台',
    message: `確定要刪除廣告平台「<span class="text-red">${platform.name}</span>」嗎？`,
    expectedName: platform.name,
    inputLabel: '廣告平台',
    callback: async () => {
      try {
        submitting.value = true
        const { data } = await apiAuth.delete(`/marketing/categories/${platform._id}`)
        if (data.success) {
          createSnackbar({
            text: '刪除廣告平台成功',
            snackbarProps: { color: 'teal-lighten-1' }
          })
          await fetchList('platform')
        }
      } catch (err) {
        handleError(err)
      } finally {
        submitting.value = false
        confirmDelete.value.show = false
      }
    }
  }
}

// 新增表單驗證函數
const validateForm = (type) => {
  let isValid = true
  formErrors.value[type].name = ''

  if (!forms.value[type].name) {
    formErrors.value[type].name = `請輸入${getTypeText(type)}稱`
    isValid = false

  }
  return isValid
}

// 新增類型文字轉換函數
const getTypeText = (type) => {
  const typeTexts = {
    theme: '預算主題',
    channel: '廣告渠道',
    platform: '平台',
    project: '項目',
    detail: '細項'
  }
  return typeTexts[type]
}

// 修改初始化資料的 watch
const initData = async () => {
  try {
    await Promise.all([
      fetchThemeOptions(),
      fetchList('theme'),
      fetchList('channel'),
      fetchList('platform'),
      // 直接載入項目和細項的資料
      (async () => {
        const { data: projectData } = await apiAuth.get('/marketing/categories/all?type=3')
        if (projectData.success) {
          projectList.value = projectData.result.data || []
        }
      })(),
      (async () => {
        const { data: detailData } = await apiAuth.get('/marketing/categories/all?type=4')
        if (detailData.success) {
          detailList.value = detailData.result.data || []
        }
      })()
    ])
  } catch (err) {
    handleError(err)
  }
}

// 修改 watch，確保一進入頁面就載入資料
watch(
  () => user.token,
  async (newVal) => {
    if (newVal) {
      await initData()
    }
  },
  { immediate: true }
)

// 項目管理對話框
const projectDialog = ref({
  open: false,
  title: '項目管理',
  form: {
    name: ''
  },
  errors: {
    name: ''
  }
})

// 細項管理對話框
const detailDialog = ref({
  open: false,
  title: '細項管理',
  form: {
    name: '',
    description: '',
    projectId: null
  },
  errors: {
    name: '',
    description: '',
    projectId: ''
  }
})

// 項目列表
const projectList = ref([])
const detailList = ref([])

// 獲取項目列表
const fetchProjects = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/categories/all?type=3')
    if (data.success) {
      projectList.value = data.result.data
    }
  } catch (err) {
    handleError(err)
  }
}

// 獲取細項列表
const fetchDetails = async (projectId = null) => {
  try {
    const url = projectId 
      ? `/marketing/categories/all?type=4&projectId=${projectId}`
      : '/marketing/categories/all?type=4'
    const { data } = await apiAuth.get(url)
    if (data.success) {
      detailList.value = data.result.data
    }
  } catch (err) {
    handleError(err)
  }
}

// 新增項目
const addProject = async () => {
  if (!validateForm('project')) return
  
  try {
    submitting.value = true
    const { data } = await apiAuth.post('/marketing/categories', {
      name: projectDialog.value.form.name,
      type: getCategoryType('project')
    })
    if (data.success) {
      createSnackbar({
        text: '新增項目成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchProjects()
      projectDialog.value.open = false
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 新增細項
const addDetail = async () => {
  if (!validateForm('detail')) return
  
  try {
    submitting.value = true
    const { data } = await apiAuth.post('/marketing/categories', {
      name: detailDialog.value.form.name,
      type: getCategoryType('detail')
    })
    if (data.success) {
      createSnackbar({
        text: '新增細項成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchDetails()
      detailDialog.value.open = false
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 修改預算主題的獲取
watch(selectedYear, async (newVal) => {
  if (newVal) {
    await fetchThemeOptions()
  }
})

// 修改編輯對話框的響應式狀態
const editDialogs = ref({
  theme: {
    open: false,
    name: ''
  },
  channel: {
    open: false,
    name: ''
  },
  platform: {
    open: false,
    name: ''
  },
  project: {
    open: false,
    name: ''
  },
  detail: {
    open: false,
    name: ''
  }
})

// 修改編輯錯誤訊息的響應式狀態
const editErrors = ref({
  theme: { name: '' },
  channel: { name: '' },
  platform: { name: '' },
  project: { name: '' },
  detail: { name: '' }
})

// 修改開啟編輯對話框的方法
const openEditDialog = (type, item) => {
  editDialogs.value[type].open = true
  editDialogs.value[type].name = item.name
  currentItem.value[type] = item
  editMode.value[type] = true
}

// 修改關閉編輯對話框的方法
const closeEditDialog = (type) => {
  editDialogs.value[type].open = false
  editDialogs.value[type].name = ''
  editErrors.value[type].name = ''
  currentItem.value[type] = null
  editMode.value[type] = false
}

// 修改提交編輯的方法
const submitEdit = async (type) => {
  if (!editDialogs.value[type].name) {
    editErrors.value[type].name = `請輸入${getTypeText(type)}名稱`
    return
  }

  submitting.value = true
  try {
    const url = type === 'theme' 
      ? `/marketing/themes/${currentItem.value[type]._id}`
      : `/marketing/categories/${currentItem.value[type]._id}`
    
    const { data } = await apiAuth.patch(url, {
      name: editDialogs.value[type].name,
      ...(type !== 'theme' && { type: getCategoryType(type) })
    })
    
    if (data.success) {
      createSnackbar({
        text: `編輯${getTypeText(type)}成功`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      if (type === 'theme') {
        await Promise.all([
          fetchThemeOptions(),
          fetchList('theme')
        ])
      } else {
        await fetchList(type)
      }
      editDialogs.value[type].name = ''
      editErrors.value[type].name = ''
      editMode.value[type] = false
      currentItem.value[type] = null
      editDialogs.value[type].open = false
    }
  } catch (err) {
    handleError(err)
  } finally {
    submitting.value = false
  }
}

// 在 template 中新增其他四個編輯對話框
</script>

<style lang="scss" scoped>
.v-table {
  :deep(thead) {
    background-color: #f5f5f5;
    th {
      color: #1a237e !important;
      font-weight: 600;
    }
  }
  
  :deep(tbody) {
    tr:nth-child(odd) {
      background-color: #fafafa;
    }
    tr:nth-child(even) {
      background-color: #ffffff;
    }
  }
}

.v-btn {
  text-transform: none;
}
</style> 