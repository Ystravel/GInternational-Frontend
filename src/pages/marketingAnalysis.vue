<template>
  <v-container
    min-width="2160"
  >
    <!-- 搜尋條件區塊 -->
    <v-row class="elevation-4 rounded-lg py-4 pt-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <v-col cols="12">
        <v-row>
          <v-col cols="5">
            <h3>行銷費用分析</h3>
          </v-col>
          <v-col cols="7">
            <v-row>
              <v-col cols="12">
                <v-row>
                  <!-- 第一行搜尋條件 -->
                  <v-col>
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
                  <v-col>
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
                  <v-col>
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
                  <v-col v-if="searchForm.reportType === 'lineExpense'">
                    <v-select
                      v-model="searchForm.month"
                      :items="monthOptions"
                      item-title="name"
                      item-value="value"
                      label="月份"
                      variant="outlined"
                      density="compact"
                      :error-messages="monthError"
                      clearable
                      @update:model-value="handleMonthChange"
                    />
                  </v-col>
                  <v-col cols="2">
                    <v-btn
                      color="purple-darken-2"
                      :loading="isLoading"
                      block
                      @click="generateReport"
                    >
                      查看報表
                    </v-btn>
                  </v-col>
                </v-row>
                <!-- 第二行線別選擇 -->
                <v-row v-if="searchForm.reportType === 'lineExpense'">
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="searchForm.line"
                      :items="lineOptions"
                      label="線別"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      :error-messages="lineError"
                      clearable
                      multiple
                      select-all
                      @update:model-value="handleLineChange"
                    >
                      <template #prepend-item>
                        <v-list-item
                          title="全選"
                          color="purple-lighten-1"
                          prepend-icon="mdi-checkbox-multiple-marked"
                          :active="searchForm.line.length === lineOptions.length"
                          @click="selectAllLines"
                        />
                        <v-divider class="mt-2" />
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 報表呈現區塊 -->
    <v-row 
      v-if="showReport"
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <v-col cols="12">
        <div class="d-flex justify-end align-center mb-4 sticky-buttons">
          <div>
            <v-btn
              color="teal-darken-1"
              class="me-2"
              prepend-icon="mdi-microsoft-excel"
              :loading="isExporting"
              @click="exportToExcel"
            >
              匯出 EXCEL
            </v-btn>
            <v-btn
              color="red-darken-1"
              prepend-icon="mdi-file-pdf-box"
              :loading="isExporting"
              @click="exportToPDF"
            >
              匯出 PDF
            </v-btn>
          </div>
        </div>

        <!-- 行銷預算與實際支出比較表，因要滑動時，標題會被蓋住，所以需要獨立出來 -->
        <div
          v-if="searchForm.reportType === 'comparison'"
          class="budget-table-title"
        >
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          {{ reportTypeOptions.find(option => option.value === 'comparison')?.title || '' }}
        </div>

        <div class="table-container">
          <!-- 年度行銷預算表 -->
          <div
            v-if="searchForm.reportType === 'budget'" 
            class="budget-table-title "
          >
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
                      {{ formatMonthValue(platform.budget.JAN) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.FEB) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.MAR) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 1)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.APR) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.MAY) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.JUN) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 2)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.JUL) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.AUG) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.SEP) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 3)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.OCT) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.NOV) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget.DEC) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.budget, 4)) }}
                    </td>
                    <td 
                      class="total-col"
                      style="width: 180px"
                    >
                      {{ formatMonthValue(getPlatformTotal(platform.budget)) }}
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
                  {{ formatMonthValue(getMonthlyTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAR')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUN')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('SEP')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('DEC')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(4)) }}
                </td>
                <td 
                  class="total-col highlight-total"
                  style="width: 180px"
                >
                  {{ formatMonthValue(getGrandTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 行銷實際支出表 -->
          <div
            v-if="searchForm.reportType === 'expense'"
            class="budget-table-title "
          >
            <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
            <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
            {{ reportTypeOptions.find(option => option.value === 'expense')?.title || '' }}
          </div>

          <table
            v-if="searchForm.reportType === 'expense'"
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
                      {{ formatMonthValue(platform.expense.JAN) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.FEB) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.MAR) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 1)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.APR) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.MAY) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.JUN) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 2)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.JUL) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.AUG) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.SEP) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 3)) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.OCT) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.NOV) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense.DEC) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getQuarterTotal(platform.expense, 4)) }}
                    </td>
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformTotal(platform.expense)) }}
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
                  {{ formatMonthValue(getMonthlyTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAR')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(1)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUN')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(2)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('SEP')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(3)) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyTotal('DEC')) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyTotal(4)) }}
                </td>
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 行銷預算與實際支出比較表 -->
          

          <table
            v-if="searchForm.reportType === 'comparison'"
            class="budget-table comparison-table"
          >
            <thead>
              <tr class="header-row">
                <th
                  rowspan="2"
                  class="header-cell"
                >
                  廣告渠道
                </th>
                <th
                  rowspan="2"
                  class="header-cell"
                >
                  平台
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JAN
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  FEB
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  MAR
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q1
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  APR
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  MAY
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JUN
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q2
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  JUL
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  AUG
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  SEP
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q3
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  OCT
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  NOV
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  DEC
                </th>
                <th
                  colspan="3"
                  class="header-cell-quarter"
                >
                  Q4
                </th>
                <th
                  colspan="3"
                  class="header-cell"
                >
                  Total
                </th>
              </tr>
              <tr class="header-row">
                <!-- JAN -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- FEB -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- MAR -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q1 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- APR -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- MAY -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- JUN -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q2 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- JUL -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- AUG -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- SEP -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q3 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- OCT -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- NOV -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- DEC -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
                </th>
                <!-- Q4 -->
                <th class="sub-header-cell-quarter">
                  預算
                </th>
                <th class="sub-header-cell-quarter">
                  實際
                </th>
                <th class="sub-header-cell-quarter">
                  差異
                </th>
                <!-- Total -->
                <th class="sub-header-cell">
                  預算
                </th>
                <th class="sub-header-cell">
                  實際
                </th>
                <th class="sub-header-cell">
                  差異
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
                    
                    <!-- JAN -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JAN || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JAN || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JAN)">
                      {{ formatMonthValue(platform.difference.JAN) }}
                    </td>

                    <!-- FEB -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.FEB || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.FEB || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.FEB)">
                      {{ formatMonthValue(platform.difference.FEB) }}
                    </td>

                    <!-- MAR -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.MAR || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.MAR || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.MAR)">
                      {{ formatMonthValue(platform.difference.MAR) }}
                    </td>

                    <!-- Q1 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 1)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 1)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 1))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 1)) }}
                    </td>

                    <!-- APR -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.APR || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.APR || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.APR)">
                      {{ formatMonthValue(platform.difference.APR) }}
                    </td>

                    <!-- MAY -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.MAY || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.MAY || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.MAY)">
                      {{ formatMonthValue(platform.difference.MAY) }}
                    </td>

                    <!-- JUN -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JUN || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JUN || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JUN)">
                      {{ formatMonthValue(platform.difference.JUN) }}
                    </td>

                    <!-- Q2 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 2)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 2)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 2))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 2)) }}
                    </td>

                    <!-- JUL -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.JUL || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.JUL || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.JUL)">
                      {{ formatMonthValue(platform.difference.JUL) }}
                    </td>

                    <!-- AUG -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.AUG || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.AUG || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.AUG)">
                      {{ formatMonthValue(platform.difference.AUG) }}
                    </td>

                    <!-- SEP -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.SEP || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.SEP || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.SEP)">
                      {{ formatMonthValue(platform.difference.SEP) }}
                    </td>

                    <!-- Q3 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 3)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 3)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 3))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 3)) }}
                    </td>

                    <!-- OCT -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.OCT || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.OCT || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.OCT)">
                      {{ formatMonthValue(platform.difference.OCT) }}
                    </td>

                    <!-- NOV -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.NOV || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.NOV || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.NOV)">
                      {{ formatMonthValue(platform.difference.NOV) }}
                    </td>

                    <!-- DEC -->
                    <td class="month-col">
                      {{ formatMonthValue(platform.budget?.DEC || 0) }}
                    </td>
                    <td class="month-col">
                      {{ formatMonthValue(platform.expense?.DEC || 0) }}
                    </td>
                    <td :class="getDifferenceClass(platform.difference.DEC)">
                      {{ formatMonthValue(platform.difference.DEC) }}
                    </td>

                    <!-- Q4 -->
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyBudget(platform, 4)) }}
                    </td>
                    <td class="quarter-col">
                      {{ formatQuarterValue(getPlatformQuarterlyExpense(platform, 4)) }}
                    </td>
                    <td :class="['quarter-col', getDifferenceClass(getPlatformQuarterlyDifference(platform, 4))]">
                      {{ formatQuarterValue(getPlatformQuarterlyDifference(platform, 4)) }}
                    </td>

                    <!-- Total -->
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformBudgetTotal(platform.budget)) }}
                    </td>
                    <td class="total-col">
                      {{ formatMonthValue(getPlatformExpenseTotal(platform.expense)) }}
                    </td>
                    <td :class="['total-col', getDifferenceClass(getPlatformDifference(platform))]">
                      {{ formatMonthValue(getPlatformDifference(platform)) }}
                    </td>
                  </tr>
                </template>
              </template>

              <!-- 總計列 -->
              <tr class="monthly-total-row">
                <td
                  colspan="2"
                  class="total-label"
                >
                  月度總計
                </td>
                <!-- JAN -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JAN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JAN')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JAN'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JAN')) }}
                </td>
                <!-- FEB -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('FEB')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('FEB')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('FEB'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('FEB')) }}
                </td>
                <!-- MAR -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('MAR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('MAR')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('MAR'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('MAR')) }}
                </td>
                <!-- Q1 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(1)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(1)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(1))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(1)) }}
                </td>
                <!-- APR -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('APR')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('APR')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('APR'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('APR')) }}
                </td>
                <!-- MAY -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('MAY')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('MAY')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('MAY'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('MAY')) }}
                </td>
                <!-- JUN -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JUN')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JUN')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JUN'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JUN')) }}
                </td>
                <!-- Q2 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(2)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(2)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(2))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(2)) }}
                </td>
                <!-- JUL -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('JUL')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('JUL')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('JUL'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('JUL')) }}
                </td>
                <!-- AUG -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('AUG')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('AUG')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('AUG'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('AUG')) }}
                </td>
                <!-- SEP -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('SEP')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('SEP')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('SEP'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('SEP')) }}
                </td>
                <!-- Q3 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(3)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(3)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(3))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(3)) }}
                </td>
                <!-- OCT -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('OCT')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('OCT')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('OCT'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('OCT')) }}
                </td>
                <!-- NOV -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('NOV')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('NOV')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('NOV'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('NOV')) }}
                </td>
                <!-- DEC -->
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyBudgetTotal('DEC')) }}
                </td>
                <td class="month-col">
                  {{ formatMonthValue(getMonthlyExpenseTotal('DEC')) }}
                </td>
                <td :class="getDifferenceClass(getMonthlyDifferenceTotal('DEC'))">
                  {{ formatMonthValue(getMonthlyDifferenceTotal('DEC')) }}
                </td>
                <!-- Q4 -->
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyBudgetTotal(4)) }}
                </td>
                <td class="quarter-col">
                  {{ formatQuarterValue(getQuarterlyExpenseTotal(4)) }}
                </td>
                <td :class="['quarter-col', getDifferenceClass(getQuarterlyDifferenceTotal(4))]">
                  {{ formatQuarterValue(getQuarterlyDifferenceTotal(4)) }}
                </td>
                <!-- Total -->
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandBudgetTotal()) }}
                </td>
                <td class="total-col highlight-total">
                  {{ formatMonthValue(getGrandExpenseTotal()) }}
                </td>
                <td :class="['total-col', 'highlight-total', getDifferenceClass(getGrandDifferenceTotal())]">
                  {{ formatMonthValue(getGrandDifferenceTotal()) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 行銷各線實際支出表 -->
        <div
          v-if="searchForm.reportType === 'lineExpense'"
          class="budget-table-title"
        >
          <span class="text-orange-darken-2">{{ searchForm.year ? `${searchForm.year}` : '( 請先選擇年度 )' }}</span> 年度 
          <span class="text-pink-darken-1">{{ searchForm.theme ? getThemeName(searchForm.theme) : '( 請先選擇行銷主題 )' }}</span> 
          行銷各線實際支出表 <span class="text-light-blue-darken-2">({{ searchForm.month ? `${searchForm.month}月` : '( 請先選擇月份 )' }})</span>
        </div>

        <div class="table-container">
          <table
            v-if="searchForm.reportType === 'lineExpense'"
            class="budget-table"
          >
            <thead>
              <tr class="header-row">
                <th 
                  class="header-cell sticky-col"
                  style="width: 180px; left: 0; z-index: 2;"
                >
                  平台 / 線別
                </th>
                <th
                  v-for="line in searchForm.line"
                  :key="line"
                  class="header-cell"
                  style="width: 180px"
                >
                  {{ getLineName(line) }}
                </th>
                <th 
                  class="header-cell sticky-col"
                  style="width: 180px; right: 0; z-index: 2;"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="platform in reportData"
                :key="platform.platformName"
              >
                <td 
                  class="platform-col sticky-col"
                  style="width: 180px; left: 0; z-index: 1;"
                >
                  {{ platform.platformName }}
                </td>
                <td
                  v-for="line in searchForm.line"
                  :key="line"
                  class="month-col"
                  style="width: 180px"
                >
                  {{ formatMonthValue(platform.expenses[getLineName(line)] || 0) }}
                </td>
                <td 
                  class="total-col sticky-col"
                  style="width: 180px; right: 0; z-index: 1;"
                >
                  {{ Number(platform.total) > 0 ? formatMonthValue(platform.total) : '-' }}
                </td>
              </tr>
              <!-- 總計列 -->
              <tr class="monthly-total-row">
                <td 
                  class="sticky-col"
                  style="width: 180px; left: 0; z-index: 1;"
                >
                  總計
                </td>
                <td
                  v-for="line in searchForm.line"
                  :key="line"
                  class="month-col"
                  style="width: 180px"
                >
                  {{ formatMonthValue(reportData.reduce((sum, platform) => sum + (platform.expenses[getLineName(line)] || 0), 0)) }}
                </td>
                <td 
                  class="total-col highlight-total sticky-col"
                  style="width: 180px; right: 0; z-index: 1;"
                >
                  {{ 
                    reportData.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0) > 0 
                      ? formatMonthValue(reportData.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0))
                      : '-'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
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
  reportType: null,
  line: [],
  month: null
})

