<!-- default layout -->
<template>
  <v-app>
    <v-app-bar
      elevation="0"
      border="b-sm"
      height="100"
      class="position-fixed"
    >
      <v-app-bar-nav-icon
        class="ms-3"
        color="grey-darken-3"
        @click.stop="toggleDrawer"
      />
      <router-link
        to="/"
        class="d-flex"
      >
        <v-img
          src="/src/assets/image/GInternational_Logo_horizontal.png"
          width="190"
          style="margin-left: 2px;"
        />
      </router-link>
      <v-spacer />
      <!-- <v-icon
        icon="mdi-email-outline"
        size="22"
        color="purple-darken-4"
        class="me-6"
      />
      <v-icon
        icon="mdi-bell-outline"
        size="22"
        color="purple-darken-4"
        class="me-8"
      /> -->
      <v-btn
        v-if="user.isLogin && mdAndUp"
        prepend-icon="mdi-account-arrow-right"
        variant="outlined"
        rounded="0"
        color="purple-darken-4"
        class="me-6"
        @click="logout"
      >
        登出
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-if="mdAndUp"
      v-model="drawer"
      :rail="rail"
      permanent
      :expand-on-hover="rail"
      class="position-fixed"
    >
      <v-list class="h-100 d-flex flex-column pa-0">
        <div>
          <template v-if="!rail">
            <v-card
              v-tooltip="'個人資料管理'"
              elevation="0"
              rounded="0"
              height="172"
              width="260"
              class="pa-0 card-bg position-relative"
              :class="{ 'loaded': isBackgroundLoaded }"
              to="/profile"
            >
              <!-- 添加 skeleton -->
              <v-skeleton-loader
                v-if="!isBackgroundLoaded"
                class="position-absolute w-100 h-100 pa-0 ma-0"
              />

              <!-- 添加隱藏的圖片用於預加載 -->
              <img
                src="/src/assets/image/bg_profile_purpleflower.webp"
                alt="background"
                style="display: none;"
                @load="handleImageLoad"
              >
              <div class="card-blur pt-2 pb-4 px-2">
                <v-card-title
                  class="ps-5 pb-3 d-flex justify-space-between pe-2"
                >
                  <v-avatar
                    size="48"
                    style="box-shadow: 0 0 10px rgba(255,255,255,1);"
                  >
                    <v-skeleton-loader
                      v-if="!isAvatarLoaded"
                      type="avatar"
                    />
                    <v-img
                      v-show="isAvatarLoaded"
                      :src="user.avatar"
                      @load="handleAvatarLoad"
                    />
                  </v-avatar>
                </v-card-title>
                <v-card-text style="letter-spacing: 2px; color: white; line-height: 24px;">
                  <v-row>
                    <v-col
                      cols="12"
                      class="ps-4 pb-0 pt-4"
                    >
                      <span style="font-size: 17px; font-weight: 600;">{{ user.name }}</span>
                    </v-col>
                    <v-col
                      cols="12"
                      class="ps-4 pb-0 pt-0"
                    >
                      <span>{{ user.userId }}</span>
                      <span v-if="user.isAdmin">{{ user.adminId }}</span>
                    </v-col>
                    <v-col
                      cols="12"
                      class="ps-4 pb-0 pt-0"
                    >
                      {{ getRoleTitle(user.role) }}
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>
            </v-card>
          </template>
          <template v-else>
            <v-list-item
              to="/profile"
              color="grey-darken-3"
              class="mt-2"
            >
              <template #prepend>
                <v-icon>mdi-account-circle-outline</v-icon>
              </template>
              <v-list-item-title>個人資料管理</v-list-item-title>
            </v-list-item>
          </template>
          <template
            v-for="userItem in filteredUserItems"
            :key="userItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="userItem.children"
              :value="openedGroups.includes(userItem.text)"
              @click="toggleGroup(userItem.text)"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ userItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ userItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in userItem.children"
                :key="child.to"
                :to="child.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ child.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="userItem.to"
              color="grey-darken-3"
              class="mt-2"
            >
              <template #prepend>
                <v-icon>{{ userItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ userItem.text }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-divider
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="cogItem in filteredCogItems"
            :key="cogItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="cogItem.children"
              :value="openedGroups.includes(cogItem.text)"
              @click="toggleGroup(cogItem.text)"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ cogItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ cogItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in cogItem.children"
                :key="child.to"
                :to="child.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ child.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="cogItem.to"
              color="grey-darken-3"
              class="mt-2"
            >
              <template #prepend>
                <v-icon>{{ cogItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ cogItem.text }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-divider
            v-if="user.isAdmin"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template v-if="user.isLogin">
            <template
              v-for="item in filteredAdminItems"
              :key="item.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="item.children"
                :value="openedGroups.includes(item.text)"
                @click="toggleGroup(item.text)"
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>

                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>

              <!-- 沒有子選單的項目 -->
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"

                class="mt-2"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>
        </div>
        <div>
          <v-list-item
            v-if="!user.isLogin"
            to="/login"
          >
            <template #prepend>
              <v-icon>mdi-account-arrow-left</v-icon>
            </template>
            <v-list-item-title>登入</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-if="!mdAndUp"
      v-model="mdDrawer"
      border="0"
      class=" rounded-be-xl position-fixed"
    >
      <v-list class="h-100 pa-0 overflow-auto">
        <div>
          <v-card
            v-tooltip="'個人資料管理'"
            elevation="0"
            rounded="0"
            height="172"
            class="pa-0 card-bg"
            :class="{ 'loaded': isBackgroundLoaded }"
            to="/profile"
          >
            <!-- 添加 skeleton
            <v-skeleton-loader
              v-if="!isBackgroundLoaded"
              class="position-absolute w-100 h-100 pa-0 ma-0"
            /> -->

            <div class="card-blur pt-2 pb-4 px-2">
              <v-card-title class="ps-5 pb-3">
                <v-avatar
                  size="48"
                  style="box-shadow: 0 0 10px rgba(255,255,255,1);"
                >
                  <v-skeleton-loader
                    v-if="!isAvatarLoaded"
                    type="avatar"
                  />
                  <v-img
                    v-show="isAvatarLoaded"
                    :src="user.avatar"
                    @load="handleAvatarLoad"
                  />
                </v-avatar>
              </v-card-title>
              <v-card-text style="letter-spacing: 2px; color: white; line-height: 24px;">
                <v-row>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-4"
                  >
                    <span style="font-size: 17px; font-weight: 600;">{{ user.name }}</span>
                  </v-col>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-0"
                  >
                    <span>{{ user.userId }}</span>
                    <span v-if="user.isAdmin">{{ user.adminId }}</span>
                  </v-col>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-0"
                  >
                    {{ getRoleTitle(user.role) }}
                  </v-col>
                </v-row>
              </v-card-text>
            </div>
          </v-card>
          <!-- 所有登入用戶都可以看到的功能選單 -->
          <template
            v-for="userItem in filteredUserItems"
            :key="userItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="userItem.children"
              :value="openedGroups.includes(userItem.text)"
              @click="toggleGroup(userItem.text)"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ userItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ userItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in userItem.children"
                :key="child.to"
                :to="child.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ child.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="userItem.to"
              color="grey-darken-3"
              class="mt-2"
            >
              <template #prepend>
                <v-icon>{{ userItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ userItem.text }}</v-list-item-title>
            </v-list-item>
          </template>
          <!-- 管理者功能選單 -->
          <v-divider
            v-if="user.isAdmin"
            class="mt-4"
          />
          <template v-if="user.isLogin">
            <template
              v-for="item in filteredAdminItems"
              :key="item.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group v-if="item.children">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>

                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>

              <!-- 沒有子選單的項目 -->
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
                class="mt-2"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>
        </div>
        <v-divider class="mt-4" />
        <div>
          <v-list-item
            v-if="user.isLogin"
            class="mt-4"
            color="grey-darken-3"
            @click="logout"
          >
            <template #prepend>
              <v-icon>mdi-account-arrow-right</v-icon>
            </template>
            <v-list-item-title>登出</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'

const { mdAndUp, xlAndUp, name: breakpoint } = useDisplay()

const drawer = ref(true)
const mdDrawer = ref(false)
const rail = ref(false)
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()
const route = useRoute()

const openedGroups = ref([])
const isBackgroundLoaded = ref(false)
const isAvatarLoaded = ref(false)
const handleImageLoad = () => {
  isBackgroundLoaded.value = true
}

const handleAvatarLoad = () => {
  setTimeout(() => {
    isAvatarLoaded.value = true
  }, 100)
}

const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}

const toggleGroup = (group) => {
  if (openedGroups.value.includes(group)) {
    openedGroups.value = openedGroups.value.filter(g => g !== group)
  } else {
    openedGroups.value.push(group)
  }
}

const userItems = [
  {
    to: '/formGenerator',
    text: '表單產生器',
    icon: 'mdi-list-box-outline',
  },
  {
    to: '/marketingAnalysis',
    text: '行銷費用分析',
    icon: 'mdi-chart-multiple',
  },

]

const cogItems = [
  {
    text: '行銷費用管理',
    icon: 'mdi-chart-bar',
    roles: ['ADMIN', 'MANAGER', 'USER'],
    children: [
      {
        to: '/marketingExpenseManagement',
        text: '實際支出管理',
        icon: 'mdi-cash-100',
        roles: ['ADMIN', 'MANAGER', 'USER']
      },
      {
        to: '/marketingBudgetManagement',
        text: '行銷預算管理',
        icon: 'mdi-table-edit',
        roles: ['ADMIN', 'MANAGER', 'USER']
      },
      // {
      //   to: '/marketingReportDownload',
      //   text: '行銷報表下載',
      //   icon: 'mdi-file-download-outline',
      //   roles: ['ADMIN', 'MANAGER']
      // },
      {
        to: '/marketingCategoryManagement',
        text: '行銷分類管理',
        icon: 'mdi-shape-plus-outline',
        roles: ['ADMIN', 'MANAGER']
      },
      
    ]
  },
]

const adminItems = [
  {
    to: '/admin',
    text: '管理者管理',
    icon: 'mdi-database-cog',
    roles: ['ADMIN']
  },
  {
    to: '/user',
    text: '使用者管理',
    icon: 'mdi-account-cog',
    roles: ['ADMIN']
  },
  
  {
    to: '/auditLog',
    text: '異動紀錄',
    icon: 'mdi-history',
    roles: ['ADMIN']
  }
]
const filteredCogItems = computed(() => {
  return cogItems.filter(item => {
    const hasPermission = item.roles.some(role => {
      switch (role) {
        case 'ADMIN':
          return user.isAdmin
        case 'MANAGER':
          return user.isManager
        case 'USER':
          return user.isUser
        default:
          return false
      }
    })

    // 如果有子項目，也需要檢查子項目的權限
    if (item.children) {
      item.children = item.children.filter(child => {
        return child.roles.some(role => {
          switch (role) {
            case 'ADMIN':
              return user.isAdmin
            case 'MANAGER':
              return user.isManager
            case 'USER':
              return user.isUser
            default:
              return false
          }
        })
      })
      // 只有當子項目不為空時才顯示父項目
      return hasPermission && item.children.length > 0
    }

    return hasPermission
  })
})


// 新增一個計算屬性來過濾可見的選單項目
const filteredAdminItems = computed(() => {
  return adminItems.filter(item => {
    const hasPermission = item.roles.some(role => {
      switch (role) {
        case 'SUPER_ADMIN':
          return user.isSuperAdmin
        case 'HR':
          return user.isHR
        case 'MANAGER':
          return user.isManager
        case 'IT':
          return user.isIT
        case 'ACCOUNTANT':
          return user.isAccountant
        case 'ADMIN':
          return user.isAdmin
        default:
          return false
      }
    })

    // 如果有子項目，也需要檢查子項目的權限
    if (item.children) {
      item.children = item.children.filter(child => {
        return child.roles.some(role => {
          switch (role) {
            case 'SUPER_ADMIN':
              return user.isSuperAdmin
            case 'HR':
              return user.isHR
            case 'MANAGER':
              return user.isManager
            case 'IT':
              return user.isIT
            case 'ACCOUNTANT':
              return user.isAccountant
            case 'ADMIN':
              return user.isAdmin
            default:
              return false
          }
        })
      })
      // 只有當子項目不為空時才顯示父項目
      return hasPermission && item.children.length > 0
    }

    return hasPermission
  })
})

// 新增一個計算屬性來過濾一般功能選單
const filteredUserItems = computed(() => {
  return userItems.filter(item => {
    // 如果沒有設定角色限制，所有人都可以看到
    if (!item.roles || item.roles.length === 0) return true

    const hasPermission = item.roles.some(role => {
      switch (role) {
        case 'ADMIN':
          return user.isAdmin
        case 'MANAGER':
          return user.isManager
        case 'USER':
          return user.isUser
        default:
          return false
      }
    })

    // 如果有子項目，也需要檢查子項目的權限
    if (item.children) {
      item.children = item.children.filter(child => {
        return child.roles.some(role => {
          switch (role) {
            case 'ADMIN':
              return user.isAdmin
            case 'MANAGER':
              return user.isManager
            case 'USER':
              return user.isUser
            default:
              return false
          }
        })
      })
      // 只有當子項目不為空時才顯示父項目
      return hasPermission && item.children.length > 0
    }

    return hasPermission
  })
})

// 監聽路由變化，當路由改變時收合所有子選單
watch(() => route.path, () => {
  openedGroups.value = []
})

// 監聽螢幕尺寸變化
watch(() => breakpoint.value, () => {
  if (xlAndUp.value) {
    // XL 以上，預設展開
    rail.value = false
  } else if (mdAndUp.value) {
    // SM 到 XL 之間，預設收合（只顯示圖示）
    rail.value = true
  }
}, { immediate: true })

// 控制抽屜展開的函數
// 改進的 toggleDrawer 函數
const toggleDrawer = () => {
  if (!mdAndUp.value) {
    // SM 以下，切換 mdDrawer
    mdDrawer.value = !mdDrawer.value
  } else {
    // SM 以上，切換 rail 狀態
    rail.value = !rail.value
  }
}

// 組件掛載時設置初始狀態
onMounted(() => {
  if (xlAndUp.value) {
    rail.value = false // XL 以上，預設展開
  } else if (mdAndUp.value) {
    rail.value = true // SM 到 XL 之間，預設收合
  }
})

const logout = async () => {
  await user.logout()
  createSnackbar({
    text: '登出成功',
    snackbarProps: {
      color: 'teal-lighten-1'
    }
  })

  router.push('/login')
}

// 監聽 avatar 變化時重置 loading 狀態
watch(() => user.avatar, (newAvatar) => {
  if (newAvatar) {
    isAvatarLoaded.value = false
    const img = new Image()
    img.onload = () => {
      handleAvatarLoad()
    }
    img.src = newAvatar
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.card-bg {
  background: url(/src/assets/image/bg_profile.png);
  background-size: cover;
  transition: opacity 0.3s ease;
}



.card-blur {
  background: linear-gradient(135deg, rgb(105, 55, 105) 20%, rgba(255,255,255,0));
}

</style>
