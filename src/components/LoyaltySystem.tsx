import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, TrendingUp, Users, Plus, Star, ArrowLeft, X, Download, UserPlus, BarChart3, Smartphone, Copy, QrCode, Eye, Trash2, Edit } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  cardNumber: string;
  cardColor: string;
  textColor: string;
  joinDate: string;
  lastActivity: string;
  totalSpent: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  image?: string;
  active: boolean;
}

interface AddCustomerModalProps {
  onClose: () => void;
  newCustomer: any;
  setNewCustomer: React.Dispatch<React.SetStateAction<any>>;
  storeSettings: any;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  generateCardNumber: () => string;
  getCustomerLevel: (points: number) => 'bronze' | 'silver' | 'gold' | 'platinum';
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  onClose,
  newCustomer,
  setNewCustomer,
  storeSettings,
  customers,
  setCustomers,
  generateCardNumber,
  getCustomerLevel
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">إضافة عميل جديد</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="أدخل اسم العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="+966501234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النقاط الأولية</label>
              <input
                type="number"
                value={newCustomer.initialPoints}
                onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, initialPoints: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لون البطاقة</label>
                <input
                  type="color"
                  value={newCustomer.cardColor}
                  onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, cardColor: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لون النص</label>
                <input
                  type="color"
                  value={newCustomer.textColor}
                  onChange={(e) => setNewCustomer((prev: any) => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Card Preview */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">معاينة البطاقة</h4>
            <div
              className="w-full h-48 rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ backgroundColor: newCustomer.cardColor, color: newCustomer.textColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="text-lg font-bold">{storeSettings.storeName}</h5>
                    <p className="text-sm opacity-80">Powered by Servly</p>
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-sm opacity-80 mb-1">اسم العميل</p>
                  <p className="font-bold">{newCustomer.name || 'اسم العميل'}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-sm opacity-80">النقاط</p>
                    <p className="text-xl font-bold">{newCustomer.initialPoints}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-60">رقم البطاقة</p>
                    <p className="text-sm font-mono">{generateCardNumber()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (newCustomer.name && newCustomer.email && newCustomer.phone) {
                const customer: Customer = {
                  id: (customers.length + 1).toString(),
                  name: newCustomer.name,
                  email: newCustomer.email,
                  phone: newCustomer.phone,
                  points: newCustomer.initialPoints,
                  level: getCustomerLevel(newCustomer.initialPoints),
                  cardNumber: generateCardNumber(),
                  cardColor: newCustomer.cardColor,
                  textColor: newCustomer.textColor,
                  joinDate: new Date().toISOString().split('T')[0],
                  lastActivity: new Date().toISOString().split('T')[0],
                  totalSpent: newCustomer.initialPoints
                };
                setCustomers(prev => [...prev, customer]);
                setNewCustomer({ name: '', email: '', phone: '', initialPoints: 0, cardColor: '#8B5CF6', textColor: '#FFFFFF' });
                onClose();
                alert('تم إضافة العميل بنجاح!');
              } else {
                alert('يرجى ملء جميع الحقول المطلوبة');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
          >
            إضافة العميل
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface AddPointsModalProps {
  onClose: () => void;
  pointsData: any;
  setPointsData: React.Dispatch<React.SetStateAction<any>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  storeSettings: any;
  getLevelName: (level: string) => string;
  getCustomerLevel: (points: number) => 'bronze' | 'silver' | 'gold' | 'platinum';
}

const AddPointsModal: React.FC<AddPointsModalProps> = ({
  onClose,
  pointsData,
  setPointsData,
  customers,
  setCustomers,
  storeSettings,
  getLevelName,
  getCustomerLevel
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">إضافة نقاط</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر العميل</label>
            <select
              value={pointsData.customerId}
              onChange={(e) => setPointsData((prev: any) => ({ ...prev, customerId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option value="">اختر عميل</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.points} نقطة
                </option>
              ))}
            </select>
          </div>

          {pointsData.customerId && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-bold text-purple-900 mb-2">بيانات العميل الحالية</h4>
              {(() => {
                const customer = customers.find(c => c.id === pointsData.customerId);
                return customer ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">النقاط الحالية:</span>
                      <span className="font-bold text-purple-900 mr-2">{customer.points}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">المستوى:</span>
                      <span className="font-bold text-purple-900 mr-2">{getLevelName(customer.level)}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setPointsData((prev: any) => ({ ...prev, type: 'purchase' }))}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${pointsData.type === 'purchase'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              من مبلغ الشراء
            </button>
            <button
              onClick={() => setPointsData((prev: any) => ({ ...prev, type: 'manual' }))}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${pointsData.type === 'manual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              إدخال مباشر
            </button>
          </div>

          {pointsData.type === 'purchase' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ الشراء (ريال)</label>
              <input
                type="number"
                value={pointsData.purchaseAmount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  setPointsData((prev: any) => ({
                    ...prev,
                    purchaseAmount: amount,
                    amount: amount * storeSettings.pointsPerRiyal
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="0"
              />
              <p className="text-sm text-gray-600 mt-2">
                سيحصل العميل على {pointsData.purchaseAmount * storeSettings.pointsPerRiyal} نقطة
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد النقاط</label>
              <input
                type="number"
                value={pointsData.amount}
                onChange={(e) => setPointsData((prev: any) => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="0"
              />
            </div>
          )}

          {pointsData.amount > 0 && pointsData.customerId && (
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-green-900 mb-2">معاينة العملية</h4>
              {(() => {
                const customer = customers.find(c => c.id === pointsData.customerId);
                const newPoints = (customer?.points || 0) + pointsData.amount;
                const newLevel = getCustomerLevel(newPoints);
                return (
                  <div className="text-sm space-y-1">
                    <p><span className="text-green-600">النقاط الحالية:</span> <span className="font-bold">{customer?.points || 0}</span></p>
                    <p><span className="text-green-600">النقاط المضافة:</span> <span className="font-bold">+{pointsData.amount}</span></p>
                    <p><span className="text-green-600">إجمالي النقاط:</span> <span className="font-bold">{newPoints}</span></p>
                    <p><span className="text-green-600">المستوى الجديد:</span> <span className="font-bold">{getLevelName(newLevel)}</span></p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (pointsData.customerId && pointsData.amount > 0) {
                setCustomers(prev => prev.map(customer =>
                  customer.id === pointsData.customerId
                    ? {
                      ...customer,
                      points: customer.points + pointsData.amount,
                      level: getCustomerLevel(customer.points + pointsData.amount),
                      lastActivity: new Date().toISOString().split('T')[0],
                      totalSpent: customer.totalSpent + (pointsData.type === 'purchase' ? pointsData.purchaseAmount : 0)
                    }
                    : customer
                ));
                setPointsData({ customerId: '', amount: 0, purchaseAmount: 0, type: 'purchase' });
                onClose();
                alert('تم إضافة النقاط بنجاح!');
              } else {
                alert('يرجى اختيار عميل وإدخال عدد النقاط');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
          >
            إضافة النقاط
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface RewardModalProps {
  onClose: () => void;
  selectedReward: Reward | null;
  setSelectedReward: React.Dispatch<React.SetStateAction<Reward | null>>;
  newReward: any;
  setNewReward: React.Dispatch<React.SetStateAction<any>>;
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
}

const RewardModal: React.FC<RewardModalProps> = ({
  onClose,
  selectedReward,
  setSelectedReward,
  newReward,
  setNewReward,
  rewards,
  setRewards
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedReward ? 'تعديل المكافأة' : 'إضافة مكافأة جديدة'}
          </h3>
          <button
            onClick={() => {
              onClose();
              setSelectedReward(null);
              setNewReward({ title: '', description: '', pointsRequired: 0, category: 'خصومات', image: '' });
            }}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المكافأة</label>
            <input
              type="text"
              value={selectedReward ? selectedReward.title : newReward.title}
              onChange={(e) => {
                if (selectedReward) {
                  setSelectedReward({ ...selectedReward, title: e.target.value });
                } else {
                  setNewReward((prev: any) => ({ ...prev, title: e.target.value }));
                }
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="مثال: خصم 20%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف المكافأة</label>
            <textarea
              value={selectedReward ? selectedReward.description : newReward.description}
              onChange={(e) => {
                if (selectedReward) {
                  setSelectedReward({ ...selectedReward, description: e.target.value });
                } else {
                  setNewReward((prev: any) => ({ ...prev, description: e.target.value }));
                }
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              rows={3}
              placeholder="وصف تفصيلي للمكافأة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النقاط المطلوبة</label>
              <input
                type="number"
                value={selectedReward ? selectedReward.pointsRequired : newReward.pointsRequired}
                onChange={(e) => {
                  const points = parseInt(e.target.value) || 0;
                  if (selectedReward) {
                    setSelectedReward({ ...selectedReward, pointsRequired: points });
                  } else {
                    setNewReward((prev: any) => ({ ...prev, pointsRequired: points }));
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <select
                value={selectedReward ? selectedReward.category : newReward.category}
                onChange={(e) => {
                  if (selectedReward) {
                    setSelectedReward({ ...selectedReward, category: e.target.value });
                  } else {
                    setNewReward((prev: any) => ({ ...prev, category: e.target.value }));
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="خصومات">خصومات</option>
                <option value="منتجات">منتجات</option>
                <option value="خدمات">خدمات</option>
                <option value="عروض">عروض</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (اختياري)</label>
            <input
              type="url"
              value={selectedReward ? selectedReward.image || '' : newReward.image}
              onChange={(e) => {
                if (selectedReward) {
                  setSelectedReward({ ...selectedReward, image: e.target.value });
                } else {
                  setNewReward((prev: any) => ({ ...prev, image: e.target.value }));
                }
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse mt-8">
          <button
            onClick={() => {
              onClose();
              setSelectedReward(null);
              setNewReward({ title: '', description: '', pointsRequired: 0, category: 'خصومات', image: '' });
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              const rewardData = selectedReward || newReward;
              if (rewardData.title && rewardData.description && rewardData.pointsRequired > 0) {
                if (selectedReward) {
                  setRewards(prev => prev.map(reward =>
                    reward.id === selectedReward.id ? selectedReward : reward
                  ));
                  alert('تم تحديث المكافأة بنجاح!');
                } else {
                  const reward: Reward = {
                    id: (rewards.length + 1).toString(),
                    title: newReward.title,
                    description: newReward.description,
                    pointsRequired: newReward.pointsRequired,
                    category: newReward.category,
                    image: newReward.image,
                    active: true
                  };
                  setRewards(prev => [...prev, reward]);
                  alert('تم إضافة المكافأة بنجاح!');
                }
                onClose();
                setSelectedReward(null);
                setNewReward({ title: '', description: '', pointsRequired: 0, category: 'خصومات', image: '' });
              } else {
                alert('يرجى ملء جميع الحقول المطلوبة');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
          >
            {selectedReward ? 'تحديث المكافأة' : 'إضافة المكافأة'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface ReportsModalProps {
  onClose: () => void;
  customers: Customer[];
  rewards: Reward[];
  storeSettings: any;
  getLevelColor: (level: string) => string;
  getLevelName: (level: string) => string;
}

const ReportsModal: React.FC<ReportsModalProps> = ({
  onClose,
  customers,
  rewards,
  storeSettings,
  getLevelColor,
  getLevelName
}) => {
  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const activeRewards = rewards.filter(reward => reward.active).length;
  const averagePoints = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;

  const levelDistribution = {
    bronze: customers.filter(c => c.level === 'bronze').length,
    silver: customers.filter(c => c.level === 'silver').length,
    gold: customers.filter(c => c.level === 'gold').length,
    platinum: customers.filter(c => c.level === 'platinum').length
  };

  const topCustomers = [...customers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const recentActivity = [
    { type: 'نقاط', description: 'أحمد محمد حصل على 50 نقطة', time: 'منذ ساعة' },
    { type: 'مكافأة', description: 'فاطمة علي استبدلت خصم 10%', time: 'منذ ساعتين' },
    { type: 'عميل جديد', description: 'انضم محمد سالم للبرنامج', time: 'منذ 3 ساعات' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative backdrop-blur-xl bg-white/95 rounded-3xl border border-white/20 shadow-xl p-8 max-w-6xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">التقارير الشاملة</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-blue-900">{totalCustomers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">إجمالي النقاط</p>
                  <p className="text-2xl font-bold text-purple-900">{totalPoints.toLocaleString()}</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي الإنفاق</p>
                  <p className="text-2xl font-bold text-green-900">{totalSpent.toLocaleString()} ر.س</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">المكافآت النشطة</p>
                  <p className="text-2xl font-bold text-orange-900">{activeRewards}</p>
                </div>
                <Gift className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع العملاء حسب المستوى</h4>
              <div className="space-y-3">
                {Object.entries(levelDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getLevelColor(level) }}
                      ></div>
                      <span className="font-medium">{getLevelName(level)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{count}</span>
                      <span className="text-sm text-gray-500">
                        ({totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">أفضل العملاء</h4>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-800 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{getLevelName(customer.level)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{customer.points} نقطة</p>
                      <p className="text-sm text-gray-500">{customer.totalSpent} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-gray-200 mt-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h4>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse mt-8">
            <button
              onClick={() => {
                const reportData = {
                  timestamp: new Date().toISOString(),
                  summary: {
                    totalCustomers,
                    totalPoints,
                    totalSpent,
                    activeRewards,
                    averagePoints
                  },
                  levelDistribution,
                  topCustomers,
                  customers,
                  rewards,
                  storeSettings
                };

                const dataStr = JSON.stringify(reportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `loyalty-report-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);

                alert('تم تصدير التقرير بنجاح!');
              }}
              className="px-6 py-3 bg-green-100 text-green-800 rounded-xl hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoyaltySystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'متجر الأناقة',
    description: 'أفضل متجر للأزياء العصرية',
    pointsPerRiyal: 1,
    minimumRedeem: 100,
    levels: {
      bronze: { min: 500, max: 999, name: 'برونزي', color: '#CD7F32' },
      silver: { min: 1000, max: 2999, name: 'فضي', color: '#C0C0C0' },
      gold: { min: 3000, max: 4999, name: 'ذهبي', color: '#FFD700' },
      platinum: { min: 5000, max: Infinity, name: 'بلاتيني', color: '#E5E4E2' }
    }
  });

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      points: 2500,
      level: 'silver',
      cardNumber: 'LC001234',
      cardColor: '#8B5CF6',
      textColor: '#FFFFFF',
      joinDate: '2024-01-15',
      lastActivity: '2024-01-20',
      totalSpent: 2500
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '+966507654321',
      points: 4200,
      level: 'gold',
      cardNumber: 'LC001235',
      cardColor: '#10B981',
      textColor: '#FFFFFF',
      joinDate: '2024-01-10',
      lastActivity: '2024-01-22',
      totalSpent: 4200
    }
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'خصم 10%',
      description: 'خصم 10% على جميع المنتجات',
      pointsRequired: 500,
      category: 'خصومات',
      active: true
    },
    {
      id: '2',
      title: 'شحن مجاني',
      description: 'شحن مجاني لطلبك القادم',
      pointsRequired: 200,
      category: 'خدمات',
      active: true
    }
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    initialPoints: 0,
    cardColor: '#8B5CF6',
    textColor: '#FFFFFF'
  });

  const [pointsData, setPointsData] = useState({
    customerId: '',
    amount: 0,
    purchaseAmount: 0,
    type: 'purchase' as 'purchase' | 'manual'
  });

  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    pointsRequired: 0,
    category: 'خصومات',
    image: ''
  });

  const generateCardNumber = () => {
    return 'LC' + Math.random().toString().substr(2, 6);
  };

  const getCustomerLevel = (points: number) => {
    if (points >= storeSettings.levels.platinum.min) return 'platinum';
    if (points >= storeSettings.levels.gold.min) return 'gold';
    if (points >= storeSettings.levels.silver.min) return 'silver';
    return 'bronze';
  };

  const getLevelColor = (level: string) => {
    return storeSettings.levels[level as keyof typeof storeSettings.levels]?.color || '#CD7F32';
  };

  const getLevelName = (level: string) => {
    return storeSettings.levels[level as keyof typeof storeSettings.levels]?.name || 'برونزي';
  };





  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>العودة</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">نظام نقاط الولاء</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span>إضافة عميل</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setActiveTab('customers')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-xs text-green-600 mt-1">+{customers.filter(c => new Date(c.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} هذا الشهر</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setShowAddPoints(true)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي النقاط</p>
                <p className="text-2xl font-bold text-gray-900">{customers.reduce((sum, customer) => sum + customer.points, 0).toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">متوسط {customers.length > 0 ? Math.round(customers.reduce((sum, customer) => sum + customer.points, 0) / customers.length) : 0} لكل عميل</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setActiveTab('rewards')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">المكافآت النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{rewards.filter(r => r.active).length}</p>
                <p className="text-xs text-green-600 mt-1">من أصل {rewards.length} مكافأة</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setShowReports(true)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">معدل النمو</p>
                <p className="text-2xl font-bold text-gray-900">+15.2%</p>
                <p className="text-xs text-green-600 mt-1">مقارنة بالشهر الماضي</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">الإجراءات السريعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowAddCustomer(true)}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl p-4 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-800">إضافة عميل جديد</span>
            </button>

            <button
              onClick={() => setShowAddPoints(true)}
              className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl p-4 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-800">إضافة نقاط</span>
            </button>

            <button
              onClick={() => setShowRewardModal(true)}
              className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl p-4 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-800">إنشاء مكافأة</span>
            </button>

            <button
              onClick={() => setShowReports(true)}
              className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl p-4 transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-800">عرض التقارير</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customers'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              العملاء
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rewards'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              المكافآت
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              الإعدادات
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Level Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع العملاء حسب المستوى</h4>
                    <div className="space-y-3">
                      {Object.entries(storeSettings.levels).map(([level, config]) => {
                        const count = customers.filter(c => c.level === level).length;
                        const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
                        return (
                          <div key={level} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: config.color }}
                              ></div>
                              <span className="font-medium">{config.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{count}</span>
                              <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">أفضل العملاء</h4>
                    <div className="space-y-3">
                      {customers
                        .sort((a, b) => b.points - a.points)
                        .slice(0, 5)
                        .map((customer, index) => (
                          <div key={customer.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                <span className="text-purple-800 font-bold text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-gray-500">{getLevelName(customer.level)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{customer.points} نقطة</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تم إضافة عميل جديد: {customers[customers.length - 1]?.name}</p>
                        <p className="text-xs text-gray-500">منذ دقائق</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تم إنشاء مكافأة جديدة</p>
                        <p className="text-xs text-gray-500">منذ ساعة</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">جميع العملاء</h3>
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة عميل</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {customers.map((customer) => (
                    <div key={customer.id} className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                      {/* Customer Card */}
                      <div
                        className="w-full h-32 rounded-2xl p-4 text-white relative overflow-hidden mb-4"
                        style={{ backgroundColor: customer.cardColor, color: customer.textColor }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-sm font-bold">{storeSettings.storeName}</h5>
                              <p className="text-xs opacity-80">Powered by Servly</p>
                            </div>
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                              <Gift className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs opacity-80">النقاط</p>
                              <p className="text-lg font-bold">{customer.points}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs opacity-60">{customer.cardNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getLevelColor(customer.level) }}
                            >
                              {getLevelName(customer.level)}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">انضم في</p>
                            <p className="text-sm font-medium">{new Date(customer.joinDate).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>

                        {/* Apple Wallet Card */}
                        <div className="bg-black rounded-xl p-4 text-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="w-4 h-4" />
                              <span className="text-sm font-medium">Apple Wallet</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(customer.cardNumber);
                                alert('تم نسخ رقم البطاقة!');
                              }}
                              className="p-1 hover:bg-gray-800 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-300">{customer.name}</p>
                              <p className="text-sm font-bold">{customer.points} نقطة</p>
                            </div>
                            <QrCode className="w-8 h-8 text-gray-300" />
                          </div>
                          <button className="w-full mt-3 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            إرسال إلى Apple Wallet
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => {
                              setPointsData(prev => ({ ...prev, customerId: customer.id }));
                              setShowAddPoints(true);
                            }}
                            className="px-3 py-2 bg-purple-100 text-purple-800 rounded-xl hover:bg-purple-200 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                          <button className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors text-sm">
                            <Eye className="w-4 h-4 mx-auto" />
                          </button>
                          <button className="px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors text-sm">
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">المكافآت</h3>
                  <button
                    onClick={() => setShowRewardModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مكافأة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/20 shadow-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{reward.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {reward.category}
                            </span>
                            <span className={`px-3 py-1 text-xs rounded-full ${reward.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
                              {reward.active ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                          <Gift className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-600 text-sm">النقاط المطلوبة</span>
                          <span className="font-bold text-purple-900 text-lg">{reward.pointsRequired}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedReward(reward);
                            setShowRewardModal(true);
                          }}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذه المكافأة؟')) {
                              setRewards(prev => prev.filter(r => r.id !== reward.id));
                              alert('تم حذف المكافأة بنجاح!');
                            }
                          }}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Store Settings */}
                <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">إعدادات المتجر</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">وصف المتجر</label>
                      <input
                        type="text"
                        value={storeSettings.description}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Points Settings */}
                <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">إعدادات النقاط</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نقاط لكل ريال</label>
                      <input
                        type="number"
                        value={storeSettings.pointsPerRiyal}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, pointsPerRiyal: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للاستبدال</label>
                      <input
                        type="number"
                        value={storeSettings.minimumRedeem}
                        onChange={(e) => setStoreSettings(prev => ({ ...prev, minimumRedeem: parseInt(e.target.value) || 100 }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Level Settings */}
                <div className="bg-white/60 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">إعدادات المستويات</h4>
                  <div className="space-y-4">
                    {Object.entries(storeSettings.levels).map(([level, config]) => (
                      <div key={level} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: config.color }}
                        ></div>
                        <div className="flex-1">
                          <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">من</span>
                          <input
                            type="number"
                            value={config.min}
                            onChange={(e) => {
                              const newMin = parseInt(e.target.value) || 0;
                              setStoreSettings(prev => ({
                                ...prev,
                                levels: {
                                  ...prev.levels,
                                  [level]: { ...config, min: newMin }
                                }
                              }));
                            }}
                            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                          <span className="text-sm text-gray-600">إلى</span>
                          <input
                            type="number"
                            value={config.max === Infinity ? 999999 : config.max}
                            onChange={(e) => {
                              const newMax = parseInt(e.target.value) || 999999;
                              setStoreSettings(prev => ({
                                ...prev,
                                levels: {
                                  ...prev.levels,
                                  [level]: { ...config, max: newMax === 999999 ? Infinity : newMax }
                                }
                              }));
                            }}
                            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => alert('تم حفظ الإعدادات بنجاح!')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                  >
                    حفظ الإعدادات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          storeSettings={storeSettings}
          customers={customers}
          setCustomers={setCustomers}
          generateCardNumber={generateCardNumber}
          getCustomerLevel={getCustomerLevel}
        />
      )}

      {showAddPoints && (
        <AddPointsModal
          onClose={() => setShowAddPoints(false)}
          pointsData={pointsData}
          setPointsData={setPointsData}
          customers={customers}
          setCustomers={setCustomers}
          storeSettings={storeSettings}
          getLevelName={getLevelName}
          getCustomerLevel={getCustomerLevel}
        />
      )}

      {showRewardModal && (
        <RewardModal
          onClose={() => setShowRewardModal(false)}
          selectedReward={selectedReward}
          setSelectedReward={setSelectedReward}
          newReward={newReward}
          setNewReward={setNewReward}
          rewards={rewards}
          setRewards={setRewards}
        />
      )}

      {showReports && (
        <ReportsModal
          onClose={() => setShowReports(false)}
          customers={customers}
          rewards={rewards}
          storeSettings={storeSettings}
          getLevelColor={getLevelColor}
          getLevelName={getLevelName}
        />
      )}
    </div>
  );
};

export default LoyaltySystem;