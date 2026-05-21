'use client';

import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Calculator, TrendingUp, DollarSign, Percent, RotateCcw, Save, FolderOpen } from 'lucide-react';
import { useIRRStore } from '@/lib/store';
import { calculateResults } from '@/lib/irr-calculator';

export default function IRRCalculator() {
  // 从 Zustand store 获取状态和方法
  const {
    capitalCostRate,
    cardFeeRate,
    scenicReturnTimes,
    channels,
    monthlyData,
    setCapitalCostRate,
    setCardFeeRate,
    setScenicReturnTimes,
    updateChannel,
    updateMonthData,
    addMonth,
    removeMonth,
    reset,
    loadFromStorage,
    saveToStorage,
    initialize,
  } = useIRRStore();

  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 使用提取的计算函数
  const calculatedResults = useMemo(() => {
    return calculateResults(
      monthlyData,
      channels,
      capitalCostRate,
      scenicReturnTimes,
      cardFeeRate
    );
  }, [monthlyData, channels, capitalCostRate, scenicReturnTimes, cardFeeRate]);

  const handleSave = () => {
    if (saveToStorage()) {
      alert('保存成功！');
    } else {
      alert('保存失败！');
    }
  };

  const handleLoad = () => {
    if (loadFromStorage()) {
      alert('加载成功！');
    } else {
      alert('没有找到已保存的数据');
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？')) {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IRR 计算器
            </h1>
            <p className="text-slate-600 mt-1">内部收益率智能计算工具</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLoad} variant="outline" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              加载
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              保存
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>
        </div>

        {/* 计算结果展示 - 置顶 */}
        <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              计算结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 第一行：总投入、票面毛利、累计现金流 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-xl text-center border-2 border-purple-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">总投入</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {monthlyData.reduce((sum, m) => sum + m.investment, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-5 bg-white rounded-xl text-center border-2 border-pink-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">票面毛利</p>
                <p className="text-2xl font-bold text-pink-600 mt-1">
                  {calculatedResults.ticketProfit.toFixed(2)}
                </p>
              </div>
              <div className="p-5 bg-white rounded-xl text-center border-2 border-green-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">累计现金流</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {calculatedResults.cumulativeCashFlow.length > 0
                    ? calculatedResults.cumulativeCashFlow[calculatedResults.cumulativeCashFlow.length - 1].toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
            {/* 第二行：年化收益率、票面毛利率、净利率 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-xl text-center border-2 border-blue-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">年化收益率</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {calculatedResults.annualizedReturn.toFixed(2)}%
                </p>
              </div>
              <div className="p-5 bg-white rounded-xl text-center border-2 border-orange-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">票面毛利率</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {calculatedResults.ticketProfitRate.toFixed(2)}%
                </p>
              </div>
              <div className="p-5 bg-white rounded-xl text-center border-2 border-teal-200 shadow-md">
                <p className="text-sm text-slate-600 font-medium">净利率</p>
                <p className="text-2xl font-bold text-teal-600 mt-1">
                  {calculatedResults.netRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="params" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="params">参数配置</TabsTrigger>
            <TabsTrigger value="channels">渠道配置</TabsTrigger>
            <TabsTrigger value="data">月度数据</TabsTrigger>
          </TabsList>

          {/* 参数配置 */}
          <TabsContent value="params">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>基础参数配置</CardTitle>
                <CardDescription>设置资金成本、费率等基础参数（所有值均可修改）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 费率配置 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    费率配置
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capitalCostRate">资金占用成本（费率）</Label>
                      <div className="relative">
                        <Input
                          id="capitalCostRate"
                          type="number"
                          step="0.01"
                          value={capitalCostRate}
                          onChange={(e) => setCapitalCostRate(parseFloat(e.target.value) || 0)}
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500">默认: 6%</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardFeeRate">卡费+投放（费率）</Label>
                      <div className="relative">
                        <Input
                          id="cardFeeRate"
                          type="number"
                          step="0.01"
                          value={cardFeeRate}
                          onChange={(e) => setCardFeeRate(parseFloat(e.target.value) || 0)}
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500">默认: 4.20%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 景区配置 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    景区配置
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scenicReturnTimes">景区渠道月回款次数</Label>
                      <Input
                        id="scenicReturnTimes"
                        type="number"
                        value={scenicReturnTimes}
                        onChange={(e) => setScenicReturnTimes(parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-slate-500">默认: 2次/月</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 渠道配置 */}
          <TabsContent value="channels">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>渠道配置</CardTitle>
                <CardDescription>配置各渠道的毛利率和产量占比，系统将根据这些参数自动计算各渠道毛利</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {channels.map((channel, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold">{channel.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>毛利率 (%)</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.profitRate}
                              onChange={(e) => updateChannel(index, 'profitRate', e.target.value)}
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>产量占比 (%)</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.outputRatio}
                              onChange={(e) => updateChannel(index, 'outputRatio', e.target.value)}
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {(() => {
                    const totalRatio = channels.reduce((sum, c) => sum + c.outputRatio, 0);
                    const isValid = totalRatio === 100;
                    return (
                      <div className={`flex items-center justify-between p-4 rounded-lg ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">总产量占比</span>
                          {!isValid && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              占比总和必须为100%
                            </span>
                          )}
                        </div>
                        <span className={`text-lg font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {totalRatio}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 月度数据 */}
          <TabsContent value="data">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>月度现金流数据</CardTitle>
                  <CardDescription>
                    填写每月的投入和回款数据，各渠道毛利将根据渠道配置自动计算
                  </CardDescription>
                </div>
                <Button onClick={addMonth} className="gap-2">
                  <Plus className="h-4 w-4" />
                  添加月份
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="font-bold">日期</TableHead>
                        <TableHead className="font-bold">投入</TableHead>
                        <TableHead className="font-bold">预计单月回款</TableHead>
                        <TableHead className="font-bold">景区渠道毛利</TableHead>
                        <TableHead className="font-bold">票机渠道毛利</TableHead>
                        <TableHead className="font-bold">Trip线上毛利</TableHead>
                        <TableHead className="font-bold">Trip线下毛利</TableHead>
                        <TableHead className="font-bold">新客价值</TableHead>
                        <TableHead className="font-bold">其他收益</TableHead>
                        <TableHead className="font-bold">GT成本</TableHead>
                        <TableHead className="font-bold">卡费+投放</TableHead>
                        <TableHead className="bg-green-100 font-bold">当期现金流</TableHead>
                        <TableHead className="bg-blue-100 font-bold">累计现金流</TableHead>
                        <TableHead className="bg-orange-100 font-bold">累计资占</TableHead>
                        <TableHead className="font-bold">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((month, index) => (
                        <TableRow key={month.id} className="hover:bg-slate-50">
                          <TableCell>
                            <Input
                              type="month"
                              value={month.date}
                              onChange={(e) => updateMonthData(month.id, 'date', e.target.value)}
                              className="w-[140px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={month.investment}
                              onChange={(e) => updateMonthData(month.id, 'investment', e.target.value)}
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={month.monthlyReturn}
                              onChange={(e) => updateMonthData(month.id, 'monthlyReturn', e.target.value)}
                              className="w-[100px]"
                            />
                          </TableCell>
                          {/* 自动计算的各渠道毛利 - 只读显示 */}
                          <TableCell className="bg-yellow-50 text-yellow-700 font-medium">
                            {calculatedResults.channelProfits[index]?.[0]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-yellow-50 text-yellow-700 font-medium">
                            {calculatedResults.channelProfits[index]?.[1]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-yellow-50 text-yellow-700 font-medium">
                            {calculatedResults.channelProfits[index]?.[2]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-yellow-50 text-yellow-700 font-medium">
                            {calculatedResults.channelProfits[index]?.[3]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={month.newCustomerValue}
                              onChange={(e) => updateMonthData(month.id, 'newCustomerValue', e.target.value)}
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={month.otherIncome}
                              onChange={(e) => updateMonthData(month.id, 'otherIncome', e.target.value)}
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={month.gtCost}
                              onChange={(e) => updateMonthData(month.id, 'gtCost', e.target.value)}
                              className="w-[100px]"
                            />
                          </TableCell>
                          <TableCell className="bg-red-50 text-red-700 font-medium">
                            {calculatedResults.cardFees[index]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-green-50 font-medium text-green-600">
                            {calculatedResults.cashFlows[index]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-blue-50 font-medium text-blue-600">
                            {calculatedResults.cumulativeCashFlow[index]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell className="bg-orange-50 font-medium text-orange-600">
                            {calculatedResults.cumulativeCapital[index]?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMonth(month.id)}
                              disabled={monthlyData.length === 1}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Formula Explanation */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">计算公式说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>各渠道毛利计算公式：</strong></p>
              <p className="mb-1">毛利 = 预计单月回款 × (产量占比 / 100) × (毛利率 / 100) / (1 - 毛利率 / 100)</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>票面毛利率计算公式：</strong></p>
              <p>票面毛利率 = 票面毛利 / (票面毛利 + 总投入) × 100%</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>卡费+投放计算公式（自动计算）：</strong></p>
              <p>卡费+投放 = 预计单月回款 × (票机渠道占比 + Trip线上渠道占比) / 100 × (-卡费+投放费率 / 100)</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>累计资占计算公式：</strong></p>
              <p>累计资占 = 累计现金流 × (-资金成本费率) / 12 / 景区渠道月回款次数</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>现金流计算公式：</strong></p>
              <p>当期现金流 = -投入 + 预计单月回款 + 各渠道毛利之和 + 新客价值 + 其他收益 + GT成本 + 卡费+投放</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs">
              <p className="mb-2"><strong>XIRR年化收益率计算公式：</strong></p>
              <p>NPV = Σ (CFt / (1+r)^((dt - d0) / 365)) = 0</p>
              <p className="mt-2 text-slate-500">其中 CFt 为第 t 期现金流，dt 为对应日期，d0 为基准日期</p>
              <p className="mt-1 text-slate-500">XIRR 考虑实际日期间隔，计算结果即为年化收益率</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