const yearError = ref('')
const themeError = ref('')
const reportTypeError = ref('')
const lineError = ref('')
const monthError = ref('')

// ===== 選項資料 =====
const yearOptions = ref([])
const themeOptions = ref([])
const reportTypeOptions = ref([
  { title: '行銷預算表', value: 'budget' },
  { title: '行銷實際支出表', value: 'expense' },
  { title: '行銷預算與實際支出比較表', value: 'comparison' },
  { title: '行銷各線實際支出表', value: 'lineExpense' },
  // { title: '行銷各線實際支出表 (總表)', value: 'lineExpenseTotal' },
])
const lineOptions = ref([])
const monthOptions = ref([])

// ===== 報表資料 =====
const reportData = ref([])

// ===== 方法 =====
// 載入選項資料
const loadOptions = async () => {
  try {
    const [yearResponse, themeResponse, lineResponse] = await Promise.all([
      apiAuth.get('/marketing/budgets/years'),
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 3 } }) // 抓取線別
    ])

    if (yearResponse.data.success) {
      yearOptions.value = yearResponse.data.result
    }
    if (themeResponse.data.success) {
      themeOptions.value = themeResponse.data.result
    }
    if (lineResponse.data.success) {
      lineOptions.value = lineResponse.data.result
    }

    // 設定月份選項
    monthOptions.value = Array.from({ length: 12 }, (_, i) => ({
      name: `${i + 1}月`,
      value: i + 1
    }))
  } catch (error) {
    handleError(error)
  }
}

// 監聽主題和報表類型的變化
watch([
  () => searchForm.value.theme,
  () => searchForm.value.reportType
], async ([newTheme, newReportType]) => {
  try {
    isLoading.value = true
    // 當主題或報表類型為空時，清空年度選項
    if (!newTheme || !newReportType) {
      yearOptions.value = []
      // 確保年度選擇也被清空
      searchForm.value.year = null
      return
    }

    // 據報表類型要查詢不同的 API
    let endpoint
    switch (newReportType) {
      case 'budget':
        endpoint = `/marketing/budgets/years/${newTheme}`
        break
      case 'expense':
        endpoint = `/marketing/expenses/years/${newTheme}`
        break
      case 'comparison':
        try {
          const [budgetYears, expenseYears] = await Promise.all([
            apiAuth.get(`/marketing/budgets/years/${newTheme}`),
            apiAuth.get(`/marketing/expenses/years/${newTheme}`)
          ])
          if (budgetYears.data.success && expenseYears.data.success) {
            const commonYears = budgetYears.data.result.filter(year => 
              expenseYears.data.result.includes(year)
            )
            yearOptions.value = commonYears
            if (!commonYears.includes(searchForm.value.year)) {
              searchForm.value.year = null
            }
            // 檢查是否有共同年份
            if (commonYears.length === 0) {
              createSnackbar({
                text: `「${getThemeName(newTheme)}」尚無預算與支出的對應資料`,
                snackbarProps: { color: 'warning' }
              })
            }
          }
        } catch (error) {
          handleError(error)
        }
        return
      default:
        endpoint = `/marketing/expenses/years/${newTheme}`
    }

    if (endpoint) {
      const { data } = await apiAuth.get(endpoint)
      if (data.success) {
        yearOptions.value = data.result
        // 如果當前選擇的年度不在新的選項中，清空年度選擇
        if (!data.result.includes(searchForm.value.year)) {
          searchForm.value.year = null
        }
        // 檢查是否有年份資料
        if (data.result.length === 0) {
          const reportTypeName = reportTypeOptions.value.find(option => 
            option.value === newReportType
          )?.title || ''
          createSnackbar({
            text: `「${getThemeName(newTheme)}」尚無「${reportTypeName}」相關資料`,
            snackbarProps: { color: 'warning' }
          })
        }
      }
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}, { immediate: true })

// 處理搜尋條件變更
const handleYearChange = () => {
  yearError.value = ''
  showReport.value = false
}

const handleThemeChange = () => {
  themeError.value = ''
  showReport.value = false
  // 當主題變更時，清除年度選擇
  searchForm.value.year = null
  yearError.value = ''
}

const handleReportTypeChange = () => {
  reportTypeError.value = ''
  showReport.value = false
  
  // 如果不是行銷各線實際支出表，清空線別和月份的選擇
  if (searchForm.value.reportType !== 'lineExpense') {
    searchForm.value.line = []
    searchForm.value.month = null
    lineError.value = ''
    monthError.value = ''
  }
}

const handleLineChange = () => {
  lineError.value = ''
  showReport.value = false
}

const handleMonthChange = () => {
  monthError.value = ''
  showReport.value = false
}

// 產生報表
const generateReport = async () => {
  try {
    // 驗證所有必填欄位
    let hasError = false
    
    // 清除所有錯誤訊息
    reportTypeError.value = ''
    themeError.value = ''
    yearError.value = ''
    lineError.value = ''
    monthError.value = ''

    // 基本驗證
    if (!searchForm.value.reportType) {
      reportTypeError.value = '請選擇報表類型'
      hasError = true
    }
    if (!searchForm.value.theme) {
      themeError.value = '請選擇行銷主題'
      hasError = true
    }
    if (!searchForm.value.year) {
      yearError.value = '請選擇年度'
      hasError = true
    }

    // 只有在選擇行銷各線實際支出表時才驗證線別和月份
    if (searchForm.value.reportType === 'lineExpense') {
      if (!searchForm.value.line?.length) {
        lineError.value = '請選擇線別'
        hasError = true
      }
      if (!searchForm.value.month) {
        monthError.value = '請選擇月份'
        hasError = true
      }
    }

    if (hasError) return

    isLoading.value = true
    let result
    let data

    switch (searchForm.value.reportType) {
      case 'budget':
        data = await apiAuth.get(`/marketing/budgets/${searchForm.value.year}/${searchForm.value.theme}`)
        if (data.data.success) {
          result = processBudgetData(data.data.result)
        }
        break

      case 'expense':
        try {
          const { data: expenseData } = await apiAuth.get('/marketing/expenses/monthly-stats', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme
            }
          })

          if (expenseData.success && Array.isArray(expenseData.result)) {
            result = processExpenseData(expenseData.result)
          }
        } catch (error) {
          console.error('Error fetching expense data:', error)
          handleError(error)
        }
        break

      case 'comparison':
        try {
          const budgetResponse = await apiAuth.get(`/marketing/budgets/${searchForm.value.year}/${searchForm.value.theme}`)
          const expenseResponse = await apiAuth.get('/marketing/expenses/monthly-stats', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme
            }
          })

          if (budgetResponse.data.success && expenseResponse.data.success) {
            const budgetData = processBudgetData(budgetResponse.data.result)
            const expenseData = processExpenseData(expenseResponse.data.result)
            result = processComparisonData(budgetData, expenseData)
          }
        } catch (error) {
          console.error('Error fetching comparison data:', error)
          handleError(error)
        }
        break

      case 'lineExpense':
        try {
          const validLines = searchForm.value.line.filter(validObjectId)
          const { data: lineExpenseData } = await apiAuth.get('/marketing/expenses/line-expenses', {
            params: {
              year: searchForm.value.year,
              theme: searchForm.value.theme,
              lines: validLines.join(','),
              month: searchForm.value.month
            }
          })

          if (lineExpenseData.success && Array.isArray(lineExpenseData.result)) {
            result = processLineExpenseData(lineExpenseData.result)
          }
        } catch (error) {
          console.error('Error fetching line expense data:', error)
          handleError(error)
        }
        break
    }

    if (result) {
      reportData.value = result
      showReport.value = true
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

// 處理實際支出資料
const processExpenseData = (expenses) => {
  const channelMap = new Map()
  
  // 遍歷所有費用記錄
  expenses.forEach(expense => {
    const channelId = expense.channel._id
    const platformId = expense.platform._id
    const month = new Date(expense.invoiceDate).getMonth()
    const monthKey = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month]

    // 初始化渠道
    if (!channelMap.has(channelId)) {
      channelMap.set(channelId, {
        channelName: expense.channel.name,
        platforms: new Map()
      })
    }

    const channel = channelMap.get(channelId)
    
    // 初始化平台
    if (!channel.platforms.has(platformId)) {
      channel.platforms.set(platformId, {
        platformName: expense.platform.name,
        expense: {
          JAN: 0, FEB: 0, MAR: 0, APR: 0, MAY: 0, JUN: 0,
          JUL: 0, AUG: 0, SEP: 0, OCT: 0, NOV: 0, DEC: 0
        }
      })
    }

    // 將該筆費用加到對應月份
    const totalAmount = expense.details.reduce((sum, detail) => sum + detail.amount, 0)
    channel.platforms.get(platformId).expense[monthKey] += totalAmount
  })

  // 轉換成陣列格  
  return Array.from(channelMap.values()).map(channel => ({
    channelName: channel.channelName,
    platforms: Array.from(channel.platforms.values())
  }))
}

// 格式化月份數值
const formatMonthValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return ''
  }
  return value.toLocaleString('en-US')
}

// 格式化季度數值
const formatQuarterValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-'
  }
  return value.toLocaleString('en-US')
}

// 計算季度總額
const getQuarterTotal = (budget, quarter) => {
  const quarterMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }

  const total = quarterMap[quarter].reduce((sum, month) => sum + (budget[month] || 0), 0)
  return formatQuarterValue(total)
}

// 計算平台總額
const getPlatformTotal = (budget) => {
  return Object.values(budget).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算月度總額
const getMonthlyTotal = (month) => {
  let total = 0
  if (searchForm.value.reportType === 'expense') {
    total = reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.expense[month] || 0)
      }, 0)
    }, 0)
  } else {
    total = reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + (platform.budget[month] || 0)
      }, 0)
    }, 0)
  }
  return formatMonthValue(total)
}

// 計算季度總額
const getQuarterlyTotal = (quarter) => {
  const monthMap = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }

  const total = monthMap[quarter].reduce((sum, month) => {
    const monthTotal = getMonthlyTotal(month)
    return sum + (monthTotal === '' ? 0 : parseFloat(monthTotal.replace(/,/g, '')))
  }, 0)
  
  return formatQuarterValue(total)
}

// 計算總額
const getGrandTotal = () => {
  if (searchForm.value.reportType === 'expense') {
    return reportData.value.reduce((sum, channel) => {
      return sum + channel.platforms.reduce((platformSum, platform) => {
        return platformSum + Object.values(platform.expense).reduce((total, value) => total + value, 0)
      }, 0)
    }, 0)
  }
  // 原有的預算表計算邏輯
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformTotal(platform.budget)
    }, 0)
  }, 0)
}

// 匯出 Excel
const loadXLSX = async () => {
  if (window.XLSX) return window.XLSX
  
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  
  return window.XLSX
}

const exportToExcel = async () => {
  try {
    isExporting.value = true
    const XLSX = await loadXLSX()
    
    // 建立工作表，修改標題格式
    const title = `${searchForm.value.year}年度 ${getThemeName(searchForm.value.theme)} ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}${searchForm.value.reportType === 'lineExpense' ? ` (${searchForm.value.month}月)` : ''}`
    
    const ws = XLSX.utils.aoa_to_sheet([
      [title],
      []
    ])

    // 根據報表類型設定不同的表頭和格式
    if (searchForm.value.reportType === 'comparison') {
      // 比較表的表頭
      XLSX.utils.sheet_add_aoa(ws, [
        ['廣告渠道', '平台',
          'JAN', '', '', 'FEB', '', '', 'MAR', '', '', 'Q1', '', '',
          'APR', '', '', 'MAY', '', '', 'JUN', '', '', 'Q2', '', '',
          'JUL', '', '', 'AUG', '', '', 'SEP', '', '', 'Q3', '', '',
          'OCT', '', '', 'NOV', '', '', 'DEC', '', '', 'Q4', '', '',
          'Total', '', ''],
        ['', '',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異', '預算', '實際', '差異',
          '預算', '實際', '差異']
      ], { origin: 'A3' })

      // 設定欄寬
      ws['!cols'] = [
        { wch: 15 }, // 廣告渠道
        { wch: 15 }, // 平台
        ...Array(48).fill({ wch: 12 }) // 其他欄位
      ]

      // 設定標題合併儲存格
      ws['!merges'] = [
        // 標題合併
        { s: { r: 0, c: 0 }, e: { r: 0, c: 50 } },
        // 月份標題合併
        { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } },   // JAN
        { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } },   // FEB
        { s: { r: 2, c: 8 }, e: { r: 2, c: 10 } },  // MAR
        { s: { r: 2, c: 11 }, e: { r: 2, c: 13 } }, // Q1
        { s: { r: 2, c: 14 }, e: { r: 2, c: 16 } }, // APR
        { s: { r: 2, c: 17 }, e: { r: 2, c: 19 } }, // MAY
        { s: { r: 2, c: 20 }, e: { r: 2, c: 22 } }, // JUN
        { s: { r: 2, c: 23 }, e: { r: 2, c: 25 } }, // Q2
        { s: { r: 2, c: 26 }, e: { r: 2, c: 28 } }, // JUL
        { s: { r: 2, c: 29 }, e: { r: 2, c: 31 } }, // AUG
        { s: { r: 2, c: 32 }, e: { r: 2, c: 34 } }, // SEP
        { s: { r: 2, c: 35 }, e: { r: 2, c: 37 } }, // Q3
        { s: { r: 2, c: 38 }, e: { r: 2, c: 40 } }, // OCT
        { s: { r: 2, c: 41 }, e: { r: 2, c: 43 } }, // NOV
        { s: { r: 2, c: 44 }, e: { r: 2, c: 46 } }, // DEC
        { s: { r: 2, c: 47 }, e: { r: 2, c: 49 } }, // Q4
        { s: { r: 2, c: 50 }, e: { r: 2, c: 52 } }  // Total
      ]
    } else if (searchForm.value.reportType === 'lineExpense') {
      // 行銷各線實際支出表的表頭
      const headers = ['平台 / 線別']
      searchForm.value.line.forEach(lineId => {
        headers.push(getLineName(lineId))
      })
      headers.push('Total')

      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' })

      // 設定欄寬
      ws['!cols'] = [
        { wch: 20 }, // 平台欄位
        ...Array(searchForm.value.line.length).fill({ wch: 15 }), // 線別欄位
        { wch: 15 } // Total 欄位
      ]

      // 設定標題合併儲存格
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ]

      // 添加數據行
      reportData.value.forEach(platform => {
        const row = [platform.platformName]
        searchForm.value.line.forEach(lineId => {
          row.push(platform.expenses[getLineName(lineId)] || 0)
        })
        row.push(platform.total || 0)
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 })
      })

      // 添加總計列
      const totalRow = ['總計']
      searchForm.value.line.forEach(lineId => {
        const lineTotal = reportData.value.reduce((sum, platform) => {
          return sum + (platform.expenses[getLineName(lineId)] || 0)
        }, 0)
        totalRow.push(lineTotal)
      })
      // 添加最終總計
      const finalTotal = reportData.value.reduce((sum, platform) => sum + (Number(platform.total) || 0), 0)
      totalRow.push(finalTotal)
      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 })
    } else {
      // 預算表或實際支出表的表頭
      XLSX.utils.sheet_add_aoa(ws, [
        ['廣告渠道', '平台', 'JAN', 'FEB', 'MAR', 'Q1', 'APR', 'MAY', 'JUN', 'Q2', 'JUL', 'AUG', 'SEP', 'Q3', 'OCT', 'NOV', 'DEC', 'Q4', 'Total']
      ], { origin: 'A3' })

      // 預算表和實際支出表的欄寬
      ws['!cols'] = [
        { wch: 15 },  // 廣告渠道
        { wch: 15 },  // 平台
        { wch: 12 },  // JAN
        { wch: 12 },  // FEB
        { wch: 12 },  // MAR
        { wch: 12 },  // Q1
        { wch: 12 },  // APR
        { wch: 12 },  // MAY
        { wch: 12 },  // JUN
        { wch: 12 },  // Q2
        { wch: 12 },  // JUL
        { wch: 12 },  // AUG
        { wch: 12 },  // SEP
        { wch: 12 },  // Q3
        { wch: 12 },  // OCT
        { wch: 12 },  // NOV
        { wch: 12 },  // DEC
        { wch: 12 },  // Q4
        { wch: 15 }   // Total
      ]

      // 預算表和實際支出表的標題合併儲存格
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }]
    }

    ws.A1.s = { alignment: { horizontal: 'center' }, font: { bold: true, sz: 14 } }

    // 添加數據行
    let currentRow = searchForm.value.reportType === 'comparison' ? 4 : 3

    if (searchForm.value.reportType !== 'lineExpense') {
      reportData.value.forEach(channel => {
        const platformCount = channel.platforms.length
        
        channel.platforms.forEach((platform, index) => {
          let row
          if (searchForm.value.reportType === 'comparison') {
            row = [
              index === 0 ? channel.channelName : '',
              platform.platformName,
              platform.budget?.JAN || 0,
              platform.expense?.JAN || 0,
              platform.difference?.JAN || 0,
              platform.budget?.FEB || 0,
              platform.expense?.FEB || 0,
              platform.difference?.FEB || 0,
              platform.budget?.MAR || 0,
              platform.expense?.MAR || 0,
              platform.difference?.MAR || 0,
              getPlatformQuarterlyBudget(platform, 1),
              getPlatformQuarterlyExpense(platform, 1),
              getPlatformQuarterlyDifference(platform, 1),
              platform.budget?.APR || 0,
              platform.expense?.APR || 0,
              platform.difference?.APR || 0,
              platform.budget?.MAY || 0,
              platform.expense?.MAY || 0,
              platform.difference?.MAY || 0,
              platform.budget?.JUN || 0,
              platform.expense?.JUN || 0,
              platform.difference?.JUN || 0,
              getPlatformQuarterlyBudget(platform, 2),
              getPlatformQuarterlyExpense(platform, 2),
              getPlatformQuarterlyDifference(platform, 2),
              platform.budget?.JUL || 0,
              platform.expense?.JUL || 0,
              platform.difference?.JUL || 0,
              platform.budget?.AUG || 0,
              platform.expense?.AUG || 0,
              platform.difference?.AUG || 0,
              platform.budget?.SEP || 0,
              platform.expense?.SEP || 0,
              platform.difference?.SEP || 0,
              getPlatformQuarterlyBudget(platform, 3),
              getPlatformQuarterlyExpense(platform, 3),
              getPlatformQuarterlyDifference(platform, 3),
              platform.budget?.OCT || 0,
              platform.expense?.OCT || 0,
              platform.difference?.OCT || 0,
              platform.budget?.NOV || 0,
              platform.expense?.NOV || 0,
              platform.difference?.NOV || 0,
              platform.budget?.DEC || 0,
              platform.expense?.DEC || 0,
              platform.difference?.DEC || 0,
              getPlatformQuarterlyBudget(platform, 4),
              getPlatformQuarterlyExpense(platform, 4),
              getPlatformQuarterlyDifference(platform, 4),
              getPlatformBudgetTotal(platform.budget),
              getPlatformExpenseTotal(platform.expense),
              getPlatformDifference(platform)
            ]
          } else {
            const monthlyData = searchForm.value.reportType === 'expense' ? platform.expense : platform.budget
            row = [
              index === 0 ? channel.channelName : '',
              platform.platformName,
              monthlyData.JAN || 0,
              monthlyData.FEB || 0,
              monthlyData.MAR || 0,
              getQuarterTotal(monthlyData, 1),
              monthlyData.APR || 0,
              monthlyData.MAY || 0,
              monthlyData.JUN || 0,
              getQuarterTotal(monthlyData, 2),
              monthlyData.JUL || 0,
              monthlyData.AUG || 0,
              monthlyData.SEP || 0,
              getQuarterTotal(monthlyData, 3),
              monthlyData.OCT || 0,
              monthlyData.NOV || 0,
              monthlyData.DEC || 0,
              getQuarterTotal(monthlyData, 4),
              getPlatformTotal(monthlyData)
            ]
          }

          XLSX.utils.sheet_add_json(ws, [row], { skipHeader: true, origin: -1 })
          
          if (index === 0 && platformCount > 1) {
            ws['!merges'].push({
              s: { r: currentRow, c: 0 },
              e: { r: currentRow + platformCount - 1, c: 0 }
            })
          }
          currentRow++
        })
      })

      // 添加月度總計列
      const totalRow = searchForm.value.reportType === 'comparison'
        ? [
            '月度總計', '',
            getMonthlyBudgetTotal('JAN'),
            getMonthlyExpenseTotal('JAN'),
            getMonthlyDifferenceTotal('JAN'),
            getMonthlyBudgetTotal('FEB'),
            getMonthlyExpenseTotal('FEB'),
            getMonthlyDifferenceTotal('FEB'),
            getMonthlyBudgetTotal('MAR'),
            getMonthlyExpenseTotal('MAR'),
            getMonthlyDifferenceTotal('MAR'),
            getQuarterlyBudgetTotal(1),
            getQuarterlyExpenseTotal(1),
            getQuarterlyDifferenceTotal(1),
            getMonthlyBudgetTotal('APR'),
            getMonthlyExpenseTotal('APR'),
            getMonthlyDifferenceTotal('APR'),
            getMonthlyBudgetTotal('MAY'),
            getMonthlyExpenseTotal('MAY'),
            getMonthlyDifferenceTotal('MAY'),
            getMonthlyBudgetTotal('JUN'),
            getMonthlyExpenseTotal('JUN'),
            getMonthlyDifferenceTotal('JUN'),
            getQuarterlyBudgetTotal(2),
            getQuarterlyExpenseTotal(2),
            getQuarterlyDifferenceTotal(2),
            getMonthlyBudgetTotal('JUL'),
            getMonthlyExpenseTotal('JUL'),
            getMonthlyDifferenceTotal('JUL'),
            getMonthlyBudgetTotal('AUG'),
            getMonthlyExpenseTotal('AUG'),
            getMonthlyDifferenceTotal('AUG'),
            getMonthlyBudgetTotal('SEP'),
            getMonthlyExpenseTotal('SEP'),
            getMonthlyDifferenceTotal('SEP'),
            getQuarterlyBudgetTotal(3),
            getQuarterlyExpenseTotal(3),
            getQuarterlyDifferenceTotal(3),
            getMonthlyBudgetTotal('OCT'),
            getMonthlyExpenseTotal('OCT'),
            getMonthlyDifferenceTotal('OCT'),
            getMonthlyBudgetTotal('NOV'),
            getMonthlyExpenseTotal('NOV'),
            getMonthlyDifferenceTotal('NOV'),
            getMonthlyBudgetTotal('DEC'),
            getMonthlyExpenseTotal('DEC'),
            getMonthlyDifferenceTotal('DEC'),
            getQuarterlyBudgetTotal(4),
            getQuarterlyExpenseTotal(4),
            getQuarterlyDifferenceTotal(4),
            getGrandBudgetTotal(),
            getGrandExpenseTotal(),
            getGrandDifferenceTotal()
          ]
        : [
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

      XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 })

      // 合併月度總計的前兩格
      ws['!merges'].push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: 1 }
      })
    }

    // 下載檔案
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `${searchForm.value.year}年度${getThemeName(searchForm.value.theme)}${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}.xlsx`)

    createSnackbar({ text: 'Excel 匯出成功', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (error) {
    handleError(error)
  } finally {
    isExporting.value = false
  }
}

// 修改 container 寬度設定邏輯
const getContainerWidth = () => {
  if (searchForm.value.reportType === 'comparison') {
    return '5200px'
  } else if (searchForm.value.reportType === 'lineExpense') {
    // 基本寬度 (平台欄位 + Total欄位)
    const baseWidth = 364 // 180px * 2
    // 每個線別的寬度
    const lineWidth = 182
    // 計算總寬度
    const totalWidth = baseWidth + (searchForm.value.line.length * lineWidth)
    // 確保最小寬度為 2200px
    return `${Math.max(2200, totalWidth)}px`
  } else {
    return '2200px'
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
    container.style.width = getContainerWidth()
    container.style.backgroundColor = 'white'
    container.style.padding = '20px'
    container.style.boxSizing = 'border-box'
    
    // 添加標題，修改標題格式
    const title = document.createElement('div')
    title.style.fontSize = '24px'
    title.style.fontWeight = '900'
    title.style.marginBottom = '24px'
    title.style.textAlign = 'center'
    title.style.color = '#000'
    title.innerHTML = `
      <div style="margin-bottom: 10px;">
        <span style="color: #F57C00;">${searchForm.value.year}</span>年度 
        <span style="color: #D81B60;">${getThemeName(searchForm.value.theme)}</span> 
        ${reportTypeOptions.value.find(option => option.value === searchForm.value.reportType)?.title || ''}${searchForm.value.reportType === 'lineExpense' ? ` <span style="color: #0288D1;">(${searchForm.value.month}月)</span>` : ''}
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
    if (searchForm.value.reportType === 'comparison') {
      // 特別處理比較表的表頭
      const thead = tableClone.querySelector('thead')
      const firstRow = thead.querySelector('tr:first-child')
      const secondRow = thead.querySelector('tr:last-child')
      
      // 確保第一行的廣告渠道和平台欄位正確顯示
      const channelHeader = firstRow.querySelector('th:first-child')
      const platformHeader = firstRow.querySelector('th:nth-child(2)')
      
      if (channelHeader && platformHeader) {
        channelHeader.setAttribute('rowspan', '2')
        platformHeader.setAttribute('rowspan', '2')
        channelHeader.style.backgroundColor = '#607D8B'
        platformHeader.style.backgroundColor = '#607D8B'
        channelHeader.style.position = 'relative'
        platformHeader.style.position = 'relative'
        channelHeader.style.zIndex = '2'
        platformHeader.style.zIndex = '2'
        channelHeader.style.verticalAlign = 'middle'
        platformHeader.style.verticalAlign = 'middle'
        channelHeader.style.height = '86px'
        platformHeader.style.height = '86px'
      }

      // 調整所有 sub-header-cell 的樣式
      const subHeaderCells = secondRow.querySelectorAll('.sub-header-cell, .sub-header-cell-quarter')
      subHeaderCells.forEach(cell => {
        cell.style.backgroundColor = cell.classList.contains('sub-header-cell-quarter') ? '#00ACC1' : '#607D8B'
        cell.style.color = 'white'
        cell.style.padding = '8px'
        cell.style.fontSize = '12px'
        cell.style.fontWeight = '600'
        cell.style.whiteSpace = 'nowrap'
        cell.style.borderRight = '1px solid rgba(255, 255, 255, 0.3)'
        cell.style.borderBottom = '1px solid #666'
        cell.style.minWidth = '80px'
      })
    }

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
      cell.style.verticalAlign = 'middle'
      cell.style.fontWeight = 'bold'
      cell.style.borderRight = '1px solid #666'
      cell.style.position = 'relative'
    })

    // 修改平台欄位寬度
    const platformCells = tableClone.querySelectorAll('.platform-col')
    platformCells.forEach(cell => {
      cell.style.backgroundColor = '#f8f9fa'
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
        cell.style.minWidth = '100px'
      } else if (cell.classList.contains('total-col')) {
        cell.style.backgroundColor = '#e2e2e2'
        cell.style.fontWeight = 'bold'
        cell.style.minWidth = '140px'
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
        scale: 4,
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
      createSnackbar({ text: 'PDF 匯出成功', snackbarProps: { color: 'teal-lighten-1' } })
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

const processBudgetData = (data) => {
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

// 處理預算與實際支出比較資料
const processComparisonData = (budgetData, expenseData) => {
  const channelMap = new Map()

  // 先處理預算資料
  budgetData.forEach(channel => {
    if (!channelMap.has(channel.channelName)) {
      channelMap.set(channel.channelName, {
        channelName: channel.channelName,
        platforms: new Map()
      })
    }

    channel.platforms.forEach(platform => {
      const platformMap = channelMap.get(channel.channelName).platforms
      if (!platformMap.has(platform.platformName)) {
        platformMap.set(platform.platformName, {
          platformName: platform.platformName,
          budget: platform.budget || null,
          expense: null,
          hasBudget: true,
          hasExpense: false
        })
      }
    })
  })

  // 處理實際支出資料
  expenseData.forEach(channel => {
    if (!channelMap.has(channel.channelName)) {
      channelMap.set(channel.channelName, {
        channelName: channel.channelName,
        platforms: new Map()
      })
    }

    channel.platforms.forEach(platform => {
      const platformMap = channelMap.get(channel.channelName).platforms
      if (!platformMap.has(platform.platformName)) {
        platformMap.set(platform.platformName, {
          platformName: platform.platformName,
          budget: null,
          expense: platform.expense,
          hasBudget: false,
          hasExpense: true
        })
      } else {
        const existingPlatform = platformMap.get(platform.platformName)
        existingPlatform.expense = platform.expense
        existingPlatform.hasExpense = true
      }
    })
  })

  // 計算差異並轉換成陣列格式
  return Array.from(channelMap.values()).map(channel => ({
    channelName: channel.channelName,
    platforms: Array.from(channel.platforms.values()).map(platform => ({
      ...platform,
      difference: {
        JAN: (platform.budget?.JAN || 0) - (platform.expense?.JAN || 0),
        FEB: (platform.budget?.FEB || 0) - (platform.expense?.FEB || 0),
        MAR: (platform.budget?.MAR || 0) - (platform.expense?.MAR || 0),
        APR: (platform.budget?.APR || 0) - (platform.expense?.APR || 0),
        MAY: (platform.budget?.MAY || 0) - (platform.expense?.MAY || 0),
        JUN: (platform.budget?.JUN || 0) - (platform.expense?.JUN || 0),
        JUL: (platform.budget?.JUL || 0) - (platform.expense?.JUL || 0),
        AUG: (platform.budget?.AUG || 0) - (platform.expense?.AUG || 0),
        SEP: (platform.budget?.SEP || 0) - (platform.expense?.SEP || 0),
        OCT: (platform.budget?.OCT || 0) - (platform.expense?.OCT || 0),
        NOV: (platform.budget?.NOV || 0) - (platform.expense?.NOV || 0),
        DEC: (platform.budget?.DEC || 0) - (platform.expense?.DEC || 0)
      }
    }))
  }))
}

// 取  差異值的樣式類別
const getDifferenceClass = (value) => {
  return {
    'month-col': true,
    'difference-positive': value > 0,
    'difference-negative': value < 0
  }
}

// 計算月度預算總額
const getMonthlyBudgetTotal = (month) => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (platform.budget?.[month] || 0)
    }, 0)
  }, 0)
}

// 計算月度實際支出總額
const getMonthlyExpenseTotal = (month) => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + (platform.expense?.[month] || 0)
    }, 0)
  }, 0)
}

// 計算月度差異總額
const getMonthlyDifferenceTotal = (month) => {
  return getMonthlyBudgetTotal(month) - getMonthlyExpenseTotal(month)
}

// 計算季度預算總額
const getQuarterlyBudgetTotal = (quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + getMonthlyBudgetTotal(month), 0)
}

// 計算季度實際支出總額
const getQuarterlyExpenseTotal = (quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + getMonthlyExpenseTotal(month), 0)
}

// 計算季度差異總額
const getQuarterlyDifferenceTotal = (quarter) => {
  return getQuarterlyBudgetTotal(quarter) - getQuarterlyExpenseTotal(quarter)
}

// 計算平台總預算
const getPlatformBudgetTotal = (budget) => {
  if (!budget) return 0
  return Object.values(budget).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算平台總實際支出
const getPlatformExpenseTotal = (expense) => {
  if (!expense) return 0
  return Object.values(expense).reduce((sum, value) => sum + (value || 0), 0)
}

// 計算平台總差異
const getPlatformDifference = (platform) => {
  return getPlatformBudgetTotal(platform.budget) - getPlatformExpenseTotal(platform.expense)
}

// 計算年度總預算
const getGrandBudgetTotal = () => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformBudgetTotal(platform.budget)
    }, 0)
  }, 0)
}

// 計算年度總實際支出
const getGrandExpenseTotal = () => {
  return reportData.value.reduce((sum, channel) => {
    return sum + channel.platforms.reduce((platformSum, platform) => {
      return platformSum + getPlatformExpenseTotal(platform.expense)
    }, 0)
  }, 0)
}

// 計算年度總差異
const getGrandDifferenceTotal = () => {
  return getGrandBudgetTotal() - getGrandExpenseTotal()
}

// 計算單一平台的季度預算總額
const getPlatformQuarterlyBudget = (platform, quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + (platform.budget?.[month] || 0), 0)
}

// 計算單一平台的季度實際支出總額
const getPlatformQuarterlyExpense = (platform, quarter) => {
  const months = {
    1: ['JAN', 'FEB', 'MAR'],
    2: ['APR', 'MAY', 'JUN'],
    3: ['JUL', 'AUG', 'SEP'],
    4: ['OCT', 'NOV', 'DEC']
  }[quarter]

  return months.reduce((sum, month) => sum + (platform.expense?.[month] || 0), 0)
}

// 計算單一平台的季度差異
const getPlatformQuarterlyDifference = (platform, quarter) => {
  return getPlatformQuarterlyBudget(platform, quarter) - getPlatformQuarterlyExpense(platform, quarter)
}

const getLineName = (lineId) => {
  if (typeof lineId === 'string') {
    const line = lineOptions.value.find(l => l._id === lineId)
    return line ? line.name : lineId
  }
  return lineId?.name || ''
}

// 定義 processLineExpenseData 函數
const processLineExpenseData = (data) => {
  // 過濾掉 Total 平台的數據，因為它是總計
  return data.filter(item => item.platformName !== 'Total').map(item => ({
    platformName: item.platformName,
    expenses: item.expenses,
    total: item.total || Object.values(item.expenses).reduce((sum, value) => sum + (value || 0), 0)
  }))
}

// 確保線別 ID 是有效的 ObjectId 格式
const validObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id)

// 在 script setup 中添加 selectAllLines 函數
const selectAllLines = () => {
  if (searchForm.value.line.length === lineOptions.value.length) {
    searchForm.value.line = []
  } else {
    searchForm.value.line = lineOptions.value.map(line => line._id)
  }
  handleLineChange()
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
  border: 1px solid #666;
  border-radius: 8px;
  border-spacing: 0;
  border-collapse: separate;
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
          min-width: 140px;

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

.comparison-table {
  :deep(thead) {
    .header-row {
      .header-cell {
        &-quarter {
          background-color: #00ACC1 !important;
        }
      }
    }

    .sub-header-cell {
      padding: 8px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      border-bottom: 1px solid #666;
      background-color: #607D8B;
      color: white;
      min-width: 80px;

      &-quarter {
        @extend .sub-header-cell;
        background-color: #00ACC1;
      }
    }
  }

  .difference-positive {
    color: #2E7D32;  // 綠色
    font-weight: 600;
  }

  .difference-negative {
    color: #D32F2F;  // 紅色
    font-weight: 600;
  }

  :deep(tbody) {
    tr {
      td.quarter-col {
        background-color: #FFE0B2 !important;  // 使用與原本相同的橘色

        &.difference-positive,
        &.difference-negative {
          background-color: #FFE0B2 !important;  // 使用與原本相同的橘色
        }
      }

      // 月度總計列的季度欄位
      &.monthly-total-row {
        td.quarter-col {
          background-color: #FFE0B2 !important;
        }
      }
    }
  }
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
  position: relative;
}

.sticky-buttons {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
  padding: 8px 0;
}

// .v-autocomplete  {
//   :deep(.v-field__input){
//     min-width: 100vw !important;
//     overflow: hidden;
//   }

  
// }


</style>
